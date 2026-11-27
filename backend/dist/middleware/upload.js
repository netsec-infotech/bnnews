"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAndSaveImage = exports.uploadMiddleware = exports.universalUploadMiddleware = void 0;
exports.processAndSaveMedia = processAndSaveMedia;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const index_js_1 = require("../config/index.js");
// Ensure upload directories exist
const uploadDir = index_js_1.config.uploadDir;
const thumbDir = path_1.default.join(uploadDir, 'thumbnails');
const videoDir = path_1.default.join(uploadDir, 'videos');
const tempDir = path_1.default.join(uploadDir, 'temp');
[uploadDir, thumbDir, videoDir, tempDir].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const diskStorage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, tempDir);
    },
    filename: (_req, file, cb) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const ext = path_1.default.extname(file.originalname) || '';
        cb(null, `raw-${timestamp}-${randomStr}${ext}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif', 'image/svg+xml'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg', 'video/x-msvideo', 'video/mkv'];
    if (allowedImageTypes.includes(file.mimetype) || allowedVideoTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('માત્ર ઇમેજ (JPEG, PNG, WebP) અને વિડિયો (MP4, WebM, MOV) ફાઇલો અપલોડ કરી શકાશે'));
    }
};
const rawUpload = (0, multer_1.default)({
    storage: diskStorage,
    limits: { fileSize: index_js_1.config.maxFileSize },
    fileFilter,
});
/**
 * Universal upload middleware accepting file under 'image', 'video', 'file', or 'media'
 */
const universalUploadMiddleware = (req, res, next) => {
    rawUpload.any()(req, res, (err) => {
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
exports.universalUploadMiddleware = universalUploadMiddleware;
exports.uploadMiddleware = {
    single: (_fieldName) => exports.universalUploadMiddleware,
    any: () => exports.universalUploadMiddleware,
};
async function processAndSaveMedia(file, prefix = 'media') {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const isVideo = file.mimetype.startsWith('video/');
    if (isVideo) {
        const ext = path_1.default.extname(file.originalname).toLowerCase() || '.mp4';
        const videoFilename = `${prefix}-${timestamp}-${randomStr}${ext}`;
        const targetPath = path_1.default.join(videoDir, videoFilename);
        try {
            fs_1.default.renameSync(file.path, targetPath);
        }
        catch {
            // Fallback copy if cross-device link
            fs_1.default.copyFileSync(file.path, targetPath);
            fs_1.default.unlinkSync(file.path);
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
        const ext = path_1.default.extname(file.originalname).toLowerCase() || '.png';
        const imageFilename = `${prefix}-${timestamp}-${randomStr}${ext}`;
        const targetPath = path_1.default.join(uploadDir, imageFilename);
        fs_1.default.renameSync(file.path, targetPath);
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
    const fullPath = path_1.default.join(uploadDir, baseFilename);
    const thumbPath = path_1.default.join(thumbDir, thumbFilename);
    const imageInfo = await (0, sharp_1.default)(file.path)
        .resize(1600, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(fullPath);
    await (0, sharp_1.default)(file.path)
        .resize(400, 260, { fit: 'cover' })
        .webp({ quality: 75 })
        .toFile(thumbPath);
    // Clean up raw temp file
    try {
        if (fs_1.default.existsSync(file.path)) {
            fs_1.default.unlinkSync(file.path);
        }
    }
    catch (cleanErr) {
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
exports.processAndSaveImage = processAndSaveMedia;
