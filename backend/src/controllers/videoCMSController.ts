import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { VideoSource, NewsStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';

// ==========================================
// 1. ADMIN VIDEO CMS
// ==========================================

export async function getAdminVideos(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { isReel, categoryId, search } = req.query;

    const where: any = {};
    if (isReel !== undefined) {
      where.isReel = isReel === 'true';
    }
    if (categoryId) {
      where.categoryId = String(categoryId);
    }
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { titleGu: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        category: { select: { id: true, name: true, nameGu: true, slug: true } },
        author: { select: { id: true, name: true } },
        _count: { select: { views: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: videos });
  } catch (err) {
    next(err);
  }
}

export async function createVideo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      title,
      titleGu,
      slug,
      description,
      videoSource,
      videoUrl,
      videoFile,
      thumbnailUrl,
      categoryId,
      duration,
      isFeatured,
      isTrending,
      isReel,
      showOnHome,
      showOnVideos,
      showOnReels,
    } = req.body;

    if (!titleGu || !videoUrl) {
      res.status(400).json({ success: false, message: 'Gujarati title and video URL are required' });
      return;
    }

    const videoSlug = slug || titleGu.toLowerCase().replace(/[^\w\u0A80-\u0AFF]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);

    const video = await prisma.video.create({
      data: {
        title: title || titleGu,
        titleGu,
        slug: videoSlug,
        description,
        videoSource: videoSource || VideoSource.YOUTUBE,
        videoUrl,
        videoFile,
        thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
        categoryId: categoryId || null,
        authorId: (req.user as any)?.id || null,
        duration: duration || '0:30',
        isFeatured: Boolean(isFeatured),
        isTrending: Boolean(isTrending),
        isReel: Boolean(isReel),
        showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : true,
        showOnVideos: showOnVideos !== undefined ? Boolean(showOnVideos) : true,
        showOnReels: Boolean(showOnReels),
        status: NewsStatus.PUBLISHED,
      },
      include: { category: true },
    });

    res.status(201).json({ success: true, data: video });
  } catch (err) {
    next(err);
  }
}

export async function updateVideo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await prisma.video.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteVideo(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.video.delete({ where: { id } });
    res.json({ success: true, message: 'Video deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getVideoCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.videoCategory.findMany({
      include: { _count: { select: { videos: true } } },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. YOUTUBE LIVE SETTINGS
// ==========================================

export async function getYouTubeLiveSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ytDelegate = (prisma as any).youTubeLiveSetting || (prisma as any).youtubeLiveSetting;
    let setting = ytDelegate ? await ytDelegate.findFirst() : null;

    if (!setting && ytDelegate) {
      setting = await ytDelegate.create({
        data: {
          channelId: 'UCrnCztiQ3BKxbRvFPGIfHcw',
          liveVideoId: null,
          isLive: false,
          streamTitle: 'BN NEWS ગુજરાતી - LIVE 24x7 પ્રસારણ',
          fallbackEmbedUrl: 'https://www.youtube.com/embed/live_stream?channel=UCrnCztiQ3BKxbRvFPGIfHcw',
        },
      });
    }

    res.json({ success: true, data: setting });
  } catch (err) {
    next(err);
  }
}

export async function updateYouTubeLiveSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { channelId, liveVideoId, isLive, streamTitle, streamThumbnail, upcomingStreamId } = req.body;
    const ytDelegate = (prisma as any).youTubeLiveSetting || (prisma as any).youtubeLiveSetting;

    const existing = await ytDelegate.findFirst();
    let updated;
    if (existing) {
      updated = await ytDelegate.update({
        where: { id: existing.id },
        data: { channelId, liveVideoId, isLive, streamTitle, streamThumbnail, upcomingStreamId },
      });
    } else {
      updated = await ytDelegate.create({
        data: { channelId, liveVideoId, isLive, streamTitle, streamThumbnail, upcomingStreamId },
      });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. PUBLIC VIDEO ENDPOINTS
// ==========================================

export async function getPublicVideos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { category, limit = '12' } = req.query;

    const where: any = {
      isReel: false,
      status: NewsStatus.PUBLISHED,
      showOnVideos: true,
    };

    if (category) {
      where.category = { slug: String(category) };
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        category: { select: { name: true, nameGu: true, slug: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: parseInt(String(limit), 10),
    });

    res.json({ success: true, data: videos });
  } catch (err) {
    next(err);
  }
}

export async function getPublicReels(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit = '10' } = req.query;

    const reels = await prisma.video.findMany({
      where: {
        isReel: true,
        status: NewsStatus.PUBLISHED,
        showOnReels: true,
      },
      include: {
        category: { select: { nameGu: true, slug: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: parseInt(String(limit), 10),
    });

    res.json({ success: true, data: reels });
  } catch (err) {
    next(err);
  }
}

export async function recordVideoView(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    await prisma.videoView.create({
      data: { videoId: id, ipAddress, userAgent },
    });

    await prisma.video.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
