import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { NewsStatus, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { generateSlug } from '../utils/slugify.js';
import { logAuditAction } from '../services/auditService.js';

const newsInputSchema = z.object({
  titleGu: z.string().min(5, 'ગુજરાતી હેડલાઇન ઓછામાં ઓછી 5 અક્ષરોની હોવી જોઈએ'),
  title: z.string().optional().default(''),
  descriptionGu: z.string().optional(),
  description: z.string().optional(),
  content: z.string().min(20, 'સમાચાર સામગ્રી ઓછામાં ઓછી 20 અક્ષરોની હોવી જોઈએ'),
  categoryId: z.string().uuid('માન્ય કેટેગરી પસંદ કરો'),
  featuredImage: z.string().optional().nullable(),
  additionalImages: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  isBreaking: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED']).optional().default('DRAFT'),
});

export async function getAdminNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
    const skip = (page - 1) * limit;

    const statusParam = req.query.status as string | undefined;
    const categoryId = req.query.categoryId as string | undefined;
    const sourceId = req.query.sourceId as string | undefined;
    const search = req.query.search as string | undefined;

    const where: any = {};

    if (statusParam && statusParam !== 'ALL') {
      where.status = statusParam as NewsStatus;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sourceId) {
      where.sourceId = sourceId;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { titleGu: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { descriptionGu: { contains: q, mode: 'insensitive' } },
        { source: { name: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        include: {
          category: {
            select: { id: true, nameGu: true, name: true, slug: true },
          },
          source: {
            select: { id: true, name: true, attributionName: true },
          },
          author: {
            select: { id: true, name: true, email: true },
          },
          sourceItem: {
            select: {
              title: true,
              description: true,
              rawImageUrl: true,
              publishedDate: true,
              sourceUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    res.json({
      success: true,
      data: items,
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

export async function getAdminNewsById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const article = await prisma.news.findUnique({
      where: { id },
      include: {
        category: true,
        source: true,
        author: {
          select: { id: true, name: true, email: true },
        },
        sourceItem: true, // Complete original RSS raw content for side-by-side editor!
      },
    });

    if (!article) {
      res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
      return;
    }

    res.json({ success: true, data: article });
  } catch (error) {
    next(error);
  }
}

export async function createManualNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = newsInputSchema.parse(req.body);
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Reporters can only save as DRAFT or submit for approval (PENDING)
    let finalStatus = data.status as NewsStatus;
    if (finalStatus === NewsStatus.PUBLISHED && userRole === Role.REPORTER) {
      finalStatus = NewsStatus.PENDING;
    }

    const slug = generateSlug(data.titleGu || data.title);

    const article = await prisma.news.create({
      data: {
        title: data.title || data.titleGu,
        titleGu: data.titleGu,
        slug,
        description: data.description || data.descriptionGu,
        descriptionGu: data.descriptionGu,
        content: data.content,
        featuredImage: data.featuredImage || null,
        additionalImages: data.additionalImages,
        categoryId: data.categoryId,
        authorId: userId,
        status: finalStatus,
        isBreaking: data.isBreaking,
        isTrending: data.isTrending,
        isFeatured: data.isFeatured,
        seoTitle: data.seoTitle || data.titleGu.substring(0, 70),
        seoDescription: data.seoDescription || data.descriptionGu?.substring(0, 160),
        tags: data.tags,
        publishedAt: finalStatus === NewsStatus.PUBLISHED ? new Date() : null,
      },
    });

    // If marked breaking and published
    if (finalStatus === NewsStatus.PUBLISHED && data.isBreaking) {
      await prisma.breakingNews.upsert({
        where: { newsId: article.id },
        update: { isActive: true, tickerText: data.titleGu },
        create: { newsId: article.id, tickerText: data.titleGu, isActive: true },
      });
    }

    // If marked trending and published
    if (finalStatus === NewsStatus.PUBLISHED && data.isTrending) {
      await prisma.trendingNews.upsert({
        where: { newsId: article.id },
        update: { isActive: true },
        create: { newsId: article.id, priority: 1, isActive: true },
      });
    }

    await logAuditAction({
      userId,
      action: 'CREATE_NEWS',
      targetType: 'NEWS',
      targetId: article.id,
      details: { titleGu: data.titleGu, status: finalStatus },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: 'સમાચાર સફળતાપૂર્વક સાચવવામાં આવ્યા',
      data: article,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateAdminNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = newsInputSchema.partial().parse(req.body);
    const userId = req.user?.userId;

    const existing = await prisma.news.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
      return;
    }

    // Check reporter editing restrictions
    if (req.user?.role === Role.REPORTER && existing.authorId !== userId) {
      res.status(403).json({ success: false, message: 'તમે માત્ર તમારા પોતાના સમાચાર સંપાદિત કરી શકો છો' });
      return;
    }

    const updated = await prisma.news.update({
      where: { id },
      data: {
        ...(data.titleGu && { titleGu: data.titleGu }),
        ...(data.title && { title: data.title }),
        ...(data.descriptionGu !== undefined && { descriptionGu: data.descriptionGu }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.content && { content: data.content }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
        ...(data.additionalImages && { additionalImages: data.additionalImages }),
        ...(data.tags && { tags: data.tags }),
        ...(data.isBreaking !== undefined && { isBreaking: data.isBreaking }),
        ...(data.isTrending !== undefined && { isTrending: data.isTrending }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
      },
    });

    await logAuditAction({
      userId,
      action: 'UPDATE_NEWS',
      targetType: 'NEWS',
      targetId: id,
      details: data,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'સમાચાર સફળતાપૂર્વક અપડેટ થયા', data: updated });
  } catch (error) {
    next(error);
  }
}

export async function publishNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // Server-side authorization check: Only SUPER_ADMIN, ADMIN and authorized EDITOR can publish
    if (!([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR] as Role[]).includes(req.user?.role as Role)) {
      res.status(403).json({ success: false, message: 'સમાચાર પ્રકાશિત કરવાની પરવાનગી નથી' });
      return;
    }

    const article = await prisma.news.findUnique({ where: { id } });
    if (!article) {
      res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
      return;
    }

    // Require Gujarati headline and content before publication
    if (!article.titleGu || article.titleGu.trim().length < 5) {
      res.status(400).json({ success: false, message: 'પ્રકાશન માટે માન્ય ગુજરાતી હેડલાઇન આવશ્યક છે' });
      return;
    }

    const published = await prisma.news.update({
      where: { id },
      data: {
        status: NewsStatus.PUBLISHED,
        publishedAt: article.publishedAt || new Date(),
      },
    });

    // If marked breaking, ensure active in breaking ticker
    if (published.isBreaking) {
      await prisma.breakingNews.upsert({
        where: { newsId: id },
        update: { isActive: true, tickerText: published.titleGu },
        create: { newsId: id, tickerText: published.titleGu, isActive: true },
      });
    }

    // If marked trending, ensure active in trending
    if (published.isTrending) {
      await prisma.trendingNews.upsert({
        where: { newsId: id },
        update: { isActive: true },
        create: { newsId: id, priority: 1, isActive: true },
      });
    }

    await logAuditAction({
      userId,
      action: 'PUBLISH_NEWS',
      targetType: 'NEWS',
      targetId: id,
      details: { titleGu: published.titleGu },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'સમાચાર સફળતાપૂર્વક મંજૂર કરી વેબસાઇટ પર પ્રકાશિત કરવામાં આવ્યા!',
      data: published,
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR] as Role[]).includes(req.user?.role as Role)) {
      res.status(403).json({ success: false, message: 'સમાચાર નકારવાની પરવાનગી નથી' });
      return;
    }

    const rejected = await prisma.news.update({
      where: { id },
      data: { status: NewsStatus.REJECTED },
    });

    // Remove from breaking & trending if exists
    await Promise.all([
      prisma.breakingNews.deleteMany({ where: { newsId: id } }),
      prisma.trendingNews.deleteMany({ where: { newsId: id } }),
    ]);

    await logAuditAction({
      userId,
      action: 'REJECT_NEWS',
      targetType: 'NEWS',
      targetId: id,
      details: { reason: req.body.reason || 'સંપાદક દ્વારા નકારવામાં આવ્યું' },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: 'સમાચાર નકારવામાં આવ્યા (Status: REJECTED)',
      data: rejected,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(req.user?.role as Role)) {
      res.status(403).json({ success: false, message: 'સમાચાર કાઢી નાખવાની પરવાનગી માત્ર એડમિન પાસે છે' });
      return;
    }

    await prisma.news.delete({ where: { id } });

    await logAuditAction({
      userId,
      action: 'DELETE_NEWS',
      targetType: 'NEWS',
      targetId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'સમાચાર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા' });
  } catch (error) {
    next(error);
  }
}

export async function bulkDeleteNews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { ids } = req.body;
    const userId = req.user?.userId;

    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ success: false, message: 'કોઈ સમાચાર પસંદ કરવામાં આવ્યા નથી' });
      return;
    }

    if (!([Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR] as Role[]).includes(req.user?.role as Role)) {
      res.status(403).json({ success: false, message: 'સમાચાર કાઢી નાખવાની પરવાનગી નથી' });
      return;
    }

    const result = await prisma.news.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    await logAuditAction({
      userId,
      action: 'BULK_DELETE_NEWS',
      targetType: 'NEWS',
      targetId: ids.slice(0, 10).join(','),
      details: { deletedCount: result.count },
      ipAddress: req.ip,
    });

    res.json({
      success: true,
      message: `${result.count} સમાચાર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા`,
      deletedCount: result.count,
    });
  } catch (error) {
    next(error);
  }
}

