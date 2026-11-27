"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActiveGeminiConfig = getActiveGeminiConfig;
exports.getActiveGeminiApiKey = getActiveGeminiApiKey;
exports.listAvailableGeminiModels = listAvailableGeminiModels;
exports.generateNewsArticle = generateNewsArticle;
exports.rewriteNews = rewriteNews;
exports.translateNews = translateNews;
exports.generateHeadlines = generateHeadlines;
exports.summarizeNews = summarizeNews;
const generative_ai_1 = require("@google/generative-ai");
const axios_1 = __importDefault(require("axios"));
const index_js_1 = require("../config/index.js");
const prisma_js_1 = require("../config/prisma.js");
let genAI = null;
let cachedKey = null;
// Cache discovered models per API key for 10 minutes
let cachedModels = [];
let cachedModelsKey = null;
let cachedModelsAt = 0;
const MODEL_CACHE_TTL_MS = 10 * 60 * 1000;
async function getActiveGeminiConfig() {
    let apiKey = '';
    let preferredModel = '';
    try {
        const dbSettings = await prisma_js_1.prisma.websiteSetting.findMany({
            where: { key: { in: ['gemini_api_key', 'gemini_model'] } },
        });
        for (const s of dbSettings) {
            if (s.key === 'gemini_api_key' && s.value?.trim().length > 10) {
                apiKey = s.value.trim();
            }
            if (s.key === 'gemini_model' && s.value?.trim()) {
                preferredModel = s.value.trim();
            }
        }
    }
    catch {
        // Continue to env fallback
    }
    if (!apiKey) {
        const envKey = process.env.GEMINI_API_KEY || index_js_1.config.geminiApiKey;
        if (envKey && envKey.trim().length > 10) {
            apiKey = envKey.trim();
        }
    }
    if (!apiKey) {
        throw new Error('Google Gemini API Key રૂપરેખાંકિત નથી. કૃપા કરીને નવી API Key એડમિન સેટિંગ્સ (Settings -> AI) અથવા backend/.env માં GEMINI_API_KEY તરીકે દાખલ કરો.');
    }
    if (!preferredModel) {
        preferredModel = process.env.GEMINI_MODEL || index_js_1.config.geminiModel || 'auto';
    }
    return { apiKey, preferredModel };
}
async function getActiveGeminiApiKey() {
    const { apiKey } = await getActiveGeminiConfig();
    return apiKey;
}
async function getGenAI() {
    const { apiKey, preferredModel } = await getActiveGeminiConfig();
    if (!genAI || cachedKey !== apiKey) {
        genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        cachedKey = apiKey;
    }
    return { ai: genAI, apiKey, preferredModel };
}
/**
 * Dynamically calls Google's ModelService.ListModels for the active API key
 * so we NEVER get 404 Not Found on deprecated/unavailable model names.
 */
async function listAvailableGeminiModels(apiKey, forceRefresh = false) {
    const now = Date.now();
    if (!forceRefresh &&
        cachedModels.length > 0 &&
        cachedModelsKey === apiKey &&
        now - cachedModelsAt < MODEL_CACHE_TTL_MS) {
        return cachedModels;
    }
    try {
        const res = await axios_1.default.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}&pageSize=100`, { timeout: 10000 });
        const rawModels = res.data?.models || [];
        const excludedTokens = [
            'embedding',
            'aqa',
            'tts',
            'image',
            'robotics',
            'computer-use',
            'deep-research',
            'vision',
            'bisection',
        ];
        const validModels = rawModels
            .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
            .map((m) => String(m.name || '').replace(/^models\//, ''))
            .filter((name) => name.startsWith('gemini') &&
            !excludedTokens.some((tok) => name.toLowerCase().includes(tok)));
        // Score models so latest stable flash/pro models are tried first
        const scoreModel = (name) => {
            const n = name.toLowerCase();
            if (n === 'gemini-2.5-flash')
                return 100;
            if (n === 'gemini-2.5-pro')
                return 95;
            if (n === 'gemini-2.0-flash')
                return 90;
            if (n.includes('2.5') && n.includes('flash') && !n.includes('lite'))
                return 85;
            if (n.includes('2.5') && n.includes('pro'))
                return 82;
            if (n.includes('2.0') && n.includes('flash') && !n.includes('lite'))
                return 80;
            if (n.includes('flash') && !n.includes('lite') && !n.includes('latest'))
                return 70;
            if (n.includes('pro') && !n.includes('latest'))
                return 65;
            if (n.includes('lite'))
                return 50;
            if (n.includes('latest'))
                return 30;
            return 40;
        };
        const sorted = Array.from(new Set(validModels)).sort((a, b) => scoreModel(b) - scoreModel(a));
        if (sorted.length > 0) {
            cachedModels = sorted;
            cachedModelsKey = apiKey;
            cachedModelsAt = now;
            console.log(`[Gemini] Discovered ${sorted.length} active models for key: ${sorted.slice(0, 6).join(', ')}`);
            return sorted;
        }
    }
    catch (err) {
        console.warn('[Gemini] ListModels failed, using modern fallback candidates:', err.message);
    }
    return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
}
/**
 * Clean Markdown JSON blocks if returned by Gemini
 */
function extractJsonFromResponse(text) {
    try {
        return JSON.parse(text);
    }
    catch (err) {
        const cleaned = text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*$/gi, '')
            .trim();
        return JSON.parse(cleaned);
    }
}
/**
 * Robust call with dynamic ListModels discovery + fallback across all available models
 */
async function generateContentWithFallback(prompt) {
    const { ai, apiKey, preferredModel } = await getGenAI();
    const discoveredModels = await listAvailableGeminiModels(apiKey);
    // Put user's preferred model first ONLY if it exists in the API's active model list (or if not 'auto')
    const candidateModels = Array.from(new Set([
        ...(preferredModel && preferredModel !== 'auto' && discoveredModels.includes(preferredModel)
            ? [preferredModel]
            : []),
        ...discoveredModels,
    ])).slice(0, 6);
    let lastError = null;
    for (const modelName of candidateModels) {
        // Try model with 1 retry on 503 (high demand) or 429
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const model = ai.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                if (text)
                    return text;
            }
            catch (err) {
                lastError = err;
                const msg = String(err.message || '');
                const is503or429 = msg.includes('503') ||
                    msg.includes('429') ||
                    msg.includes('high demand') ||
                    msg.includes('Overloaded');
                if (is503or429 && attempt === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 1200));
                    continue;
                }
                console.warn(`[Gemini] Model ${modelName} encountered: ${msg}. Trying next candidate...`);
                break;
            }
        }
    }
    const isHighDemand = lastError?.message?.includes('503') ||
        lastError?.message?.includes('high demand') ||
        lastError?.message?.includes('Overloaded');
    if (isHighDemand) {
        throw new Error('Google Gemini AI સર્વર પર અત્યારે અતિશય ટ્રાફિક છે. કૃપા કરીને થોડી સેકન્ડો પછી ફરી પ્રયાસ કરો.');
    }
    throw lastError || new Error('All Gemini model candidates failed.');
}
/**
 * 1. Generate full news article from raw input
 */
async function generateNewsArticle(opts) {
    const langNames = {
        gu: 'Gujarati (ગુજરાતી)',
        hi: 'Hindi (हिन्दी)',
        en: 'English',
    };
    const targetLang = opts.language || 'gu';
    const langLabel = langNames[targetLang] || 'Gujarati (ગુજરાતી)';
    const prompt = `
You are a senior professional journalist and news editor for "BN News Gujarati" (a 24x7 trusted digital news media channel).
Transform the following raw news notes, press release, or source text into a complete, high-quality, objective news article in ${langLabel}.

CRITICAL EDITORIAL RULES:
1. Output language MUST be ${langLabel}.
2. DO NOT invent facts, quotes, false statistics, dates, or names that are not in the source text.
3. Keep the tone professional, factual, objective, and engaging according to top Gujarati journalism standards.
4. Format the output strictly as a valid JSON object with NO surrounding markdown or markdown ticks.

Raw Source Material:
"""
${opts.rawContent}
"""

${opts.category ? `Target News Category: ${opts.category}` : ''}
${opts.tone ? `Tone Style: ${opts.tone}` : 'Tone Style: Neutral, authoritative, objective'}

Required JSON Structure:
{
  "headline": "A captivating, accurate headline in ${langLabel}",
  "subheadline": "An informative sub-headline or lead angle in ${langLabel}",
  "body": "Detailed news article body with 3-5 well-structured paragraphs in ${langLabel}",
  "summary": "Concise 2-3 sentence overview in ${langLabel}",
  "seoTitle": "Under 60 chars SEO optimized headline in ${langLabel}",
  "seoDescription": "Under 155 chars Google meta search snippet in ${langLabel}",
  "tags": ["3-5", "relevant", "Gujarati", "tags"],
  "suggestedCategory": "gujarat | india | world | business | sports | entertainment | tech"
}
`;
    const rawText = await generateContentWithFallback(prompt);
    const parsed = extractJsonFromResponse(rawText);
    return {
        headline: parsed.headline || 'નવા સમાચાર અહેવાલ',
        subheadline: parsed.subheadline || '',
        body: parsed.body || opts.rawContent,
        summary: parsed.summary || '',
        seoTitle: parsed.seoTitle || parsed.headline || '',
        seoDescription: parsed.seoDescription || parsed.summary || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : ['ગુજરાત', 'સમાચાર'],
        suggestedCategory: parsed.suggestedCategory,
        language: targetLang,
    };
}
/**
 * 2. Rewrite or enhance news
 */
async function rewriteNews(params) {
    const targetLang = params.language || 'gu';
    const prompt = `
You are a senior copy editor for BN News Gujarati.
Rewrite and polish the following news content to make it clear, grammatically flawless, engaging, and professional in ${targetLang === 'gu' ? 'Gujarati' : targetLang === 'hi' ? 'Hindi' : 'English'}.
Preserve all factual facts, numbers, dates, and quotes. Do not add fictitious information.
${params.instructions ? `Specific editorial instructions: ${params.instructions}` : ''}

News Content:
"""
${params.content}
"""

Return strictly valid JSON:
{
  "headline": "Polished, impactful headline",
  "rewrittenContent": "Polished news body"
}
`;
    const rawText = await generateContentWithFallback(prompt);
    const parsed = extractJsonFromResponse(rawText);
    return {
        rewrittenContent: parsed.rewrittenContent || parsed.body || rawText,
        headline: parsed.headline,
    };
}
/**
 * 3. Translate news between Gujarati, Hindi, and English
 */
async function translateNews(params) {
    const targetName = params.toLanguage === 'gu' ? 'Gujarati' : params.toLanguage === 'hi' ? 'Hindi' : 'English';
    const prompt = `
Translate the following news article accurately into ${targetName} for a digital news publication.
Ensure journalistic flow, local cultural accuracy, and professional terminology in ${targetName}.
Keep all names, dates, and factual numbers exact.

Title: ${params.title}
Summary: ${params.summary || ''}
Content:
${params.content}

Return strictly valid JSON:
{
  "title": "Translated headline in ${targetName}",
  "content": "Translated full content in ${targetName}",
  "summary": "Translated short summary in ${targetName}",
  "seoTitle": "SEO title in ${targetName}",
  "seoDescription": "Meta description in ${targetName}"
}
`;
    const rawText = await generateContentWithFallback(prompt);
    const parsed = extractJsonFromResponse(rawText);
    return {
        title: parsed.title || '',
        content: parsed.content || '',
        summary: parsed.summary || '',
        seoTitle: parsed.seoTitle || parsed.title || '',
        seoDescription: parsed.seoDescription || parsed.summary || '',
    };
}
/**
 * 4. Generate Alternative Headlines
 */
async function generateHeadlines(params) {
    const count = params.count || 5;
    const lang = params.language || 'gu';
    const prompt = `
Based on the following news article, suggest ${count} distinct, highly engaging, click-worthy (yet truthful and non-clickbait) headlines in ${lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'English'}.

Article:
"""
${params.content}
"""

Return strictly valid JSON:
{
  "headlines": ["Headline 1", "Headline 2", "Headline 3"]
}
`;
    const rawText = await generateContentWithFallback(prompt);
    const parsed = extractJsonFromResponse(rawText);
    return Array.isArray(parsed.headlines) ? parsed.headlines : [];
}
/**
 * 5. Summarize News
 */
async function summarizeNews(params) {
    const lang = params.language || 'gu';
    const prompt = `
Summarize the following news article in ${lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'English'}.
Provide a short 2-3 sentence overview paragraph and 3-5 concise bullet points highlighting the most important key facts.

Article:
"""
${params.content}
"""

Return strictly valid JSON:
{
  "summary": "2-3 sentence summary in ${lang}",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"]
}
`;
    const rawText = await generateContentWithFallback(prompt);
    const parsed = extractJsonFromResponse(rawText);
    return {
        summary: parsed.summary || '',
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
    };
}
