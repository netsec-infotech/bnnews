"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminNews = getAdminNews;
exports.getAdminNewsById = getAdminNewsById;
exports.createManualNews = createManualNews;
exports.updateAdminNews = updateAdminNews;
exports.publishNews = publishNews;
exports.rejectNews = rejectNews;
exports.deleteNews = deleteNews;
exports.bulkDeleteNews = bulkDeleteNews;
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
const slugify_js_1 = require("../utils/slugify.js");
const auditService_js_1 = require("../services/auditService.js");
const newsInputSchema = zod_1.z.object({
    titleGu: zod_1.z.string().min(5, 'ગુજરાતી હેડલાઇન ઓછામાં ઓછી 5 અક્ષરોની હોવી જોઈએ'),
    title: zod_1.z.string().optional().default(''),
    descriptionGu: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    content: zod_1.z.string().min(20, 'સમાચાર સામગ્રી ઓછામાં ઓછી 20 અક્ષરોની હોવી જોઈએ'),
    categoryId: zod_1.z.string().uuid('માન્ય કેટેગરી પસંદ કરો'),
    subCategoryId: zod_1.z.string().optional().nullable(),
    reporterId: zod_1.z.string().optional().nullable(),
    contentType: zod_1.z.enum(['ARTICLE', 'VIDEO', 'REEL']).optional().default('ARTICLE'),
    videoUrl: zod_1.z.string().optional().nullable(),
    contentBlocks: zod_1.z.any().optional(),
    aiHistory: zod_1.z.any().optional(),
    originalTitleGu: zod_1.z.string().optional().nullable(),
    originalDescriptionGu: zod_1.z.string().optional().nullable(),
    originalContent: zod_1.z.string().optional().nullable(),
    featuredImage: zod_1.z.string().optional().nullable(),
    additionalImages: zod_1.z.array(zod_1.z.string()).optional().default([]),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    isBreaking: zod_1.z.boolean().optional().default(false),
    isTrending: zod_1.z.boolean().optional().default(false),
    isFeatured: zod_1.z.boolean().optional().default(false),
    seoTitle: zod_1.z.string().optional(),
    seoDescription: zod_1.z.string().optional(),
    status: zod_1.z.enum(['DRAFT', 'PENDING', 'PUBLISHED', 'REJECTED']).optional().default('DRAFT'),
});
async function getAdminNews(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
        const skip = (page - 1) * limit;
        const statusParam = req.query.status;
        const categoryId = req.query.categoryId;
        const sourceId = req.query.sourceId;
        const reporterId = req.query.reporterId;
        const contentType = req.query.contentType;
        const search = req.query.search;
        const where = {};
        if (statusParam && statusParam !== 'ALL') {
            where.status = statusParam;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (sourceId) {
            where.sourceId = sourceId;
        }
        if (reporterId) {
            where.reporterId = reporterId;
        }
        if (contentType) {
            where.contentType = contentType;
        }
        if (search && search.trim().length > 0) {
            const q = search.trim();
            where.OR = [
                { titleGu: { contains: q, mode: 'insensitive' } },
                { title: { contains: q, mode: 'insensitive' } },
                { descriptionGu: { contains: q, mode: 'insensitive' } },
                { source: { name: { contains: q, mode: 'insensitive' } } },
            ];
        }
        const [items, total] = await Promise.all([
            prisma_js_1.prisma.news.findMany({
                where,
                include: {
                    category: {
                        select: { id: true, nameGu: true, name: true, slug: true },
                    },
                    source: {
                        select: { id: true, name: true, attributionName: true },
                    },
                    author: {
                        select: { id: true, name: true, email: true },
                    },
                    reporter: {
                        select: { id: true, name: true, designation: true, profileImage: true, slug: true },
                    },
                    sourceItem: {
                        select: {
                            title: true,
                            description: true,
                            rawImageUrl: true,
                            publishedDate: true,
                            sourceUrl: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
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
async function getAdminNewsById(req, res, next) {
    try {
        const { id } = req.params;
        const article = await prisma_js_1.prisma.news.findUnique({
            where: { id },
            include: {
                category: true,
                source: true,
                reporter: true,
                author: {
                    select: { id: true, name: true, email: true },
                },
                sourceItem: true, // Complete original RSS raw content for side-by-side editor!
            },
        });
        if (!article) {
            res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
            return;
        }
        res.json({ success: true, data: article });
    }
    catch (error) {
        next(error);
    }
}
async function createManualNews(req, res, next) {
    try {
        const data = newsInputSchema.parse(req.body);
        const userId = req.user?.userId;
        const userRole = req.user?.role;
        // Reporters can only save as DRAFT or submit for approval (PENDING)
        let finalStatus = data.status;
        if (finalStatus === client_1.NewsStatus.PUBLISHED && userRole === client_1.Role.REPORTER) {
            finalStatus = client_1.NewsStatus.PENDING;
        }
        const slug = (0, slugify_js_1.generateSlug)(data.titleGu || data.title);
        const article = await prisma_js_1.prisma.news.create({
            data: {
                title: data.title || data.titleGu,
                titleGu: data.titleGu,
                slug,
                description: data.description || data.descriptionGu,
                descriptionGu: data.descriptionGu,
                content: data.content,
                featuredImage: data.featuredImage || null,
                additionalImages: data.additionalImages,
                categoryId: data.categoryId,
                subCategoryId: data.subCategoryId || null,
                reporterId: data.reporterId || null,
                contentType: data.contentType || 'ARTICLE',
                videoUrl: data.videoUrl || null,
                contentBlocks: data.contentBlocks || undefined,
                aiHistory: data.aiHistory || undefined,
                originalTitleGu: data.originalTitleGu || data.titleGu,
                originalDescriptionGu: data.originalDescriptionGu || data.descriptionGu,
                originalContent: data.originalContent || data.content,
                authorId: userId,
                status: finalStatus,
                isBreaking: data.isBreaking,
                isTrending: data.isTrending,
                isFeatured: data.isFeatured,
                seoTitle: data.seoTitle || data.titleGu.substring(0, 70),
                seoDescription: data.seoDescription || data.descriptionGu?.substring(0, 160),
                tags: data.tags,
                publishedAt: finalStatus === client_1.NewsStatus.PUBLISHED ? new Date() : null,
            },
        });
        // If marked breaking and published
        if (finalStatus === client_1.NewsStatus.PUBLISHED && data.isBreaking) {
            await prisma_js_1.prisma.breakingNews.upsert({
                where: { newsId: article.id },
                update: { isActive: true, tickerText: data.titleGu },
                create: { newsId: article.id, tickerText: data.titleGu, isActive: true },
            });
        }
        // If marked trending and published
        if (finalStatus === client_1.NewsStatus.PUBLISHED && data.isTrending) {
            await prisma_js_1.prisma.trendingNews.upsert({
                where: { newsId: article.id },
                update: { isActive: true },
                create: { newsId: article.id, priority: 1, isActive: true },
            });
        }
        await (0, auditService_js_1.logAuditAction)({
            userId,
            action: 'CREATE_NEWS',
            targetType: 'NEWS',
            targetId: article.id,
            details: { titleGu: data.titleGu, status: finalStatus },
            ipAddress: req.ip,
        });
        res.status(201).json({
            success: true,
            message: 'સમાચાર સફળતાપૂર્વક સાચવવામાં આવ્યા',
            data: article,
        });
    }
    catch (error) {
        next(error);
    }
}
async function updateAdminNews(req, res, next) {
    try {
        const { id } = req.params;
        const data = newsInputSchema.partial().parse(req.body);
        const userId = req.user?.userId;
        const existing = await prisma_js_1.prisma.news.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
            return;
        }
        // Check reporter editing restrictions
        if (req.user?.role === client_1.Role.REPORTER && existing.authorId !== userId) {
            res.status(403).json({ success: false, message: 'તમે માત્ર તમારા પોતાના સમાચાર સંપાદિત કરી શકો છો' });
            return;
        }
        const updated = await prisma_js_1.prisma.news.update({
            where: { id },
            data: {
                ...(data.titleGu && { titleGu: data.titleGu }),
                ...(data.title && { title: data.title }),
                ...(data.descriptionGu !== undefined && { descriptionGu: data.descriptionGu }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.content && { content: data.content }),
                ...(data.categoryId && { categoryId: data.categoryId }),
                ...(data.subCategoryId !== undefined && { subCategoryId: data.subCategoryId }),
                ...(data.reporterId !== undefined && { reporterId: data.reporterId }),
                ...(data.contentType && { contentType: data.contentType }),
                ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
                ...(data.contentBlocks !== undefined && { contentBlocks: data.contentBlocks }),
                ...(data.aiHistory !== undefined && { aiHistory: data.aiHistory }),
                ...(data.featuredImage !== undefined && { featuredImage: data.featuredImage }),
                ...(data.additionalImages && { additionalImages: data.additionalImages }),
                ...(data.tags && { tags: data.tags }),
                ...(data.isBreaking !== undefined && { isBreaking: data.isBreaking }),
                ...(data.isTrending !== undefined && { isTrending: data.isTrending }),
                ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
                ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
                ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId,
            action: 'UPDATE_NEWS',
            targetType: 'NEWS',
            targetId: id,
            details: data,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'સમાચાર સફળતાપૂર્વક અપડેટ થયા', data: updated });
    }
    catch (error) {
        next(error);
    }
}
async function publishNews(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        // Server-side authorization check: Only SUPER_ADMIN, ADMIN and authorized EDITOR can publish
        if (![client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR].includes(req.user?.role)) {
            res.status(403).json({ success: false, message: 'સમાચાર પ્રકાશિત કરવાની પરવાનગી નથી' });
            return;
        }
        const article = await prisma_js_1.prisma.news.findUnique({ where: { id } });
        if (!article) {
            res.status(404).json({ success: false, message: 'સમાચાર મળ્યા નથી' });
            return;
        }
        // Require Gujarati headline and content before publication
        if (!article.titleGu || article.titleGu.trim().length < 5) {
            res.status(400).json({ success: false, message: 'પ્રકાશન માટે માન્ય ગુજરાતી હેડલાઇન આવશ્યક છે' });
            return;
        }
        const published = await prisma_js_1.prisma.news.update({
            where: { id },
            data: {
                status: client_1.NewsStatus.PUBLISHED,
                publishedAt: article.publishedAt || new Date(),
                approvedAt: new Date(),
                approvedById: userId || null,
                rejectionReason: null,
            },
        });
        // If marked breaking, ensure active in breaking ticker
        if (published.isBreaking) {
            await prisma_js_1.prisma.breakingNews.upsert({
                where: { newsId: id },
                update: { isActive: true, tickerText: published.titleGu },
                create: { newsId: id, tickerText: published.titleGu, isActive: true },
            });
        }
        // If marked trending, ensure active in trending
        if (published.isTrending) {
            await prisma_js_1.prisma.trendingNews.upsert({
                where: { newsId: id },
                update: { isActive: true },
                create: { newsId: id, priority: 1, isActive: true },
            });
        }
        await (0, auditService_js_1.logAuditAction)({
            userId,
            action: 'PUBLISH_NEWS',
            targetType: 'NEWS',
            targetId: id,
            details: { titleGu: published.titleGu },
            ipAddress: req.ip,
        });
        res.json({
            success: true,
            message: 'સમાચાર સફળતાપૂર્વક મંજૂર કરી વેબસાઇટ પર પ્રકાશિત કરવામાં આવ્યા!',
            data: published,
        });
    }
    catch (error) {
        next(error);
    }
}
async function rejectNews(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (![client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR].includes(req.user?.role)) {
            res.status(403).json({ success: false, message: 'સમાચાર નકારવાની પરવાનગી નથી' });
            return;
        }
        const reason = (req.body.reason || '').trim();
        if (!reason) {
            res.status(400).json({ success: false, message: 'સમાચાર નકારવા માટે યોગ્ય કારણ જણાવવું આવશ્યક છે' });
            return;
        }
        const rejected = await prisma_js_1.prisma.news.update({
            where: { id },
            data: {
                status: client_1.NewsStatus.REJECTED,
                rejectionReason: reason,
            },
        });
        // Remove from breaking & trending if exists
        await Promise.all([
            prisma_js_1.prisma.breakingNews.deleteMany({ where: { newsId: id } }),
            prisma_js_1.prisma.trendingNews.deleteMany({ where: { newsId: id } }),
        ]);
        await (0, auditService_js_1.logAuditAction)({
            userId,
            action: 'REJECT_NEWS',
            targetType: 'NEWS',
            targetId: id,
            details: { reason: req.body.reason || 'સંપાદક દ્વારા નકારવામાં આવ્યું' },
            ipAddress: req.ip,
        });
        res.json({
            success: true,
            message: 'સમાચાર નકારવામાં આવ્યા (Status: REJECTED)',
            data: rejected,
        });
    }
    catch (error) {
        next(error);
    }
}
async function deleteNews(req, res, next) {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        if (![client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN].includes(req.user?.role)) {
            res.status(403).json({ success: false, message: 'સમાચાર કાઢી નાખવાની પરવાનગી માત્ર એડમિન પાસે છે' });
            return;
        }
        await prisma_js_1.prisma.news.delete({ where: { id } });
        await (0, auditService_js_1.logAuditAction)({
            userId,
            action: 'DELETE_NEWS',
            targetType: 'NEWS',
            targetId: id,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'સમાચાર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા' });
    }
    catch (error) {
        next(error);
    }
}
async function bulkDeleteNews(req, res, next) {
    try {
        const { ids } = req.body;
        const userId = req.user?.userId;
        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ success: false, message: 'કોઈ સમાચાર પસંદ કરવામાં આવ્યા નથી' });
            return;
        }
        if (![client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR].includes(req.user?.role)) {
            res.status(403).json({ success: false, message: 'સમાચાર કાઢી નાખવાની પરવાનગી નથી' });
            return;
        }
        const result = await prisma_js_1.prisma.news.deleteMany({
            where: {
                id: { in: ids },
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId,
            action: 'BULK_DELETE_NEWS',
            targetType: 'NEWS',
            targetId: ids.slice(0, 10).join(','),
            details: { deletedCount: result.count },
            ipAddress: req.ip,
        });
        res.json({
            success: true,
            message: `${result.count} સમાચાર સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા`,
            deletedCount: result.count,
        });
    }
    catch (error) {
        next(error);
    }
}
