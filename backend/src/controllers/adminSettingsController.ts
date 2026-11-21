import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';
import { logAuditAction } from '../services/auditService.js';

export async function getAllSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settings = await prisma.websiteSetting.findMany({
      orderBy: { group: 'asc' },
    });
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const settingsObj = req.body as Record<string, string>;

    for (const [key, value] of Object.entries(settingsObj)) {
      await prisma.websiteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: {
          key,
          value: String(value),
          group: 'general',
        },
      });
    }

    await logAuditAction({
      userId: req.user?.userId,
      action: 'UPDATE_SETTINGS',
      targetType: 'SETTINGS',
      details: settingsObj,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા' });
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count(),
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
  } catch (error) {
    next(error);
  }
}
