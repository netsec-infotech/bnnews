import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { NewsStatus } from '@prisma/client';

export async function getPublicNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 12));
    const skip = (page - 1) * limit;

    const categorySlug = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const isFeatured = req.query.featured === 'true' ? true : undefined;

    const where: any = {
      status: NewsStatus.PUBLISHED,
    };

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (search && search.trim().length > 0) {
      const q = search.trim();
      where.OR = [
        { titleGu: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { descriptionGu: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        select: {
          id: true,
          title: true,
          titleGu: true,
          slug: true,
          description: true,
          descriptionGu: true,
          featuredImage: true,
          publishedAt: true,
          createdAt: true,
          viewsCount: true,
          isBreaking: true,
          isTrending: true,
          isFeatured: true,
          category: {
            select: {
              id: true,
              name: true,
              nameGu: true,
              slug: true,
            },
          },
          author: {
            select: {
              name: true,
              avatar: true,
            },
          },
          source: {
            select: {
              name: true,
              attributionName: true,
              websiteUrl: true,
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
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

export async function getNewsBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;

    const article = await prisma.news.findFirst({
      where: {
        slug,
        status: NewsStatus.PUBLISHED,
      },
      include: {
        category: true,
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        source: {
          select: {
            name: true,
            attributionName: true,
            websiteUrl: true,
          },
        },
      },
    });

    if (!article) {
      res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી (Article not found)' });
      return;
    }

    // Increment view count asynchronously
    prisma.news.update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } },
    }).catch((err) => console.error('Failed to increment view count:', err));

    // Fetch related news from same category
    const related = await prisma.news.findMany({
      where: {
        categoryId: article.categoryId,
        status: NewsStatus.PUBLISHED,
        id: { not: article.id },
      },
      select: {
        id: true,
        titleGu: true,
        slug: true,
        featuredImage: true,
        publishedAt: true,
        category: {
          select: { nameGu: true, slug: true },
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });

    res.json({
      success: true,
      data: article,
      related,
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        name: true,
        nameGu: true,
        slug: true,
        icon: true,
        order: true,
        description: true,
        _count: {
          select: {
            news: {
              where: { status: NewsStatus.PUBLISHED },
            },
          },
        },
      },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getBreakingNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const breaking = await prisma.breakingNews.findMany({
      where: {
        isActive: true,
        news: {
          status: NewsStatus.PUBLISHED,
        },
        OR: [
          { startTime: null, expiryTime: null },
          { startTime: { lte: now }, expiryTime: null },
          { startTime: null, expiryTime: { gte: now } },
          { startTime: { lte: now }, expiryTime: { gte: now } },
        ],
      },
      include: {
        news: {
          select: {
            id: true,
            titleGu: true,
            slug: true,
            category: {
              select: { slug: true, nameGu: true },
            },
          },
        },
      },
      orderBy: { order: 'asc' },
      take: 10,
    });

    res.json({ success: true, data: breaking });
  } catch (error) {
    next(error);
  }
}

export async function getTrendingNews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const trending = await prisma.trendingNews.findMany({
      where: {
        isActive: true,
        news: {
          status: NewsStatus.PUBLISHED,
        },
      },
      include: {
        news: {
          select: {
            id: true,
            titleGu: true,
            slug: true,
            featuredImage: true,
            publishedAt: true,
            category: {
              select: { slug: true, nameGu: true },
            },
          },
        },
      },
      orderBy: { priority: 'asc' },
      take: 10,
    });

    res.json({ success: true, data: trending });
  } catch (error) {
    next(error);
  }
}

export async function getPublicSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.websiteSetting.findMany();
    const settingMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingMap[s.key] = s.value;
    });

    res.json({ success: true, data: settingMap });
  } catch (error) {
    next(error);
  }
}
