"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminBreakingNews = getAdminBreakingNews;
exports.addBreakingNews = addBreakingNews;
exports.deleteBreakingNews = deleteBreakingNews;
exports.getAdminTrendingNews = getAdminTrendingNews;
exports.addTrendingNews = addTrendingNews;
exports.deleteTrendingNews = deleteTrendingNews;
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
// Breaking News
async function getAdminBreakingNews(req, res, next) {
    try {
        const items = await prisma_js_1.prisma.breakingNews.findMany({
            include: {
                news: {
                    select: {
                        id: true,
                        titleGu: true,
                        slug: true,
                        status: true,
                        category: { select: { nameGu: true } },
                    },
                },
            },
            orderBy: { order: 'asc' },
        });
        res.json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
}
async function addBreakingNews(req, res, next) {
    try {
        const schema = zod_1.z.object({
            newsId: zod_1.z.string().uuid(),
            tickerText: zod_1.z.string().optional(),
            order: zod_1.z.number().default(0),
            isActive: zod_1.z.boolean().default(true),
            startTime: zod_1.z.string().optional().nullable(),
            expiryTime: zod_1.z.string().optional().nullable(),
        });
        const data = schema.parse(req.body);
        const news = await prisma_js_1.prisma.news.findUnique({ where: { id: data.newsId } });
        if (!news) {
            res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
            return;
        }
        if (news.status !== client_1.NewsStatus.PUBLISHED) {
            res.status(400).json({ success: false, message: 'માત્ર પ્રકાશિત (PUBLISHED) સમાચાર જ બ્રેકિંગ ન્યૂઝમાં ઉમેરી શકાય છે.' });
            return;
        }
        const breaking = await prisma_js_1.prisma.breakingNews.upsert({
            where: { newsId: data.newsId },
            update: {
                tickerText: data.tickerText || news.titleGu,
                order: data.order,
                isActive: data.isActive,
                startTime: data.startTime ? new Date(data.startTime) : null,
                expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
            },
            create: {
                newsId: data.newsId,
                tickerText: data.tickerText || news.titleGu,
                order: data.order,
                isActive: data.isActive,
                startTime: data.startTime ? new Date(data.startTime) : null,
                expiryTime: data.expiryTime ? new Date(data.expiryTime) : null,
            },
        });
        await prisma_js_1.prisma.news.update({
            where: { id: data.newsId },
            data: { isBreaking: true },
        });
        res.json({ success: true, message: 'બ્રેકિંગ ન્યૂઝ ટિકરમાં ઉમેરાયા', data: breaking });
    }
    catch (error) {
        next(error);
    }
}
async function deleteBreakingNews(req, res, next) {
    try {
        const { id } = req.params;
        const item = await prisma_js_1.prisma.breakingNews.findUnique({ where: { id } });
        if (item) {
            await prisma_js_1.prisma.breakingNews.delete({ where: { id } });
            await prisma_js_1.prisma.news.update({
                where: { id: item.newsId },
                data: { isBreaking: false },
            });
        }
        res.json({ success: true, message: 'બ્રેકિંગ ન્યૂઝમાંથી દૂર કરવામાં આવ્યા' });
    }
    catch (error) {
        next(error);
    }
}
// Trending News
async function getAdminTrendingNews(req, res, next) {
    try {
        const items = await prisma_js_1.prisma.trendingNews.findMany({
            include: {
                news: {
                    select: {
                        id: true,
                        titleGu: true,
                        slug: true,
                        featuredImage: true,
                        publishedAt: true,
                        status: true,
                        category: { select: { nameGu: true } },
                    },
                },
            },
            orderBy: { priority: 'asc' },
        });
        res.json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
}
async function addTrendingNews(req, res, next) {
    try {
        const schema = zod_1.z.object({
            newsId: zod_1.z.string().uuid(),
            priority: zod_1.z.number().default(0),
            isActive: zod_1.z.boolean().default(true),
        });
        const data = schema.parse(req.body);
        const news = await prisma_js_1.prisma.news.findUnique({ where: { id: data.newsId } });
        if (!news) {
            res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
            return;
        }
        if (news.status !== client_1.NewsStatus.PUBLISHED) {
            res.status(400).json({ success: false, message: 'માત્ર પ્રકાશિત (PUBLISHED) સમાચાર જ ટ્રેન્ડિંગમાં ઉમેરી શકાય છે.' });
            return;
        }
        const trending = await prisma_js_1.prisma.trendingNews.upsert({
            where: { newsId: data.newsId },
            update: {
                priority: data.priority,
                isActive: data.isActive,
            },
            create: {
                newsId: data.newsId,
                priority: data.priority,
                isActive: data.isActive,
            },
        });
        await prisma_js_1.prisma.news.update({
            where: { id: data.newsId },
            data: { isTrending: true },
        });
        res.json({ success: true, message: 'ટ્રેન્ડિંગ ન્યૂઝમાં ઉમેરાયા', data: trending });
    }
    catch (error) {
        next(error);
    }
}
async function deleteTrendingNews(req, res, next) {
    try {
        const { id } = req.params;
        const item = await prisma_js_1.prisma.trendingNews.findUnique({ where: { id } });
        if (item) {
            await prisma_js_1.prisma.trendingNews.delete({ where: { id } });
            await prisma_js_1.prisma.news.update({
                where: { id: item.newsId },
                data: { isTrending: false },
            });
        }
        res.json({ success: true, message: 'ટ્રેન્ડિંગમાંથી દૂર કરવામાં આવ્યા' });
    }
    catch (error) {
        next(error);
    }
}
