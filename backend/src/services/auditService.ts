import { prisma } from '../config/prisma.js';

export async function logAuditAction({
  userId,
  action,
  targetType,
  targetId,
  details,
  ipAddress,
}: {
  userId?: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        targetType,
        targetId: targetId || null,
        details: details ? (typeof details === 'object' ? details : { raw: details }) : undefined,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Audit Log failed:', error);
  }
}
