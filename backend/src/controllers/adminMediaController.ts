import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { processAndSaveMedia } from '../middleware/upload.js';
import { config } from '../config/index.js';
import { logAuditAction } from '../services/auditService.js';

export async function uploadMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'કોઈ ઇમેજ અથવા વિડિયો ફાઇલ પસંદ કરવામાં આવી નથી' });
      return;
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const processed = await processAndSaveMedia(req.file, isVideo ? 'video' : 'media');

    const media = await prisma.media.create({
      data: {
        filename: processed.filename,
        originalName: req.file.originalname,
        mimeType: processed.mimeType,
        size: processed.size,
        url: processed.url,
        thumbnailUrl: processed.thumbnailUrl,
        altText: req.body.altText || req.file.originalname.replace(/\.[^/.]+$/, ''),
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'UPLOAD_MEDIA',
      targetType: 'MEDIA',
      targetId: media.id,
      details: { filename: media.filename, size: media.size, mimeType: media.mimeType },
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: isVideo ? 'વિડિયો સફળતાપૂર્વક અપલોડ થઈ ગયો' : 'ઇમેજ સફળતાપૂર્વક અપલોડ અને ઑપ્ટિમાઇઝ થઈ ગઈ',
      data: media,
    });
  } catch (error) {
    next(error);
  }
}

export const uploadImage = uploadMedia;
export const uploadVideo = uploadMedia;

export async function getMediaList(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 30));
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;
    const type = req.query.type as string | undefined; // 'image' | 'video' | undefined

    const where: any = {};

    if (type === 'image') {
      where.mimeType = { startsWith: 'image/' };
    } else if (type === 'video') {
      where.mimeType = { startsWith: 'video/' };
    }

    if (search && search.trim().length > 0) {
      where.AND = [
        ...(where.mimeType ? [{ mimeType: where.mimeType }] : []),
        {
          OR: [
            { originalName: { contains: search.trim(), mode: 'insensitive' } },
            { altText: { contains: search.trim(), mode: 'insensitive' } },
            { filename: { contains: search.trim(), mode: 'insensitive' } },
          ],
        },
      ];
      delete where.mimeType;
    }

    const [items, total] = await Promise.all([
      prisma.media.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
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

export async function deleteMedia(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({ where: { id } });
    if (!media) {
      res.status(404).json({ success: false, message: 'મીડિયા ફાઇલ મળેલ નથી' });
      return;
    }

    // Safety Check: Verify if media is currently used in active articles, reporters, team or ads
    const [newsCount, reporterCount, teamCount, videoCount] = await Promise.all([
      prisma.news.count({
        where: {
          OR: [
            { featuredImage: media.url },
            { content: { contains: media.url } },
          ],
        },
      }),
      prisma.reporter.count({
        where: { profileImage: media.url },
      }),
      prisma.teamMember.count({
        where: { photoUrl: media.url },
      }),
      prisma.video.count({
        where: {
          OR: [
            { thumbnailUrl: media.url },
            { videoUrl: media.url },
            { videoFile: media.filename },
          ],
        },
      }),
    ]);

    if (newsCount > 0 || reporterCount > 0 || teamCount > 0 || videoCount > 0) {
      const uses = [];
      if (newsCount > 0) uses.push(`${newsCount} સમાચાર લેખ`);
      if (reporterCount > 0) uses.push(`${reporterCount} રિપોર્ટર પ્રોફાઇલ`);
      if (teamCount > 0) uses.push(`${teamCount} ટીમ મેમ્બર`);
      if (videoCount > 0) uses.push(`${videoCount} વિડિયો`);

      res.status(400).json({
        success: false,
        message: `આ મીડિયા ફાઇલ હાલમાં વપરાશમાં છે (${uses.join(', ')}). કૃપા કરીને પ્રથમ ત્યાંથી તેને દૂર કરો.`,
      });
      return;
    }

    // Try deleting physical files from disk
    if (media.mimeType.startsWith('video/')) {
      const videoFilePath = path.join(config.uploadDir, 'videos', media.filename);
      if (fs.existsSync(videoFilePath)) fs.unlinkSync(videoFilePath);
    } else {
      const mainFilePath = path.join(config.uploadDir, media.filename);
      const thumbFilePath = path.join(config.uploadDir, 'thumbnails', `thumb-${media.filename}`);

      if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
      if (fs.existsSync(thumbFilePath)) fs.unlinkSync(thumbFilePath);
    }

    await prisma.media.delete({ where: { id } });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'DELETE_MEDIA',
      targetType: 'MEDIA',
      targetId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'મીડિયા સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું' });
  } catch (error) {
    next(error);
  }
}
