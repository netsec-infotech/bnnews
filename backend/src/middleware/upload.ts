import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/index.js';

// Ensure upload directories exist
const uploadDir = config.uploadDir;
const thumbDir = path.join(uploadDir, 'thumbnails');
const videoDir = path.join(uploadDir, 'videos');
const tempDir = path.join(uploadDir, 'temp');

[uploadDir, thumbDir, videoDir, tempDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, tempDir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname) || '';
    cb(null, `raw-${timestamp}-${randomStr}${ext}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-msvideo', 'video/mkv'];

  if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('માત્ર ઇમેજ (JPEG, PNG, WebP) અને વિડિયો (MP4, WebM, MOV) ફાઇલો અપલોડ કરી શકાશે'));
  }
};

const rawUpload = multer({
  storage: diskStorage,
  limits: { fileSize: config.maxFileSize },
  fileFilter,
});

/**
 * Universal upload middleware accepting file under 'image', 'video', 'file', or 'media'
 */
export const universalUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  rawUpload.any()(req, res, (err: any) => {
    if (err) {
      return next(err);
    }
    // Normalize first uploaded file to req.file
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      req.file = req.files[0];
    }
    next();
  });
};

export const uploadMiddleware = {
  single: (_fieldName?: string) => universalUploadMiddleware,
  any: () => universalUploadMiddleware,
};

export interface ProcessedMedia {
  filename: string;
  url: string;
  thumbnailUrl: string | null;
  size: number;
  mimeType: string;
  isVideo: boolean;
}

export async function processAndSaveMedia(
  file: Express.Multer.File,
  prefix = 'media'
): Promise<ProcessedMedia> {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const isVideo = file.mimetype.startsWith('video/');

  if (isVideo) {
    const ext = path.extname(file.originalname).toLowerCase() || '.mp4';
    const videoFilename = `${prefix}-${timestamp}-${randomStr}${ext}`;
    const targetPath = path.join(videoDir, videoFilename);

    try {
      fs.renameSync(file.path, targetPath);
    } catch {
      // Fallback copy if cross-device link
      fs.copyFileSync(file.path, targetPath);
      fs.unlinkSync(file.path);
    }

    return {
      filename: videoFilename,
      url: `/uploads/videos/${videoFilename}`,
      thumbnailUrl: null,
      size: file.size,
      mimeType: file.mimetype,
      isVideo: true,
    };
  }

  // Handle Images
  const isSvgOrGif = file.mimetype === 'image/svg+xml' || file.mimetype === 'image/gif';
  if (isSvgOrGif) {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const imageFilename = `${prefix}-${timestamp}-${randomStr}${ext}`;
    const targetPath = path.join(uploadDir, imageFilename);

    fs.renameSync(file.path, targetPath);

    return {
      filename: imageFilename,
      url: `/uploads/${imageFilename}`,
      thumbnailUrl: `/uploads/${imageFilename}`,
      size: file.size,
      mimeType: file.mimetype,
      isVideo: false,
    };
  }

  // Optimize JPEG/PNG/WebP with Sharp to WebP
  const baseFilename = `${prefix}-${timestamp}-${randomStr}.webp`;
  const thumbFilename = `thumb-${baseFilename}`;
  const fullPath = path.join(uploadDir, baseFilename);
  const thumbPath = path.join(thumbDir, thumbFilename);

  const imageInfo = await sharp(file.path)
    .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toFile(fullPath);

  await sharp(file.path)
    .resize(400, 260, { fit: 'cover' })
    .webp({ quality: 75 })
    .toFile(thumbPath);

  // Clean up raw temp file
  try {
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (cleanErr) {
    console.error('Failed to remove temp file:', cleanErr);
  }

  return {
    filename: baseFilename,
    url: `/uploads/${baseFilename}`,
    thumbnailUrl: `/uploads/thumbnails/${thumbFilename}`,
    size: imageInfo.size,
    mimeType: 'image/webp',
    isVideo: false,
  };
}

// Backward compatibility export
export const processAndSaveImage = processAndSaveMedia;
