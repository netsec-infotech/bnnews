"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
const prisma_js_1 = require("../config/prisma.js");
const auditService_js_1 = require("../services/auditService.js");
const createUserSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'નામ આવશ્યક છે'),
    email: zod_1.z.string().email('માન્ય ઈમેલ સરનામું દાખલ કરો'),
    password: zod_1.z.string().min(6, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરોનો હોવો જોઈએ'),
    role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER']).default('REPORTER'),
    isActive: zod_1.z.boolean().default(true),
});
async function getUsers(req, res, next) {
    try {
        const users = await prisma_js_1.prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                avatar: true,
                isActive: true,
                createdAt: true,
                _count: { select: { news: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: users });
    }
    catch (error) {
        next(error);
    }
}
async function createUser(req, res, next) {
    try {
        const data = createUserSchema.parse(req.body);
        const existing = await prisma_js_1.prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            res.status(400).json({ success: false, message: 'આ ઈમેલ પહેલેથી નોંધાયેલ છે' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        const user = await prisma_js_1.prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                isActive: data.isActive,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'CREATE_USER',
            targetType: 'USER',
            targetId: user.id,
            details: { email: user.email, role: user.role },
            ipAddress: req.ip,
        });
        res.status(201).json({ success: true, message: 'વપરાશકર્તા સફળતાપૂર્વક ઉમેરાયા', data: user });
    }
    catch (error) {
        next(error);
    }
}
async function updateUser(req, res, next) {
    try {
        const { id } = req.params;
        const schema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            role: zod_1.z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER']).optional(),
            isActive: zod_1.z.boolean().optional(),
            password: zod_1.z.string().min(6).optional(),
        });
        const data = schema.parse(req.body);
        const updateData = {};
        if (data.name)
            updateData.name = data.name;
        if (data.role)
            updateData.role = data.role;
        if (data.isActive !== undefined)
            updateData.isActive = data.isActive;
        if (data.password)
            updateData.password = await bcrypt_1.default.hash(data.password, 10);
        const user = await prisma_js_1.prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                updatedAt: true,
            },
        });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'UPDATE_USER',
            targetType: 'USER',
            targetId: id,
            details: { role: data.role, isActive: data.isActive },
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'વપરાશકર્તા સફળતાપૂર્વક અપડેટ થયા', data: user });
    }
    catch (error) {
        next(error);
    }
}
async function deleteUser(req, res, next) {
    try {
        const { id } = req.params;
        if (id === req.user?.userId) {
            res.status(400).json({ success: false, message: 'તમે તમારું પોતાનું એકાઉન્ટ કાઢી શકતા નથી' });
            return;
        }
        await prisma_js_1.prisma.user.delete({ where: { id } });
        await (0, auditService_js_1.logAuditAction)({
            userId: req.user?.userId,
            action: 'DELETE_USER',
            targetType: 'USER',
            targetId: id,
            ipAddress: req.ip,
        });
        res.json({ success: true, message: 'વપરાશકર્તા સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા' });
    }
    catch (error) {
        next(error);
    }
}
