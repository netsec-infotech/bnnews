"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = getCategories;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.getPublicNavigation = getPublicNavigation;
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
const auditService_js_1 = require("../services/auditService.js");
const slugify_js_1 = require("../utils/slugify.js");
const categorySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'કેટેગરી નામ આવશ્યક છે'),
    nameGu: zod_1.z.string().min(2, 'ગુજરાતી નામ આવશ્યક છે'),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional().nullable(),
    icon: zod_1.z.string().optional().nullable(),
    image: zod_1.z.string().optional().nullable(),
    order: zod_1.z.number().default(0),
    isActive: zod_1.z.boolean().default(true),
    seoTitle: zod_1.z.string().optional().nullable(),
    seoDesc: zod_1.z.string().optional().nullable(),
    parentId: zod_1.z.string().optional().nullable(),
    showInNavbar: zod_1.z.boolean().default(true),
    showOnHome: zod_1.z.boolean().default(true),
    isSubmenu: zod_1.z.boolean().default(false),
    openInNewTab: zod_1.z.boolean().default(false),
});
async function getCategories(req, res, next) {
    try {
        const categories = await prisma_js_1.prisma.category.findMany({
            include: {
                parent: {
                    select: { id: true, name: true, nameGu: true, slug: true },
                },
                children: {
                    select: { id: true, name: true, nameGu: true, slug: true, order: true, showInNavbar: true },
                    orderBy: { order: 'asc' },
                },
                _count: {
                    select: {
                        news: true,
                        rssSources: true,
                        children: true,
                    },
                },
            },
            orderBy: [{ order: 'asc' }, { nameGu: 'asc' }],
        });
        res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
}
async function createCategory(req, res, next) {
    try {
        const data = categorySchema.parse(req.body);
        const slug = data.slug || (0, slugify_js_1.generateSlug)(data.name, '');
        const existing = await prisma_js_1.prisma.category.findUnique({ where: { slug } });
        if (existing) {
            res.status(400).json({ success: false, message: 'આ કેટેગરી સ્લગ પહેલેથી અસ્તિત્વમાં છે.' });
            return;
        }
        const category = await prisma_js_1.prisma.category.create({
            data: {
                name: data.name,
                nameGu: data.nameGu,
                slug,
                description: data.description,
                icon: data.icon,
                image: data.image,
                order: data.order,
                isActive: data.isActive,
                seoTitle: data.seoTitle,
                seoDesc: data.seoDesc,
                parentId: data.parentId || null,
                showInNavbar: data.showInNavbar ?? true,
                showOnHome: data.showOnHome ?? true,
                isSubmenu: Boolean(data.parentId || data.isSubmenu),
                openInNewTab: data.openInNewTab ?? false,
            },
            include: {
                parent: true,
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'CREATE_CATEGORY',
            targetType: 'CATEGORY',
            targetId: category.id,
            details: { nameGu: category.nameGu, slug: category.slug },
            ipAddress: req.ip,
        });
        res.status(201).json({ success: true, message: 'કેટેગરી સફળતાપૂર્વક ઉમેરાઈ ગઈ', data: category });
    }
    catch (error) {
        next(error);
    }
}
async function updateCategory(req, res, next) {
    try {
        const { id } = req.params;
        const data = categorySchema.partial().parse(req.body);
        if (data.parentId && data.parentId === id) {
            res.status(400).json({ success: false, message: 'કેટેગરી પોતે પોતાની પેરન્ટ હોઈ શકે નહીં.' });
            return;
        }
        const category = await prisma_js_1.prisma.category.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.nameGu && { nameGu: data.nameGu }),
                ...(data.slug && { slug: data.slug }),
                ...(data.description !== undefined && { description: data.description }),
                ...(data.icon !== undefined && { icon: data.icon }),
                ...(data.image !== undefined && { image: data.image }),
                ...(data.order !== undefined && { order: data.order }),
                ...(data.isActive !== undefined && { isActive: data.isActive }),
                ...(data.seoTitle !== undefined && { seoTitle: data.seoTitle }),
                ...(data.seoDesc !== undefined && { seoDesc: data.seoDesc }),
                ...(data.parentId !== undefined && { parentId: data.parentId || null }),
                ...(data.showInNavbar !== undefined && { showInNavbar: data.showInNavbar }),
                ...(data.showOnHome !== undefined && { showOnHome: data.showOnHome }),
                ...(data.isSubmenu !== undefined && { isSubmenu: data.isSubmenu }),
                ...(data.openInNewTab !== undefined && { openInNewTab: data.openInNewTab }),
            },
            include: {
                parent: true,
                children: true,
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'UPDATE_CATEGORY',
            targetType: 'CATEGORY',
            targetId: id,
            details: data,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'કેટેગરી સફળતાપૂર્વક અપડેટ થઈ', data: category });
    }
    catch (error) {
        next(error);
    }
}
async function deleteCategory(req, res, next) {
    try {
        const { id } = req.params;
        if (![client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN].includes(req.user?.role)) {
            res.status(403).json({ success: false, message: 'પરવાનગી નકારી' });
            return;
        }
        const newsCount = await prisma_js_1.prisma.news.count({ where: { categoryId: id } });
        if (newsCount > 0) {
            res.status(400).json({
                success: false,
                message: `આ કેટેગરીમાં ${newsCount} સમાચાર છે, તેથી તેને કાઢી શકાશે નહીં. પ્રથમ સમાચારની કેટેગરી બદલો.`,
            });
            return;
        }
        // Unlink any children first
        await prisma_js_1.prisma.category.updateMany({
            where: { parentId: id },
            data: { parentId: null },
        });
        await prisma_js_1.prisma.category.delete({ where: { id } });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'DELETE_CATEGORY',
            targetType: 'CATEGORY',
            targetId: id,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'કેટેગરી કાઢી નાખવામાં આવી' });
    }
    catch (error) {
        next(error);
    }
}
/**
 * Public dynamic navigation menu tree
 */
async function getPublicNavigation(req, res) {
    try {
        // Fetch all active categories that are set to show in navbar
        const categories = await prisma_js_1.prisma.category.findMany({
            where: {
                isActive: true,
                showInNavbar: true,
            },
            orderBy: { order: 'asc' },
            select: {
                id: true,
                name: true,
                nameGu: true,
                slug: true,
                parentId: true,
                order: true,
                icon: true,
                isSubmenu: true,
                openInNewTab: true,
            },
        });
        // Build hierarchical tree
        const rootItems = categories.filter((c) => !c.parentId);
        const tree = rootItems.map((parent) => {
            const children = categories.filter((c) => c.parentId === parent.id);
            return {
                ...parent,
                hasSubmenu: children.length > 0,
                children,
            };
        });
        res.json({ success: true, data: tree });
    }
    catch (error) {
        console.error('getPublicNavigation error:', error);
        res.status(500).json({ success: false, message: 'નેવિગેશન મેનુ લોડ કરવામાં ક્ષતિ આવી.' });
    }
}
