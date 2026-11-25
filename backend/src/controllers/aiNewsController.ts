import { Request, Response } from 'express';
import {
  generateNewsArticle,
  rewriteNews,
  translateNews,
  generateHeadlines,
  summarizeNews,
} from '../services/geminiService.js';

export async function handleGenerateNews(req: Request, res: Response) {
  try {
    const rawContent = req.body.rawContent || req.body.prompt || req.body.content;
    const { language, tone, category } = req.body;
    if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
      return res.status(400).json({ success: false, message: 'કાચી સામગ્રી (Raw content) દાખલ કરવી જરૂરી છે.' });
    }

    const result = await generateNewsArticle({
      rawContent,
      language: language || 'gu',
      tone,
      category,
    });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Gemini generateNews error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI સમાચાર બનાવવામાં ક્ષતિ આવી. કૃપા કરીને API કી તપાસો.',
    });
  }
}

export async function handleRecreateNews(req: Request, res: Response) {
  try {
    const rawContent = req.body.rawContent || req.body.content || req.body.originalContent;
    const { language, tone, category, articleId } = req.body;
    if (!rawContent || typeof rawContent !== 'string' || !rawContent.trim()) {
      return res.status(400).json({ success: false, message: 'મૂળ સમાચાર સામગ્રી (Original content) દાખલ કરવી જરૂરી છે.' });
    }

    const result = await generateNewsArticle({
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
  } catch (error: any) {
    console.error('Gemini recreateNews error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI સમાચાર પુનઃનિર્માણ નિષ્ફળ ગયું.',
    });
  }
}

export async function handleRewriteNews(req: Request, res: Response) {
  try {
    const { content, language, instructions } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'સમાચાર સામગ્રી આપવી જરૂરી છે.' });
    }

    const result = await rewriteNews({ content, language, instructions });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Gemini rewrite error:', error);
    return res.status(500).json({ success: false, message: error.message || 'AI રીરાઇટિંગ નિષ્ફળ ગયું.' });
  }
}

export async function handleTranslateNews(req: Request, res: Response) {
  try {
    const { title, content, summary, toLanguage } = req.body;
    if (!content && !title) {
      return res.status(400).json({ success: false, message: 'અનુવાદ માટે સામગ્રી જરૂરી છે.' });
    }
    if (!toLanguage || !['gu', 'hi', 'en'].includes(toLanguage)) {
      return res.status(400).json({ success: false, message: 'અમાન્ય ભાષા વિકલ્પ (gu, hi, en).' });
    }

    const result = await translateNews({
      title: title || '',
      content: content || '',
      summary,
      toLanguage,
    });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Gemini translate error:', error);
    return res.status(500).json({ success: false, message: error.message || 'AI અનુવાદ નિષ્ફળ ગયું.' });
  }
}

export async function handleGenerateHeadlines(req: Request, res: Response) {
  try {
    const { content, language, count } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'સમાચાર સામગ્રી જરૂરી છે.' });
    }

    const headlines = await generateHeadlines({ content, language, count: count || 5 });
    return res.json({ success: true, data: headlines });
  } catch (error: any) {
    console.error('Gemini headlines error:', error);
    return res.status(500).json({ success: false, message: error.message || 'હેડલાઇન્સ બનાવવામાં ક્ષતિ આવી.' });
  }
}

export async function handleSummarizeNews(req: Request, res: Response) {
  try {
    const { content, language, bulletPoints } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'સમાચાર સામગ્રી જરૂરી છે.' });
    }

    const result = await summarizeNews({ content, language, bulletPoints });
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Gemini summarize error:', error);
    return res.status(500).json({ success: false, message: error.message || 'સારાંશ બનાવવામાં ક્ષતિ આવી.' });
  }
}
