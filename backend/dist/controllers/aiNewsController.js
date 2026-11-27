"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGenerateNews = handleGenerateNews;
exports.handleRecreateNews = handleRecreateNews;
exports.handleRewriteNews = handleRewriteNews;
exports.handleTranslateNews = handleTranslateNews;
exports.handleGenerateHeadlines = handleGenerateHeadlines;
exports.handleSummarizeNews = handleSummarizeNews;
const geminiService_js_1 = require("../services/geminiService.js");
async function handleGenerateNews(req, res) {
    try {
        const rawContent = req.body.rawContent || req.body.prompt || req.body.content;
        const { language, tone, category } = req.body;
        if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
            return res.status(400).json({ success: false, message: 'કાચી સામગ્રી (Raw content) દાખલ કરવી જરૂરી છે.' });
        }
        const result = await (0, geminiService_js_1.generateNewsArticle)({
            rawContent,
            language: language || 'gu',
            tone,
            category,
        });
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Gemini generateNews error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'AI સમાચાર બનાવવામાં ક્ષતિ આવી. કૃપા કરીને API કી તપાસો.',
        });
    }
}
async function handleRecreateNews(req, res) {
    try {
        const rawContent = req.body.rawContent || req.body.content || req.body.originalContent;
        const { language, tone, category, articleId } = req.body;
        if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
            return res.status(400).json({ success: false, message: 'મૂળ સમાચાર સામગ્રી (Original content) દાખલ કરવી જરૂરી છે.' });
        }
        const result = await (0, geminiService_js_1.generateNewsArticle)({
            rawContent,
            language: language || 'gu',
            tone: tone || 'STANDARD',
            category,
        });
        return res.json({
            success: true,
            message: 'AI દ્વારા સમાચાર સફળતાપૂર્વક પુનઃનિર્માણ કરવામાં આવ્યા',
            data: result,
            articleId,
        });
    }
    catch (error) {
        console.error('Gemini recreateNews error:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'AI સમાચાર પુનઃનિર્માણ નિષ્ફળ ગયું.',
        });
    }
}
async function handleRewriteNews(req, res) {
    try {
        const { content, language, instructions } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: 'સમાચાર સામગ્રી આપવી જરૂરી છે.' });
        }
        const result = await (0, geminiService_js_1.rewriteNews)({ content, language, instructions });
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Gemini rewrite error:', error);
        return res.status(500).json({ success: false, message: error.message || 'AI રીરાઇટિંગ નિષ્ફળ ગયું.' });
    }
}
async function handleTranslateNews(req, res) {
    try {
        const { title, content, summary, toLanguage } = req.body;
        if (!content && !title) {
            return res.status(400).json({ success: false, message: 'અનુવાદ માટે સામગ્રી જરૂરી છે.' });
        }
        if (!toLanguage || !['gu', 'hi', 'en'].includes(toLanguage)) {
            return res.status(400).json({ success: false, message: 'અમાન્ય ભાષા વિકલ્પ (gu, hi, en).' });
        }
        const result = await (0, geminiService_js_1.translateNews)({
            title: title || '',
            content: content || '',
            summary,
            toLanguage,
        });
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Gemini translate error:', error);
        return res.status(500).json({ success: false, message: error.message || 'AI અનુવાદ નિષ્ફળ ગયું.' });
    }
}
async function handleGenerateHeadlines(req, res) {
    try {
        const { content, language, count } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: 'સમાચાર સામગ્રી જરૂરી છે.' });
        }
        const headlines = await (0, geminiService_js_1.generateHeadlines)({ content, language, count: count || 5 });
        return res.json({ success: true, data: headlines });
    }
    catch (error) {
        console.error('Gemini headlines error:', error);
        return res.status(500).json({ success: false, message: error.message || 'હેડલાઇન્સ બનાવવામાં ક્ષતિ આવી.' });
    }
}
async function handleSummarizeNews(req, res) {
    try {
        const { content, language, bulletPoints } = req.body;
        if (!content) {
            return res.status(400).json({ success: false, message: 'સમાચાર સામગ્રી જરૂરી છે.' });
        }
        const result = await (0, geminiService_js_1.summarizeNews)({ content, language, bulletPoints });
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('Gemini summarize error:', error);
        return res.status(500).json({ success: false, message: error.message || 'સારાંશ બનાવવામાં ક્ષતિ આવી.' });
    }
}
