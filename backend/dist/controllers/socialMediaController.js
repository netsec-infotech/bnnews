"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocialAccounts = getSocialAccounts;
exports.getOAuthAuthorizationUrl = getOAuthAuthorizationUrl;
exports.handleYouTubeCallback = handleYouTubeCallback;
exports.handleMetaCallback = handleMetaCallback;
exports.connectYouTubeDirect = connectYouTubeDirect;
exports.connectMetaDirect = connectMetaDirect;
exports.syncSocialPlatform = syncSocialPlatform;
exports.disconnectAccount = disconnectAccount;
exports.getSocialSyncLogs = getSocialSyncLogs;
exports.toggleSocialPost = toggleSocialPost;
exports.getPublicSocialFeed = getPublicSocialFeed;
exports.getPublicLiveTvDetails = getPublicLiveTvDetails;
const prisma_js_1 = require("../config/prisma.js");
const socialSyncService_js_1 = require("../services/socialSyncService.js");
// ==========================================
// 1. ADMIN SOCIAL ACCOUNTS & OAUTH
// ==========================================
async function getSocialAccounts(req, res, next) {
    try {
        const accounts = await prisma_js_1.prisma.socialAccount.findMany({
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
        const postCounts = await prisma_js_1.prisma.socialPost.groupBy({
            by: ['platform'],
            where: { isActive: true },
            _count: true,
        });
        // YouTube Live setting
        const liveSetting = await prisma_js_1.prisma.youTubeLiveSetting.findFirst();
        res.json({
            success: true,
            data: {
                accounts,
                postCounts,
                liveSetting,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * Returns OAuth authorization URL for requested platform
 */
async function getOAuthAuthorizationUrl(req, res, next) {
    try {
        const { platform } = req.query;
        let url = '';
        if (platform === 'YOUTUBE') {
            url = (0, socialSyncService_js_1.getYouTubeOAuthUrl)();
        }
        else if (platform === 'META' || platform === 'FACEBOOK' || platform === 'INSTAGRAM') {
            url = (0, socialSyncService_js_1.getMetaOAuthUrl)();
        }
        else {
            res.status(400).json({ success: false, message: 'Invalid platform. Choose YOUTUBE or META.' });
            return;
        }
        res.json({ success: true, url });
    }
    catch (err) {
        next(err);
    }
}
/**
 * Handle YouTube OAuth Callback from Frontend
 */
async function handleYouTubeCallback(req, res, next) {
    try {
        const { code, state } = req.body;
        if (!code || !state) {
            res.status(400).json({ success: false, message: 'Authorization code and state are required.' });
            return;
        }
        const account = await (0, socialSyncService_js_1.handleYouTubeOAuthCallback)(code, state);
        res.json({
            success: true,
            message: 'YouTube account connected and synchronized successfully!',
            data: account,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message || 'YouTube connection failed.' });
    }
}
/**
 * Handle Meta (Facebook & Instagram) OAuth Callback from Frontend
 */
async function handleMetaCallback(req, res, next) {
    try {
        const { code, state } = req.body;
        if (!code || !state) {
            res.status(400).json({ success: false, message: 'Authorization code and state are required.' });
            return;
        }
        const result = await (0, socialSyncService_js_1.handleMetaOAuthCallback)(code, state);
        res.json({
            success: true,
            message: 'Facebook Page & Instagram account connected successfully!',
            data: result,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Meta connection failed.' });
    }
}
/**
 * Connect YouTube directly using Channel ID and API Key
 */
async function connectYouTubeDirect(req, res, next) {
    try {
        const { channelId, apiKey } = req.body;
        if (!channelId) {
            res.status(400).json({ success: false, message: 'YouTube Channel ID is required' });
            return;
        }
        const account = await (0, socialSyncService_js_1.connectYouTubeWithApiKey)(channelId, apiKey);
        res.json({
            success: true,
            message: 'YouTube Channel connected and latest videos synchronized!',
            data: account,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Failed connecting YouTube channel.' });
    }
}
/**
 * Connect Meta manually using Page ID and Permanent Page Access Token
 */
async function connectMetaDirect(req, res, next) {
    try {
        const { platform, pageId, pageName, accessToken } = req.body;
        if (!platform || !pageId || !accessToken) {
            res.status(400).json({ success: false, message: 'Platform, Page ID and Access Token are required' });
            return;
        }
        const account = await (0, socialSyncService_js_1.connectMetaManually)(platform, pageId, pageName || pageId, accessToken);
        res.json({
            success: true,
            message: `${platform} connected and synchronized successfully!`,
            data: account,
        });
    }
    catch (err) {
        res.status(400).json({ success: false, message: err.message || 'Manual connection failed.' });
    }
}
/**
 * Trigger on-demand sync for a specific platform or all platforms
 */
async function syncSocialPlatform(req, res, next) {
    try {
        const { platform } = req.body; // "YOUTUBE" | "FACEBOOK" | "INSTAGRAM" | "ALL"
        let result;
        if (platform === 'YOUTUBE') {
            result = await (0, socialSyncService_js_1.syncYouTubeVideos)();
        }
        else if (platform === 'FACEBOOK') {
            result = await (0, socialSyncService_js_1.syncFacebookFeed)();
        }
        else if (platform === 'INSTAGRAM') {
            result = await (0, socialSyncService_js_1.syncInstagramMedia)();
        }
        else {
            result = await (0, socialSyncService_js_1.syncAllSocialAccounts)();
        }
        res.json({
            success: true,
            message: `${platform || 'All'} social accounts synchronized successfully!`,
            data: result,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: err.message || 'Social media sync encountered an issue.',
        });
    }
}
/**
 * Disconnect an account
 */
async function disconnectAccount(req, res, next) {
    try {
        const { id } = req.params;
        await prisma_js_1.prisma.socialAccount.update({
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
    }
    catch (err) {
        next(err);
    }
}
/**
 * Get sync logs and audit history
 */
async function getSocialSyncLogs(req, res, next) {
    try {
        const logs = await prisma_js_1.prisma.socialSyncLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
        res.json({ success: true, data: logs });
    }
    catch (err) {
        next(err);
    }
}
/**
 * Toggle visibility of synced social media post
 */
async function toggleSocialPost(req, res, next) {
    try {
        const { id } = req.params;
        const post = await prisma_js_1.prisma.socialPost.findUnique({ where: { id } });
        if (!post) {
            res.status(404).json({ success: false, message: 'Post not found' });
            return;
        }
        const updated = await prisma_js_1.prisma.socialPost.update({
            where: { id },
            data: { isActive: !post.isActive },
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 2. PUBLIC SOCIAL FEED & LIVE TV
// ==========================================
async function getPublicSocialFeed(req, res, next) {
    try {
        const { platform, limit = '8', mediaType } = req.query;
        const where = { isActive: true };
        if (platform) {
            where.platform = String(platform).toUpperCase();
        }
        if (mediaType) {
            where.mediaType = String(mediaType).toUpperCase();
        }
        const posts = await prisma_js_1.prisma.socialPost.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            take: parseInt(String(limit), 10),
        });
        res.json({ success: true, data: posts });
    }
    catch (err) {
        next(err);
    }
}
/**
 * Public Live TV Endpoint returning current YouTube live broadcast status & player details
 */
async function getPublicLiveTvDetails(req, res, next) {
    try {
        const setting = await prisma_js_1.prisma.youTubeLiveSetting.findFirst();
        const ytAccount = await prisma_js_1.prisma.socialAccount.findFirst({
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
    }
    catch (err) {
        next(err);
    }
}
