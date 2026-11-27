"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminReporters = getAdminReporters;
exports.getReporterById = getReporterById;
exports.createReporter = createReporter;
exports.updateReporter = updateReporter;
exports.toggleReporterStatus = toggleReporterStatus;
exports.deleteReporter = deleteReporter;
exports.getPublicReporters = getPublicReporters;
exports.getPublicReporterBySlug = getPublicReporterBySlug;
const slugify_1 = __importDefault(require("slugify"));
const prisma_js_1 = require("../config/prisma.js");
/**
 * Generate a unique slug for a reporter
 */
async function generateUniqueSlug(name, currentId) {
    let baseSlug = (0, slugify_1.default)(name, { lower: true, strict: true, trim: true });
    if (!baseSlug) {
        baseSlug = `reporter-${Date.now().toString(36)}`;
    }
    let slug = baseSlug;
    let counter = 1;
    while (true) {
        const existing = await prisma_js_1.prisma.reporter.findUnique({
            where: { slug },
        });
        if (!existing || (currentId && existing.id === currentId)) {
            return slug;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
}
// ==========================================
// ADMIN REPORTER CONTROLLERS
// ==========================================
async function getAdminReporters(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        const status = req.query.status;
        const where = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { designation: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [total, reporters] = await Promise.all([
            prisma_js_1.prisma.reporter.count({ where }),
            prisma_js_1.prisma.reporter.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
                include: {
                    _count: {
                        select: { news: true },
                    },
                },
            }),
        ]);
        return res.json({
            success: true,
            data: reporters,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        console.error('getAdminReporters error:', error);
        return res.status(500).json({ success: false, message: 'રિપોર્ટર્સની વિગતો મેળવવામાં નિષ્ફળતા.' });
    }
}
async function getReporterById(req, res) {
    try {
        const { id } = req.params;
        const reporter = await prisma_js_1.prisma.reporter.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { news: true },
                },
            },
        });
        if (!reporter) {
            return res.status(404).json({ success: false, message: 'રિપોર્ટર મળ્યા નથી.' });
        }
        return res.json({ success: true, data: reporter });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'રિપોર્ટર મેળવવામાં ક્ષતિ આવી.' });
    }
}
async function createReporter(req, res) {
    try {
        const { name, designation, profileImage, biography, location, email, phone, experience, languages, specialization, socialLinks, status, isFeatured, joiningDate, } = req.body;
        if (!name || !name.trim()) {
            return res.status(400).json({ success: false, message: 'રિપોર્ટરનું પૂરું નામ આપવું ફરજિયાત છે.' });
        }
        const slug = await generateUniqueSlug(name.trim());
        const reporter = await prisma_js_1.prisma.reporter.create({
            data: {
                name: name.trim(),
                slug,
                designation: designation?.trim() || 'પત્રકાર (News Reporter)',
                profileImage: profileImage || null,
                biography: biography || null,
                location: location || 'ગુજરાત',
                email: email || null,
                phone: phone || null,
                experience: experience || '3+ વર્ષ',
                languages: Array.isArray(languages) ? languages : ['ગુજરાતી'],
                specialization: specialization || 'સ્થાનિક અને મહત્વપૂર્ણ સમાચાર',
                socialLinks: socialLinks || {},
                status: status || 'ACTIVE',
                isFeatured: Boolean(isFeatured),
                joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
            },
        });
        return res.status(201).json({ success: true, data: reporter, message: 'રિપોર્ટર સફળતાપૂર્વક ઉમેરાયા.' });
    }
    catch (error) {
        console.error('createReporter error:', error);
        return res.status(500).json({ success: false, message: error.message || 'રિપોર્ટર ઉમેરવામાં નિષ્ફળતા.' });
    }
}
async function updateReporter(req, res) {
    try {
        const { id } = req.params;
        const { name, designation, profileImage, biography, location, email, phone, experience, languages, specialization, socialLinks, status, isFeatured, joiningDate, } = req.body;
        const existing = await prisma_js_1.prisma.reporter.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'રિપોર્ટર મળ્યા નથી.' });
        }
        let slug = existing.slug;
        if (name && name.trim() !== existing.name) {
            slug = await generateUniqueSlug(name.trim(), id);
        }
        const updated = await prisma_js_1.prisma.reporter.update({
            where: { id },
            data: {
                name: name !== undefined ? name.trim() : existing.name,
                slug,
                designation: designation !== undefined ? designation : existing.designation,
                profileImage: profileImage !== undefined ? profileImage : existing.profileImage,
                biography: biography !== undefined ? biography : existing.biography,
                location: location !== undefined ? location : existing.location,
                email: email !== undefined ? email : existing.email,
                phone: phone !== undefined ? phone : existing.phone,
                experience: experience !== undefined ? experience : existing.experience,
                languages: Array.isArray(languages) ? languages : existing.languages,
                specialization: specialization !== undefined ? specialization : existing.specialization,
                socialLinks: socialLinks !== undefined ? socialLinks : existing.socialLinks,
                status: status !== undefined ? status : existing.status,
                isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
                joiningDate: joiningDate ? new Date(joiningDate) : existing.joiningDate,
            },
        });
        return res.json({ success: true, data: updated, message: 'રિપોર્ટરની વિગતો અપડેટ થઈ.' });
    }
    catch (error) {
        console.error('updateReporter error:', error);
        return res.status(500).json({ success: false, message: error.message || 'અપડેટ કરવામાં ક્ષતિ આવી.' });
    }
}
async function toggleReporterStatus(req, res) {
    try {
        const { id } = req.params;
        const existing = await prisma_js_1.prisma.reporter.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'રિપોર્ટર મળ્યા નથી.' });
        }
        const newStatus = existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const updated = await prisma_js_1.prisma.reporter.update({
            where: { id },
            data: { status: newStatus },
        });
        return res.json({
            success: true,
            data: updated,
            message: `રિપોર્ટર ${newStatus === 'ACTIVE' ? 'સક્રિય' : 'નિષ્ક્રિય'} કરવામાં આવ્યા.`,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'સ્ટેટસ બદલવામાં ક્ષતિ આવી.' });
    }
}
async function deleteReporter(req, res) {
    try {
        const { id } = req.params;
        const reporter = await prisma_js_1.prisma.reporter.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { news: true },
                },
            },
        });
        if (!reporter) {
            return res.status(404).json({ success: false, message: 'રિપોર્ટર મળ્યા નથી.' });
        }
        // If reporter has published news, unlink them rather than failing
        await prisma_js_1.prisma.news.updateMany({
            where: { reporterId: id },
            data: { reporterId: null },
        });
        await prisma_js_1.prisma.reporter.delete({ where: { id } });
        return res.json({
            success: true,
            message: `રિપોર્ટર '${reporter.name}' સફળતાપૂર્વક ડિલીટ કરવામાં આવ્યા.`,
        });
    }
    catch (error) {
        console.error('deleteReporter error:', error);
        return res.status(500).json({ success: false, message: 'ડિલીટ કરવામાં ક્ષતિ આવી.' });
    }
}
// ==========================================
// PUBLIC REPORTER CONTROLLERS
// ==========================================
async function getPublicReporters(req, res) {
    try {
        const reporters = await prisma_js_1.prisma.reporter.findMany({
            where: { status: 'ACTIVE' },
            orderBy: [{ isFeatured: 'desc' }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                slug: true,
                designation: true,
                profileImage: true,
                biography: true,
                location: true,
                experience: true,
                languages: true,
                specialization: true,
                socialLinks: true,
                isFeatured: true,
                _count: {
                    select: {
                        news: {
                            where: { status: 'PUBLISHED' },
                        },
                    },
                },
            },
        });
        return res.json({ success: true, data: reporters });
    }
    catch (error) {
        console.error('getPublicReporters error:', error);
        return res.status(500).json({ success: false, message: 'રિપોર્ટર્સ મેળવવામાં નિષ્ફળતા.' });
    }
}
async function getPublicReporterBySlug(req, res) {
    try {
        const { slug } = req.params;
        const reporter = await prisma_js_1.prisma.reporter.findFirst({
            where: {
                slug,
                status: 'ACTIVE',
            },
            include: {
                _count: {
                    select: {
                        news: {
                            where: { status: 'PUBLISHED' },
                        },
                    },
                },
            },
        });
        if (!reporter) {
            return res.status(404).json({ success: false, message: 'રિપોર્ટર પ્રોફાઇલ મળી નથી.' });
        }
        // Fetch latest 10 published articles by this reporter
        const latestNews = await prisma_js_1.prisma.news.findMany({
            where: {
                reporterId: reporter.id,
                status: 'PUBLISHED',
            },
            take: 10,
            orderBy: { publishedAt: 'desc' },
            include: {
                category: {
                    select: { name: true, nameGu: true, slug: true },
                },
            },
        });
        return res.json({
            success: true,
            data: {
                reporter,
                latestNews,
                totalArticles: reporter._count.news,
            },
        });
    }
    catch (error) {
        console.error('getPublicReporterBySlug error:', error);
        return res.status(500).json({ success: false, message: 'વિગતો મેળવવામાં નિષ્ફળતા.' });
    }
}
