import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

export async function addSocialPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { platform, postUrl, caption, mediaUrl, thumbnailUrl, authorName } = req.body;
    const post = await prisma.socialPost.create({
      data: {
        platform: platform || 'INSTAGRAM',
        postUrl,
        caption,
        mediaUrl,
        thumbnailUrl,
        authorName: authorName || 'BN NEWS ગુજરાતી',
      },
    });
    res.status(201).json({ success: true, data: post });
  } catch (err) {
    next(err);
  }
}

export async function deleteSocialPost(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.socialPost.delete({ where: { id } });
    res.json({ success: true, message: 'Social post deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getPublicSocialFeeds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = await prisma.socialPost.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json({ success: true, data: posts });
  } catch (err) {
    next(err);
  }
}

export async function getPublicStoriesAndAds(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      where: { status: 'ACTIVE' },
      include: { creatives: true, advertiser: true },
      take: 10,
    });
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
}
