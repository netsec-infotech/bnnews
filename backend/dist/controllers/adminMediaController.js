"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = exports.uploadImage = void 0;
exports.uploadMedia = uploadMedia;
exports.getMediaList = getMediaList;
exports.deleteMedia = deleteMedia;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const prisma_js_1 = require("../config/prisma.js");
const upload_js_1 = require("../middleware/upload.js");
const index_js_1 = require("../config/index.js");
const auditService_js_1 = require("../services/auditService.js");
async function uploadMedia(req, res, next) {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'કોઈ ઇમેજ અથવા વિડિયો ફાઇલ પસંદ કરવામાં આવી નથી' });
            return;
        }
        const isVideo = req.file.mimetype.startsWith('video/');
        const processed = await (0, upload_js_1.processAndSaveMedia)(req.file, isVideo ? 'video' : 'media');
        const media = await prisma_js_1.prisma.media.create({
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
        await (0, auditService_js_1.logAuditAction)({
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
    }
    catch (error) {
        next(error);
    }
}
exports.uploadImage = uploadMedia;
exports.uploadVideo = uploadMedia;
async function getMediaList(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const type = req.query.type; // 'image' | 'video' | undefined
        const where = {};
        if (type === 'image') {
            where.mimeType = { startsWith: 'image/' };
        }
        else if (type === 'video') {
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
            prisma_js_1.prisma.media.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_js_1.prisma.media.count({ where }),
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
    }
    catch (error) {
        next(error);
    }
}
async function deleteMedia(req, res, next) {
    try {
        const { id } = req.params;
        const media = await prisma_js_1.prisma.media.findUnique({ where: { id } });
        if (!media) {
            res.status(404).json({ success: false, message: 'મીડિયા ફાઇલ મળેલ નથી' });
            return;
        }
        // Safety Check: Verify if media is currently used in active articles, reporters, team or ads
        const [newsCount, reporterCount, teamCount, videoCount] = await Promise.all([
            prisma_js_1.prisma.news.count({
                where: {
                    OR: [
                        { featuredImage: media.url },
                        { content: { contains: media.url } },
                    ],
                },
            }),
            prisma_js_1.prisma.reporter.count({
                where: { profileImage: media.url },
            }),
            prisma_js_1.prisma.teamMember.count({
                where: { photoUrl: media.url },
            }),
            prisma_js_1.prisma.video.count({
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
            if (newsCount > 0)
                uses.push(`${newsCount} સમાચાર લેખ`);
            if (reporterCount > 0)
                uses.push(`${reporterCount} રિપોર્ટર પ્રોફાઇલ`);
            if (teamCount > 0)
                uses.push(`${teamCount} ટીમ મેમ્બર`);
            if (videoCount > 0)
                uses.push(`${videoCount} વિડિયો`);
            res.status(400).json({
                success: false,
                message: `આ મીડિયા ફાઇલ હાલમાં વપરાશમાં છે (${uses.join(', ')}). કૃપા કરીને પ્રથમ ત્યાંથી તેને દૂર કરો.`,
            });
            return;
        }
        // Try deleting physical files from disk
        if (media.mimeType.startsWith('video/')) {
            const videoFilePath = path_1.default.join(index_js_1.config.uploadDir, 'videos', media.filename);
            if (fs_1.default.existsSync(videoFilePath))
                fs_1.default.unlinkSync(videoFilePath);
        }
        else {
            const mainFilePath = path_1.default.join(index_js_1.config.uploadDir, media.filename);
            const thumbFilePath = path_1.default.join(index_js_1.config.uploadDir, 'thumbnails', `thumb-${media.filename}`);
            if (fs_1.default.existsSync(mainFilePath))
                fs_1.default.unlinkSync(mainFilePath);
            if (fs_1.default.existsSync(thumbFilePath))
                fs_1.default.unlinkSync(thumbFilePath);
        }
        await prisma_js_1.prisma.media.delete({ where: { id } });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'DELETE_MEDIA',
            targetType: 'MEDIA',
            targetId: id,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'મીડિયા સફળતાપૂર્વક કાઢી નાખવામાં આવ્યું' });
    }
    catch (error) {
        next(error);
    }
}
