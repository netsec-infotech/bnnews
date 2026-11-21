import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { NewsStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';

// Breaking News
export async function getAdminBreakingNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await prisma.breakingNews.findMany({
      include: {
        news: {
          select: {
            id: true,
            titleGu: true,
            slug: true,
            status: true,
            category: { select: { nameGu: true } },
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function addBreakingNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      newsId: z.string().uuid(),
      tickerText: z.string().optional(),
      order: z.number().default(0),
      isActive: z.boolean().default(true),
      startTime: z.string().optional().nullable(),
      expiryTime: z.string().optional().nullable(),
    });

    const data = schema.parse(req.body);

    const news = await prisma.news.findUnique({ where: { id: data.newsId } });
    if (!news) {
      res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
      return;
    }

    if (news.status !== NewsStatus.PUBLISHED) {
      res.status(400).json({ success: false, message: 'માત્ર પ્રકાશિત (PUBLISHED) સમાચાર જ બ્રેકિંગ ન્યૂઝમાં ઉમેરી શકાય છે.' });
      return;
    }

    const breaking = await prisma.breakingNews.upsert({
      where: { newsId: data.newsId },
      update: {
        tickerText: data.tickerText || news.titleGu,
        order: data.order,
        isActive: data.isActive,
        startTime: data.startTime ? new Date(data.startTime) : null,
        expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
      },
      create: {
        newsId: data.newsId,
        tickerText: data.tickerText || news.titleGu,
        order: data.order,
        isActive: data.isActive,
        startTime: data.startTime ? new Date(data.startTime) : null,
        expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
      },
    });

    await prisma.news.update({
      where: { id: data.newsId },
      data: { isBreaking: true },
    });

    res.json({ success: true, message: 'બ્રેકિંગ ન્યૂઝ ટિકરમાં ઉમેરાયા', data: breaking });
  } catch (error) {
    next(error);
  }
}

export async function deleteBreakingNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const item = await prisma.breakingNews.findUnique({ where: { id } });
    if (item) {
      await prisma.breakingNews.delete({ where: { id } });
      await prisma.news.update({
        where: { id: item.newsId },
        data: { isBreaking: false },
      });
    }

    res.json({ success: true, message: 'બ્રેકિંગ ન્યૂઝમાંથી દૂર કરવામાં આવ્યા' });
  } catch (error) {
    next(error);
  }
}

// Trending News
export async function getAdminTrendingNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await prisma.trendingNews.findMany({
      include: {
        news: {
          select: {
            id: true,
            titleGu: true,
            slug: true,
            featuredImage: true,
            publishedAt: true,
            status: true,
            category: { select: { nameGu: true } },
          },
        },
      },
      orderBy: { priority: 'asc' },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function addTrendingNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const schema = z.object({
      newsId: z.string().uuid(),
      priority: z.number().default(0),
      isActive: z.boolean().default(true),
    });

    const data = schema.parse(req.body);

    const news = await prisma.news.findUnique({ where: { id: data.newsId } });
    if (!news) {
      res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
      return;
    }

    if (news.status !== NewsStatus.PUBLISHED) {
      res.status(400).json({ success: false, message: 'માત્ર પ્રકાશિત (PUBLISHED) સમાચાર જ ટ્રેન્ડિંગમાં ઉમેરી શકાય છે.' });
      return;
    }

    const trending = await prisma.trendingNews.upsert({
      where: { newsId: data.newsId },
      update: {
        priority: data.priority,
        isActive: data.isActive,
      },
      create: {
        newsId: data.newsId,
        priority: data.priority,
        isActive: data.isActive,
      },
    });

    await prisma.news.update({
      where: { id: data.newsId },
      data: { isTrending: true },
    });

    res.json({ success: true, message: 'ટ્રેન્ડિંગ ન્યૂઝમાં ઉમેરાયા', data: trending });
  } catch (error) {
    next(error);
  }
}

export async function deleteTrendingNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const item = await prisma.trendingNews.findUnique({ where: { id } });
    if (item) {
      await prisma.trendingNews.delete({ where: { id } });
      await prisma.news.update({
        where: { id: item.newsId },
        data: { isTrending: false },
      });
    }

    res.json({ success: true, message: 'ટ્રેન્ડિંગમાંથી દૂર કરવામાં આવ્યા' });
  } catch (error) {
    next(error);
  }
}
