import { Response, NextFunction } from 'express';
import { z } from 'zod';
import Parser from 'rss-parser';
import { prisma } from '../config/prisma.js';
import { SourceStatus, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { fetchRssSource } from '../services/rssService.js';
import { queueRssFetch } from '../workers/rssWorker.js';
import { logAuditAction } from '../services/auditService.js';

const parser = new Parser({ timeout: 10000 });

const rssSourceSchema = z.object({
  name: z.string().min(2, 'સ્ત્રોત નામ આવશ્યક છે'),
  feedUrl: z.string().url('માન્ય RSS ફીડ URL દાખલ કરો'),
  websiteUrl: z.string().url('માન્ય વેબસાઇટ URL દાખલ કરો').optional().nullable(),
  defaultCategoryId: z.string().uuid('માન્ય કેટેગરી પસંદ કરો').optional().nullable(),
  collectionInterval: z.number().min(5).max(1440).default(30),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  language: z.string().default('gu'),
  attributionName: z.string().optional().nullable(),
});

export async function getRssSources(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sources = await prisma.rssSource.findMany({
      include: {
        defaultCategory: { select: { id: true, nameGu: true, name: true } },
        _count: {
          select: {
            news: true,
            sourceItems: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: sources });
  } catch (error) {
    next(error);
  }
}

export async function createRssSource(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = rssSourceSchema.parse(req.body);

    const existing = await prisma.rssSource.findUnique({
      where: { feedUrl: data.feedUrl },
    });
    if (existing) {
      res.status(400).json({ success: false, message: 'આ RSS Feed URL પહેલેથી અસ્તિત્વમાં છે.' });
      return;
    }

    const source = await prisma.rssSource.create({
      data: {
        name: data.name,
        feedUrl: data.feedUrl,
        websiteUrl: data.websiteUrl || null,
        defaultCategoryId: data.defaultCategoryId || null,
        collectionInterval: data.collectionInterval,
        status: data.status as SourceStatus,
        language: data.language,
        attributionName: data.attributionName || data.name,
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'CREATE_RSS_SOURCE',
      targetType: 'RSS_SOURCE',
      targetId: source.id,
      details: { name: source.name, feedUrl: source.feedUrl },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'RSS સ્ત્રોત સફળતાપૂર્વક ઉમેરવામાં આવ્યો', data: source });
  } catch (error) {
    next(error);
  }
}

export async function updateRssSource(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = rssSourceSchema.partial().parse(req.body);

    const source = await prisma.rssSource.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.feedUrl && { feedUrl: data.feedUrl }),
        ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
        ...(data.defaultCategoryId !== undefined && { defaultCategoryId: data.defaultCategoryId }),
        ...(data.collectionInterval && { collectionInterval: data.collectionInterval }),
        ...(data.status && { status: data.status as SourceStatus }),
        ...(data.language && { language: data.language }),
        ...(data.attributionName !== undefined && { attributionName: data.attributionName }),
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'UPDATE_RSS_SOURCE',
      targetType: 'RSS_SOURCE',
      targetId: id,
      details: data,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'RSS સ્ત્રોત અપડેટ થયો', data: source });
  } catch (error) {
    next(error);
  }
}

export async function deleteRssSource(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(req.user?.role as Role)) {
      res.status(403).json({ success: false, message: 'પરવાનગી નકારી' });
      return;
    }

    await prisma.rssSource.delete({ where: { id } });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'DELETE_RSS_SOURCE',
      targetType: 'RSS_SOURCE',
      targetId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'RSS સ્ત્રોત કાઢી નાખવામાં આવ્યો' });
  } catch (error) {
    next(error);
  }
}

export async function testRssFeed(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const feedUrl = req.body.feedUrl;
    if (!feedUrl) {
      res.status(400).json({ success: false, message: 'Feed URL આવશ્યક છે' });
      return;
    }

    const feed = await parser.parseURL(feedUrl);
    const sampleItems = (feed.items || []).slice(0, 3).map((item) => ({
      title: item.title,
      link: item.link,
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet?.substring(0, 150),
    }));

    res.json({
      success: true,
      message: 'RSS ફીડ કનેક્શન સફળ રહ્યું!',
      feedTitle: feed.title,
      feedDescription: feed.description,
      totalItemsFound: feed.items?.length || 0,
      sampleItems,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: `RSS કનેક્શન નિષ્ફળ: ${error.message || 'અમાન્ય ફીડ XML'}`,
    });
  }
}

export async function triggerManualFetch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    // Directly execute fetch or queue it
    const result = await fetchRssSource(id);

    await logAuditAction({
      userId: req.user?.userId,
      action: 'MANUAL_RSS_FETCH',
      targetType: 'RSS_SOURCE',
      targetId: id,
      details: result,
      ipAddress: req.ip,
    });

    res.json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
}

export async function getRssLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const sourceId = req.query.sourceId as string | undefined;

    const where: any = {};
    if (sourceId) {
      where.sourceId = sourceId;
    }

    const [logs, total] = await Promise.all([
      prisma.rssLog.findMany({
        where,
        include: {
          source: { select: { id: true, name: true, feedUrl: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.rssLog.count({ where }),
    ]);

    res.json({
      success: true,
      data: logs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}
