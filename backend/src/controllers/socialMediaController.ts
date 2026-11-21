import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import {
  getYouTubeOAuthUrl,
  getMetaOAuthUrl,
  handleYouTubeOAuthCallback,
  handleMetaOAuthCallback,
  connectYouTubeWithApiKey,
  connectMetaManually,
  syncYouTubeVideos,
  syncFacebookFeed,
  syncInstagramMedia,
  syncAllSocialAccounts,
} from '../services/socialSyncService.js';

// ==========================================
// 1. ADMIN SOCIAL ACCOUNTS & OAUTH
// ==========================================

export async function getSocialAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const accounts = await prisma.socialAccount.findMany({
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountName: true,
        pageId: true,
        pageName: true,
        profilePicture: true,
        isConnected: true,
        status: true,
        lastError: true,
        tokenExpiresAt: true,
        lastSyncedAt: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const postCounts = await prisma.socialPost.groupBy({
      by: ['platform'],
      where: { isActive: true },
      _count: true,
    });

    // YouTube Live setting
    const liveSetting = await prisma.youTubeLiveSetting.findFirst();

    res.json({
      success: true,
      data: {
        accounts,
        postCounts,
        liveSetting,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Returns OAuth authorization URL for requested platform
 */
export async function getOAuthAuthorizationUrl(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { platform } = req.query;
    let url = '';

    if (platform === 'YOUTUBE') {
      url = getYouTubeOAuthUrl();
    } else if (platform === 'META' || platform === 'FACEBOOK' || platform === 'INSTAGRAM') {
      url = getMetaOAuthUrl();
    } else {
      res.status(400).json({ success: false, message: 'Invalid platform. Choose YOUTUBE or META.' });
      return;
    }

    res.json({ success: true, url });
  } catch (err) {
    next(err);
  }
}

/**
 * Handle YouTube OAuth Callback from Frontend
 */
export async function handleYouTubeCallback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.body;
    if (!code || !state) {
      res.status(400).json({ success: false, message: 'Authorization code and state are required.' });
      return;
    }

    const account = await handleYouTubeOAuthCallback(code, state);
    res.json({
      success: true,
      message: 'YouTube account connected and synchronized successfully!',
      data: account,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'YouTube connection failed.' });
  }
}

/**
 * Handle Meta (Facebook & Instagram) OAuth Callback from Frontend
 */
export async function handleMetaCallback(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { code, state } = req.body;
    if (!code || !state) {
      res.status(400).json({ success: false, message: 'Authorization code and state are required.' });
      return;
    }

    const result = await handleMetaOAuthCallback(code, state);
    res.json({
      success: true,
      message: 'Facebook Page & Instagram account connected successfully!',
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Meta connection failed.' });
  }
}

/**
 * Connect YouTube directly using Channel ID and API Key
 */
export async function connectYouTubeDirect(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { channelId, apiKey } = req.body;
    if (!channelId) {
      res.status(400).json({ success: false, message: 'YouTube Channel ID is required' });
      return;
    }

    const account = await connectYouTubeWithApiKey(channelId, apiKey);
    res.json({
      success: true,
      message: 'YouTube Channel connected and latest videos synchronized!',
      data: account,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Failed connecting YouTube channel.' });
  }
}

/**
 * Connect Meta manually using Page ID and Permanent Page Access Token
 */
export async function connectMetaDirect(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { platform, pageId, pageName, accessToken } = req.body;
    if (!platform || !pageId || !accessToken) {
      res.status(400).json({ success: false, message: 'Platform, Page ID and Access Token are required' });
      return;
    }

    const account = await connectMetaManually(platform, pageId, pageName || pageId, accessToken);
    res.json({
      success: true,
      message: `${platform} connected and synchronized successfully!`,
      data: account,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message || 'Manual connection failed.' });
  }
}

/**
 * Trigger on-demand sync for a specific platform or all platforms
 */
export async function syncSocialPlatform(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { platform } = req.body; // "YOUTUBE" | "FACEBOOK" | "INSTAGRAM" | "ALL"

    let result;
    if (platform === 'YOUTUBE') {
      result = await syncYouTubeVideos();
    } else if (platform === 'FACEBOOK') {
      result = await syncFacebookFeed();
    } else if (platform === 'INSTAGRAM') {
      result = await syncInstagramMedia();
    } else {
      result = await syncAllSocialAccounts();
    }

    res.json({
      success: true,
      message: `${platform || 'All'} social accounts synchronized successfully!`,
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || 'Social media sync encountered an issue.',
    });
  }
}

/**
 * Disconnect an account
 */
export async function disconnectAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.socialAccount.update({
      where: { id },
      data: {
        isConnected: false,
        status: 'DISCONNECTED',
        accessToken: null,
        refreshToken: null,
        lastError: null,
      },
    });

    res.json({ success: true, message: 'Account disconnected successfully.' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get sync logs and audit history
 */
export async function getSocialSyncLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const logs = await prisma.socialSyncLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
}

/**
 * Toggle visibility of synced social media post
 */
export async function toggleSocialPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const post = await prisma.socialPost.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ success: false, message: 'Post not found' });
      return;
    }
    const updated = await prisma.socialPost.update({
      where: { id },
      data: { isActive: !post.isActive },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. PUBLIC SOCIAL FEED & LIVE TV
// ==========================================

export async function getPublicSocialFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { platform, limit = '8', mediaType } = req.query;

    const where: any = { isActive: true };
    if (platform) {
      where.platform = String(platform).toUpperCase();
    }
    if (mediaType) {
      where.mediaType = String(mediaType).toUpperCase();
    }

    const posts = await prisma.socialPost.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: parseInt(String(limit), 10),
    });

    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
}

/**
 * Public Live TV Endpoint returning current YouTube live broadcast status & player details
 */
export async function getPublicLiveTvDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const setting = await prisma.youTubeLiveSetting.findFirst();
    const ytAccount = await prisma.socialAccount.findFirst({
      where: { platform: 'YOUTUBE', isConnected: true },
      select: {
        accountName: true,
        pageId: true,
        profilePicture: true,
        metadata: true,
      },
    });

    res.json({
      success: true,
      data: {
        isLive: setting?.isLive || false,
        liveVideoId: setting?.liveVideoId || 'live_stream',
        streamTitle: setting?.streamTitle || 'BN NEWS ગુજરાતી - LIVE 24x7 પ્રસારણ',
        streamThumbnail: setting?.streamThumbnail || null,
        channelId: setting?.channelId || ytAccount?.pageId || 'UCbnnewsgujarati',
        fallbackEmbedUrl: setting?.fallbackEmbedUrl || 'https://www.youtube.com/embed/live_stream?channel=',
        channel: ytAccount,
      },
    });
  } catch (err) {
    next(err);
  }
}
