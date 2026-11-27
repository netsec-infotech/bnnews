"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditAction = logAuditAction;
const prisma_js_1 = require("../config/prisma.js");
async function logAuditAction({ userId, action, targetType, targetId, details, ipAddress, }) {
    try {
        await prisma_js_1.prisma.auditLog.create({
            data: {
                userId: userId || null,
                action,
                targetType,
                targetId: targetId || null,
                details: details ? (typeof details === 'object' ? details : { raw: details }) : undefined,
                ipAddress: ipAddress || null,
            },
        });
    }
    catch (error) {
        console.error('Audit Log failed:', error);
    }
}
