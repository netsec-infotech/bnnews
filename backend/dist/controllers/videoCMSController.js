"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminVideos = getAdminVideos;
exports.createVideo = createVideo;
exports.updateVideo = updateVideo;
exports.deleteVideo = deleteVideo;
exports.getVideoCategories = getVideoCategories;
exports.getYouTubeLiveSettings = getYouTubeLiveSettings;
exports.updateYouTubeLiveSettings = updateYouTubeLiveSettings;
exports.getPublicVideos = getPublicVideos;
exports.getPublicReels = getPublicReels;
exports.recordVideoView = recordVideoView;
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
// ==========================================
// 1. ADMIN VIDEO CMS
// ==========================================
async function getAdminVideos(req, res, next) {
    try {
        const { isReel, categoryId, search } = req.query;
        const where = {};
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
        const videos = await prisma_js_1.prisma.video.findMany({
            where,
            include: {
                category: { select: { id: true, name: true, nameGu: true, slug: true } },
                author: { select: { id: true, name: true } },
                _count: { select: { views: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: videos });
    }
    catch (err) {
        next(err);
    }
}
async function createVideo(req, res, next) {
    try {
        const { title, titleGu, slug, description, videoSource, videoUrl, videoFile, thumbnailUrl, categoryId, duration, isFeatured, isTrending, isReel, showOnHome, showOnVideos, showOnReels, } = req.body;
        if (!titleGu || !videoUrl) {
            res.status(400).json({ success: false, message: 'Gujarati title and video URL are required' });
            return;
        }
        const videoSlug = slug || titleGu.toLowerCase().replace(/[^\w\u0A80-\u0AFF]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
        const video = await prisma_js_1.prisma.video.create({
            data: {
                title: title || titleGu,
                titleGu,
                slug: videoSlug,
                description,
                videoSource: videoSource || client_1.VideoSource.YOUTUBE,
                videoUrl,
                videoFile,
                thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=600&auto=format&fit=crop&q=80',
                categoryId: categoryId || null,
                authorId: req.user?.id || null,
                duration: duration || '0:30',
                isFeatured: Boolean(isFeatured),
                isTrending: Boolean(isTrending),
                isReel: Boolean(isReel),
                showOnHome: showOnHome !== undefined ? Boolean(showOnHome) : true,
                showOnVideos: showOnVideos !== undefined ? Boolean(showOnVideos) : true,
                showOnReels: Boolean(showOnReels),
                status: client_1.NewsStatus.PUBLISHED,
            },
            include: { category: true },
        });
        res.status(201).json({ success: true, data: video });
    }
    catch (err) {
        next(err);
    }
}
async function updateVideo(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await prisma_js_1.prisma.video.update({
            where: { id },
            data: req.body,
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
async function deleteVideo(req, res, next) {
    try {
        const { id } = req.params;
        await prisma_js_1.prisma.video.delete({ where: { id } });
        res.json({ success: true, message: 'Video deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function getVideoCategories(req, res, next) {
    try {
        const categories = await prisma_js_1.prisma.videoCategory.findMany({
            include: { _count: { select: { videos: true } } },
            orderBy: { order: 'asc' },
        });
        res.json({ success: true, data: categories });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 2. YOUTUBE LIVE SETTINGS
// ==========================================
async function getYouTubeLiveSettings(req, res, next) {
    try {
        const ytDelegate = prisma_js_1.prisma.youTubeLiveSetting || prisma_js_1.prisma.youtubeLiveSetting;
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
    }
    catch (err) {
        next(err);
    }
}
async function updateYouTubeLiveSettings(req, res, next) {
    try {
        const { channelId, liveVideoId, isLive, streamTitle, streamThumbnail, upcomingStreamId } = req.body;
        const ytDelegate = prisma_js_1.prisma.youTubeLiveSetting || prisma_js_1.prisma.youtubeLiveSetting;
        const existing = await ytDelegate.findFirst();
        let updated;
        if (existing) {
            updated = await ytDelegate.update({
                where: { id: existing.id },
                data: { channelId, liveVideoId, isLive, streamTitle, streamThumbnail, upcomingStreamId },
            });
        }
        else {
            updated = await ytDelegate.create({
                data: { channelId, liveVideoId, isLive, streamTitle, streamThumbnail, upcomingStreamId },
            });
        }
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 3. PUBLIC VIDEO ENDPOINTS
// ==========================================
async function getPublicVideos(req, res, next) {
    try {
        const { category, limit = '12' } = req.query;
        const where = {
            isReel: false,
            status: client_1.NewsStatus.PUBLISHED,
            showOnVideos: true,
        };
        if (category) {
            where.category = { slug: String(category) };
        }
        const videos = await prisma_js_1.prisma.video.findMany({
            where,
            include: {
                category: { select: { name: true, nameGu: true, slug: true } },
            },
            orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
            take: parseInt(String(limit), 10),
        });
        res.json({ success: true, data: videos });
    }
    catch (err) {
        next(err);
    }
}
async function getPublicReels(req, res, next) {
    try {
        const { limit = '10' } = req.query;
        const reels = await prisma_js_1.prisma.video.findMany({
            where: {
                isReel: true,
                status: client_1.NewsStatus.PUBLISHED,
                showOnReels: true,
            },
            include: {
                category: { select: { nameGu: true, slug: true } },
            },
            orderBy: { publishedAt: 'desc' },
            take: parseInt(String(limit), 10),
        });
        res.json({ success: true, data: reels });
    }
    catch (err) {
        next(err);
    }
}
async function recordVideoView(req, res, next) {
    try {
        const { id } = req.params;
        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        await prisma_js_1.prisma.videoView.create({
            data: { videoId: id, ipAddress, userAgent },
        });
        await prisma_js_1.prisma.video.update({
            where: { id },
            data: { viewsCount: { increment: 1 } },
        });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
