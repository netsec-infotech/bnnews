"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSettings = getAllSettings;
exports.updateSettings = updateSettings;
exports.getAuditLogs = getAuditLogs;
const prisma_js_1 = require("../config/prisma.js");
const auditService_js_1 = require("../services/auditService.js");
async function getAllSettings(req, res, next) {
    try {
        const settings = await prisma_js_1.prisma.websiteSetting.findMany({
            orderBy: { group: 'asc' },
        });
        res.json({ success: true, data: settings });
    }
    catch (error) {
        next(error);
    }
}
async function updateSettings(req, res, next) {
    try {
        const settingsObj = req.body;
        for (const [key, value] of Object.entries(settingsObj)) {
            await prisma_js_1.prisma.websiteSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: {
                    key,
                    value: String(value),
                    group: 'general',
                },
            });
        }
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'UPDATE_SETTINGS',
            targetType: 'SETTINGS',
            details: settingsObj,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા' });
    }
    catch (error) {
        next(error);
    }
}
async function getAuditLogs(req, res, next) {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            prisma_js_1.prisma.auditLog.findMany({
                include: {
                    user: { select: { id: true, name: true, email: true, role: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma_js_1.prisma.auditLog.count(),
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
