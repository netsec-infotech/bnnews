"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSocialPost = addSocialPost;
exports.deleteSocialPost = deleteSocialPost;
exports.getPublicSocialFeeds = getPublicSocialFeeds;
exports.getPublicStoriesAndAds = getPublicStoriesAndAds;
const prisma_js_1 = require("../config/prisma.js");
async function addSocialPost(req, res, next) {
    try {
        const { platform, postUrl, caption, mediaUrl, thumbnailUrl, authorName } = req.body;
        const post = await prisma_js_1.prisma.socialPost.create({
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
    }
    catch (err) {
        next(err);
    }
}
async function deleteSocialPost(req, res, next) {
    try {
        const { id } = req.params;
        await prisma_js_1.prisma.socialPost.delete({ where: { id } });
        res.json({ success: true, message: 'Social post deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function getPublicSocialFeeds(req, res, next) {
    try {
        const posts = await prisma_js_1.prisma.socialPost.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
        });
        res.json({ success: true, data: posts });
    }
    catch (err) {
        next(err);
    }
}
async function getPublicStoriesAndAds(req, res, next) {
    try {
        const campaigns = await prisma_js_1.prisma.adCampaign.findMany({
            where: { status: 'ACTIVE' },
            include: { creatives: true, advertiser: true },
            take: 10,
        });
        res.json({ success: true, data: campaigns });
    }
    catch (err) {
        next(err);
    }
}
