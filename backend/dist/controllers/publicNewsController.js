"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicNews = getPublicNews;
exports.getNewsBySlug = getNewsBySlug;
exports.getPublicCategories = getPublicCategories;
exports.getBreakingNews = getBreakingNews;
exports.getTrendingNews = getTrendingNews;
exports.getPublicSettings = getPublicSettings;
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
async function getPublicNews(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
        const skip = (page - 1) * limit;
        const categorySlug = req.query.category;
        const search = req.query.search;
        const isFeatured = req.query.featured === 'true' ? true : undefined;
        const contentType = req.query.contentType;
        const where = {
            status: client_1.NewsStatus.PUBLISHED,
        };
        if (contentType) {
            where.contentType = contentType;
        }
        if (categorySlug) {
            where.category = { slug: categorySlug };
        }
        if (isFeatured !== undefined) {
            where.isFeatured = isFeatured;
        }
        if (search && search.trim().length > 0) {
            const q = search.trim();
            where.OR = [
                { titleGu: { contains: q, mode: 'insensitive' } },
                { title: { contains: q, mode: 'insensitive' } },
                { descriptionGu: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { content: { contains: q, mode: 'insensitive' } },
                { tags: { has: q } },
            ];
        }
        const [items, total] = await Promise.all([
            prisma_js_1.prisma.news.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    titleGu: true,
                    slug: true,
                    description: true,
                    descriptionGu: true,
                    featuredImage: true,
                    publishedAt: true,
                    createdAt: true,
                    viewsCount: true,
                    isBreaking: true,
                    isTrending: true,
                    isFeatured: true,
                    contentType: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            nameGu: true,
                            slug: true,
                        },
                    },
                    reporter: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            designation: true,
                            profileImage: true,
                        },
                    },
                    author: {
                        select: {
                            name: true,
                            avatar: true,
                        },
                    },
                    source: {
                        select: {
                            name: true,
                            attributionName: true,
                            websiteUrl: true,
                        },
                    },
                },
                orderBy: { publishedAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_js_1.prisma.news.count({ where }),
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
async function getNewsBySlug(req, res, next) {
    try {
        const { slug } = req.params;
        const article = await prisma_js_1.prisma.news.findFirst({
            where: {
                slug,
                status: client_1.NewsStatus.PUBLISHED,
            },
            include: {
                category: true,
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        designation: true,
                        profileImage: true,
                        biography: true,
                        location: true,
                        experience: true,
                        socialLinks: true,
                    },
                },
                author: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
                source: {
                    select: {
                        name: true,
                        attributionName: true,
                        websiteUrl: true,
                    },
                },
            },
        });
        if (!article) {
            res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી (Article not found)' });
            return;
        }
        // Increment view count asynchronously
        prisma_js_1.prisma.news.update({
            where: { id: article.id },
            data: { viewsCount: { increment: 1 } },
        }).catch((err) => console.error('Failed to increment view count:', err));
        // Fetch related news from same category
        const related = await prisma_js_1.prisma.news.findMany({
            where: {
                categoryId: article.categoryId,
                status: client_1.NewsStatus.PUBLISHED,
                id: { not: article.id },
            },
            select: {
                id: true,
                titleGu: true,
                slug: true,
                featuredImage: true,
                publishedAt: true,
                category: {
                    select: { nameGu: true, slug: true },
                },
            },
            orderBy: { publishedAt: 'desc' },
            take: 4,
        });
        res.json({
            success: true,
            data: article,
            related,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getPublicCategories(req, res, next) {
    try {
        const categories = await prisma_js_1.prisma.category.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                name: true,
                nameGu: true,
                slug: true,
                icon: true,
                order: true,
                description: true,
                _count: {
                    select: {
                        news: {
                            where: { status: client_1.NewsStatus.PUBLISHED },
                        },
                    },
                },
            },
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
}
async function getBreakingNews(req, res, next) {
    try {
        const now = new Date();
        const breaking = await prisma_js_1.prisma.breakingNews.findMany({
            where: {
                isActive: true,
                news: {
                    status: client_1.NewsStatus.PUBLISHED,
                },
                OR: [
                    { startTime: null, expiryTime: null },
                    { startTime: { lte: now }, expiryTime: null },
                    { startTime: null, expiryTime: { gte: now } },
                    { startTime: { lte: now }, expiryTime: { gte: now } },
                ],
            },
            include: {
                news: {
                    select: {
                        id: true,
                        titleGu: true,
                        slug: true,
                        category: {
                            select: { slug: true, nameGu: true },
                        },
                    },
                },
            },
            orderBy: { order: 'asc' },
            take: 10,
        });
        res.json({ success: true, data: breaking });
    }
    catch (error) {
        next(error);
    }
}
async function getTrendingNews(req, res, next) {
    try {
        const trending = await prisma_js_1.prisma.trendingNews.findMany({
            where: {
                isActive: true,
                news: {
                    status: client_1.NewsStatus.PUBLISHED,
                },
            },
            include: {
                news: {
                    select: {
                        id: true,
                        titleGu: true,
                        slug: true,
                        featuredImage: true,
                        publishedAt: true,
                        category: {
                            select: { slug: true, nameGu: true },
                        },
                    },
                },
            },
            orderBy: { priority: 'asc' },
            take: 10,
        });
        res.json({ success: true, data: trending });
    }
    catch (error) {
        next(error);
    }
}
async function getPublicSettings(req, res, next) {
    try {
        const settings = await prisma_js_1.prisma.websiteSetting.findMany();
        const settingMap = {};
        settings.forEach((s) => {
            settingMap[s.key] = s.value;
        });
        res.json({ success: true, data: settingMap });
    }
    catch (error) {
        next(error);
    }
}
