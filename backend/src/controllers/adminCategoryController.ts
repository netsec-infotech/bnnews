import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';
import { logAuditAction } from '../services/auditService.js';
import { generateSlug } from '../utils/slugify.js';

const categorySchema = z.object({
  name: z.string().min(2, 'કેટેગરી નામ આવશ્યક છે'),
  nameGu: z.string().min(2, 'ગુજરાતી નામ આવશ્યક છે'),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
});

export async function getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            news: true,
            rssSources: true,
          },
        },
      },
      orderBy: { order: 'asc' },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = categorySchema.parse(req.body);
    const slug = data.slug || generateSlug(data.name, '');

    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ success: false, message: 'આ કેટેગરી સ્લગ પહેલેથી અસ્તિત્વમાં છે.' });
      return;
    }

    const category = await prisma.category.create({
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
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'CREATE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: category.id,
      details: { nameGu: category.nameGu, slug: category.slug },
      ipAddress: req.ip,
    });

    res.status(201).json({ success: true, message: 'કેટેગરી ઉમેરાઈ ગઈ', data: category });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const data = categorySchema.partial().parse(req.body);

    const category = await prisma.category.update({
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
      },
    });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'UPDATE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: id,
      details: data,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'કેટેગરી સફળતાપૂર્વક અપડેટ થઈ', data: category });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;

    if (!([Role.SUPER_ADMIN, Role.ADMIN] as Role[]).includes(req.user?.role as Role)) {
      res.status(403).json({ success: false, message: 'પરવાનગી નકારી' });
      return;
    }

    const newsCount = await prisma.news.count({ where: { categoryId: id } });
    if (newsCount > 0) {
      res.status(400).json({
        success: false,
        message: `આ કેટેગરીમાં ${newsCount} સમાચાર છે, તેથી તેને કાઢી શકાશે નહીં. પ્રથમ સમાચારની કેટેગરી બદલો.`,
      });
      return;
    }

    await prisma.category.delete({ where: { id } });

    await logAuditAction({
      userId: req.user?.userId,
      action: 'DELETE_CATEGORY',
      targetType: 'CATEGORY',
      targetId: id,
      ipAddress: req.ip,
    });

    res.json({ success: true, message: 'કેટેગરી કાઢી નાખવામાં આવી' });
  } catch (error) {
    next(error);
  }
}
