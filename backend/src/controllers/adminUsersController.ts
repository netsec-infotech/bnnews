import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { logAuditAction } from '../services/auditService.js';

const createUserSchema = z.object({
  name: z.string().min(2, 'નામ આવશ્યક છે'),
  email: z.string().email('માન્ય ઈમેલ સરનામું દાખલ કરો'),
  password: z.string().min(6, 'પાસવર્ડ ઓછામાં ઓછો 6 અક્ષરોનો હોવો જોઈએ'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER']).default('REPORTER'),
  isActive: z.boolean().default(true),
});

export async function getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await prisma.user.findMany({
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
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = createUserSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'આ ઈમેલ પહેલેથી નોંધાયેલ છે' });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as Role,
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

    await logAuditAction({
      userId: req.user?.userId,
      action: 'CREATE_USER',
      targetType: 'USER',
      targetId: user.id,
      details: { email: user.email, role: user.role },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'વપરાશકર્તા સફળતાપૂર્વક ઉમેરાયા', data: user });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const schema = z.object({
      name: z.string().optional(),
      role: z.enum(['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'REPORTER']).optional(),
      isActive: z.boolean().optional(),
      password: z.string().min(6).optional(),
    });

    const data = schema.parse(req.body);
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role as Role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.update({
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

    await logAuditAction({
      userId: req.user?.userId,
      action: 'UPDATE_USER',
      targetType: 'USER',
      targetId: id,
      details: { role: data.role, isActive: data.isActive },
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'વપરાશકર્તા સફળતાપૂર્વક અપડેટ થયા', data: user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (id === req.user?.userId) {
      res.status(400).json({ success: false, message: 'તમે તમારું પોતાનું એકાઉન્ટ કાઢી શકતા નથી' });
      return;
    }

    await prisma.user.delete({ where: { id } });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'DELETE_USER',
      targetType: 'USER',
      targetId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'વપરાશકર્તા સફળતાપૂર્વક કાઢી નાખવામાં આવ્યા' });
  } catch (error) {
    next(error);
  }
}
