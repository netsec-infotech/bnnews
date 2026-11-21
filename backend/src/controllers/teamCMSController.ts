import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AuthenticatedRequest } from '../types/index.js';

// ==========================================
// 1. ADMIN TEAM DEPARTMENTS
// ==========================================

export async function getTeamDepartments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await prisma.teamDepartment.findMany({
      include: {
        _count: { select: { members: true } },
      },
      orderBy: { order: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
}

export async function createTeamDepartment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, nameGu, slug, order } = req.body;
    if (!name || !nameGu) {
      res.status(400).json({ success: false, message: 'Department name is required' });
      return;
    }

    const deptSlug = slug || name.toLowerCase().replace(/[^\w]+/g, '-');
    const department = await prisma.teamDepartment.create({
      data: { name, nameGu, slug: deptSlug, order: order || 0, isActive: true },
    });
    res.status(201).json({ success: true, data: department });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. ADMIN TEAM MEMBERS
// ==========================================

export async function getAdminTeamMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentId, search } = req.query;

    const where: any = {};
    if (departmentId) {
      where.departmentId = String(departmentId);
    }
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { nameGu: { contains: String(search), mode: 'insensitive' } },
        { designation: { contains: String(search), mode: 'insensitive' } },
        { designationGu: { contains: String(search), mode: 'insensitive' } },
      ];
    }

    const members = await prisma.teamMember.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, nameGu: true, slug: true } },
      },
      orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: members });
  } catch (err) {
    next(err);
  }
}

export async function createTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      name,
      nameGu,
      slug,
      photoUrl,
      designation,
      designationGu,
      departmentId,
      bio,
      bioGu,
      experienceYears,
      district,
      languages,
      email,
      phone,
      facebookUrl,
      instagramUrl,
      linkedinUrl,
      youtubeUrl,
      displayOrder,
      isFeatured,
      isActive,
    } = req.body;

    if (!name || !nameGu || !designationGu || !departmentId) {
      res.status(400).json({ success: false, message: 'Name, Gujarati name, designation, and department are required' });
      return;
    }

    const memberSlug = slug || name.toLowerCase().replace(/[^\w]+/g, '-') + '-' + Date.now().toString(36);

    const member = await prisma.teamMember.create({
      data: {
        name,
        nameGu,
        slug: memberSlug,
        photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        designation: designation || designationGu,
        designationGu,
        departmentId,
        bio,
        bioGu,
        experienceYears: experienceYears ? parseInt(experienceYears, 10) : 5,
        district: district || 'વડોદરા',
        languages: languages || ['ગુજરાતી', 'હિન્દી', 'અંગ્રેજી'],
        email,
        phone,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
        youtubeUrl,
        displayOrder: displayOrder !== undefined ? parseInt(displayOrder, 10) : 0,
        isFeatured: Boolean(isFeatured),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: { department: true },
    });

    res.status(201).json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function updateTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await prisma.teamMember.update({
      where: { id },
      data: req.body,
      include: { department: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteTeamMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.teamMember.delete({ where: { id } });
    res.json({ success: true, message: 'Team member deleted' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. PUBLIC TEAM ENDPOINTS
// ==========================================

export async function getPublicTeam(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const departments = await prisma.teamDepartment.findMany({
      where: { isActive: true },
      include: {
        members: {
          where: { isActive: true },
          orderBy: [{ isFeatured: 'desc' }, { displayOrder: 'asc' }],
        },
      },
      orderBy: { order: 'asc' },
    });

    const featuredMembers = await prisma.teamMember.findMany({
      where: { isActive: true, isFeatured: true },
      include: { department: { select: { nameGu: true } } },
      orderBy: { displayOrder: 'asc' },
      take: 6,
    });

    res.json({
      success: true,
      data: {
        departments,
        featuredMembers,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getPublicTeamMemberBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug } = req.params;
    const member = await prisma.teamMember.findUnique({
      where: { slug },
      include: { department: true },
    });

    if (!member || !member.isActive) {
      res.status(404).json({ success: false, message: 'Team member not found' });
      return;
    }

    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}
