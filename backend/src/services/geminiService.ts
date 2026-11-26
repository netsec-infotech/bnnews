import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/index.js';
import { prisma } from '../config/prisma.js';

let genAI: GoogleGenerativeAI | null = null;
let cachedKey: string | null = null;

export async function getActiveGeminiApiKey(): Promise<string> {
  // 1. Check if configured in website settings table (allowing live updates from Admin Settings UI)
  try {
    const dbSetting = await prisma.websiteSetting.findUnique({
      where: { key: 'gemini_api_key' },
    });
    if (dbSetting?.value && dbSetting.value.trim().length > 10) {
      return dbSetting.value.trim();
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Check environment variable
  const envKey = process.env.GEMINI_API_KEY || config.geminiApiKey;
  if (envKey && envKey.trim().length > 10) {
    return envKey.trim();
  }

  throw new Error(
    'Google Gemini API Key રૂપરેખાંકિત નથી. કૃપા કરીને નવી API Key એડમિન સેટિંગ્સ (Settings -> AI) અથવા backend/.env માં GEMINI_API_KEY તરીકે દાખલ કરો.'
  );
}

async function getGenAI(): Promise<GoogleGenerativeAI> {
  const apiKey = await getActiveGeminiApiKey();
  if (!genAI || cachedKey !== apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    cachedKey = apiKey;
  }
  return genAI;
}

export interface GenerateNewsOptions {
  rawContent: string;
  language?: 'gu' | 'hi' | 'en';
  tone?: string;
  category?: string;
}

export interface GeneratedNewsResult {
  headline: string;
  subheadline: string;
  body: string;
  summary: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  suggestedCategory?: string;
  language: string;
}

/**
 * Clean Markdown JSON blocks if returned by Gemini
 */
function extractJsonFromResponse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (err) {
    const cleaned = text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*$/gi, '')
      .trim();
    return JSON.parse(cleaned);
  }
}

/**
 * Robust call with fallback models in case of quota / model changes
 */
async function generateContentWithFallback(prompt: string): Promise<string> {
  const ai = await getGenAI();
  const configuredModel = config.geminiModel || 'gemini-1.5-flash';
  const candidateModels = Array.from(
    new Set([
      configuredModel,
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-pro',
      'gemini-flash-latest',
    ])
  );

  let lastError: any = null;
  for (const modelName of candidateModels) {
    try {
      const model = ai.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${modelName} encountered: ${err.message}. Trying next candidate if available...`);
    }
  }

  throw lastError || new Error('All Gemini model candidates failed.');
}

/**
 * 1. Generate full news article from raw input
 */
export async function generateNewsArticle(opts: GenerateNewsOptions): Promise<GeneratedNewsResult> {
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
export async function rewriteNews(params: {
  content: string;
  language?: 'gu' | 'hi' | 'en';
  instructions?: string;
}): Promise<{ rewrittenContent: string; headline?: string }> {
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
export async function translateNews(params: {
  title: string;
  content: string;
  summary?: string;
  toLanguage: 'gu' | 'hi' | 'en';
}): Promise<{ title: string; content: string; summary: string; seoTitle: string; seoDescription: string }> {
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
export async function generateHeadlines(params: {
  content: string;
  language?: 'gu' | 'hi' | 'en';
  count?: number;
}): Promise<string[]> {
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
export async function summarizeNews(params: {
  content: string;
  language?: 'gu' | 'hi' | 'en';
  bulletPoints?: boolean;
}): Promise<{ summary: string; keyPoints: string[] }> {
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
