"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRssSources = getRssSources;
exports.createRssSource = createRssSource;
exports.updateRssSource = updateRssSource;
exports.deleteRssSource = deleteRssSource;
exports.testRssFeed = testRssFeed;
exports.triggerManualFetch = triggerManualFetch;
exports.getRssLogs = getRssLogs;
const zod_1 = require("zod");
const rss_parser_1 = __importDefault(require("rss-parser"));
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
const rssService_js_1 = require("../services/rssService.js");
const auditService_js_1 = require("../services/auditService.js");
const parser = new rss_parser_1.default({ timeout: 10000 });
const rssSourceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'સ્ત્રોત નામ આવશ્યક છે'),
    feedUrl: zod_1.z.string().url('માન્ય RSS ફીડ URL દાખલ કરો'),
    websiteUrl: zod_1.z.string().url('માન્ય વેબસાઇટ URL દાખલ કરો').optional().nullable(),
    defaultCategoryId: zod_1.z.string().uuid('માન્ય કેટેગરી પસંદ કરો').optional().nullable(),
    collectionInterval: zod_1.z.number().min(5).max(1440).default(30),
    status: zod_1.z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
    language: zod_1.z.string().default('gu'),
    attributionName: zod_1.z.string().optional().nullable(),
});
async function getRssSources(req, res, next) {
    try {
        const sources = await prisma_js_1.prisma.rssSource.findMany({
            include: {
                defaultCategory: { select: { id: true, nameGu: true, name: true } },
                _count: {
                    select: {
                        news: true,
                        sourceItems: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: sources });
    }
    catch (error) {
        next(error);
    }
}
async function createRssSource(req, res, next) {
    try {
        const data = rssSourceSchema.parse(req.body);
        const existing = await prisma_js_1.prisma.rssSource.findUnique({
            where: { feedUrl: data.feedUrl },
        });
        if (existing) {
            res.status(400).json({ success: false, message: 'આ RSS Feed URL પહેલેથી અસ્તિત્વમાં છે.' });
            return;
        }
        const source = await prisma_js_1.prisma.rssSource.create({
            data: {
                name: data.name,
                feedUrl: data.feedUrl,
                websiteUrl: data.websiteUrl || null,
                defaultCategoryId: data.defaultCategoryId || null,
                collectionInterval: data.collectionInterval,
                status: data.status,
                language: data.language,
                attributionName: data.attributionName || data.name,
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'CREATE_RSS_SOURCE',
            targetType: 'RSS_SOURCE',
            targetId: source.id,
            details: { name: source.name, feedUrl: source.feedUrl },
            ipAddress: req.ip,
        });
        res.status(201).json({ success: true, message: 'RSS સ્ત્રોત સફળતાપૂર્વક ઉમેરવામાં આવ્યો', data: source });
    }
    catch (error) {
        next(error);
    }
}
async function updateRssSource(req, res, next) {
    try {
        const { id } = req.params;
        const data = rssSourceSchema.partial().parse(req.body);
        const source = await prisma_js_1.prisma.rssSource.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.feedUrl && { feedUrl: data.feedUrl }),
                ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
                ...(data.defaultCategoryId !== undefined && { defaultCategoryId: data.defaultCategoryId }),
                ...(data.collectionInterval && { collectionInterval: data.collectionInterval }),
                ...(data.status && { status: data.status }),
                ...(data.language && { language: data.language }),
                ...(data.attributionName !== undefined && { attributionName: data.attributionName }),
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'UPDATE_RSS_SOURCE',
            targetType: 'RSS_SOURCE',
            targetId: id,
            details: data,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'RSS સ્ત્રોત અપડેટ થયો', data: source });
    }
    catch (error) {
        next(error);
    }
}
async function deleteRssSource(req, res, next) {
    try {
        const { id } = req.params;
        if (![client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN].includes(req.user?.role)) {
            res.status(403).json({ success: false, message: 'પરવાનગી નકારી' });
            return;
        }
        await prisma_js_1.prisma.rssSource.delete({ where: { id } });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'DELETE_RSS_SOURCE',
            targetType: 'RSS_SOURCE',
            targetId: id,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'RSS સ્ત્રોત કાઢી નાખવામાં આવ્યો' });
    }
    catch (error) {
        next(error);
    }
}
async function testRssFeed(req, res, next) {
    try {
        const feedUrl = req.body.feedUrl;
        if (!feedUrl) {
            res.status(400).json({ success: false, message: 'Feed URL આવશ્યક છે' });
            return;
        }
        const feed = await parser.parseURL(feedUrl);
        const sampleItems = (feed.items || []).slice(0, 3).map((item) => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            contentSnippet: item.contentSnippet?.substring(0, 150),
        }));
        res.json({
            success: true,
            message: 'RSS ફીડ કનેક્શન સફળ રહ્યું!',
            feedTitle: feed.title,
            feedDescription: feed.description,
            totalItemsFound: feed.items?.length || 0,
            sampleItems,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: `RSS કનેક્શન નિષ્ફળ: ${error.message || 'અમાન્ય ફીડ XML'}`,
        });
    }
}
async function triggerManualFetch(req, res, next) {
    try {
        const { id } = req.params;
        // Directly execute fetch or queue it
        const result = await (0, rssService_js_1.fetchRssSource)(id);
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'MANUAL_RSS_FETCH',
            targetType: 'RSS_SOURCE',
            targetId: id,
            details: result,
            ipAddress: req.ip,
        });
        res.json({
            success: result.success,
            message: result.message,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
}
async function getRssLogs(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const sourceId = req.query.sourceId;
        const where = {};
        if (sourceId) {
            where.sourceId = sourceId;
        }
        const [logs, total] = await Promise.all([
            prisma_js_1.prisma.rssLog.findMany({
                where,
                include: {
                    source: { select: { id: true, name: true, feedUrl: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_js_1.prisma.rssLog.count({ where }),
        ]);
        res.json({
            success: true,
            data: logs,
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
