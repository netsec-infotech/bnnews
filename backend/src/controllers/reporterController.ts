import { Request, Response } from 'express';
import slugify from 'slugify';
import { prisma } from '../config/prisma.js';

/**
 * Generate a unique slug for a reporter
 */
async function generateUniqueSlug(name: string, currentId?: string): Promise<string> {
  let baseSlug = slugify(name, { lower: true, strict: true, trim: true });
  if (!baseSlug) {
    baseSlug = `reporter-${Date.now().toString(36)}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.reporter.findUnique({
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

export async function getAdminReporters(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;

    const where: any = {};

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
      prisma.reporter.count({ where }),
      prisma.reporter.findMany({
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
  } catch (error: any) {
    console.error('getAdminReporters error:', error);
    return res.status(500).json({ success: false, message: 'રિપોર્ટર્સની વિગતો મેળવવામાં નિષ્ફળતા.' });
  }
}

export async function getReporterById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reporter = await prisma.reporter.findUnique({
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
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'રિપોર્ટર મેળવવામાં ક્ષતિ આવી.' });
  }
}

export async function createReporter(req: Request, res: Response) {
  try {
    const {
      name,
      designation,
      profileImage,
      biography,
      location,
      email,
      phone,
      experience,
      languages,
      specialization,
      socialLinks,
      status,
      isFeatured,
      joiningDate,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'રિપોર્ટરનું પૂરું નામ આપવું ફરજિયાત છે.' });
    }

    const slug = await generateUniqueSlug(name.trim());

    const reporter = await prisma.reporter.create({
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
  } catch (error: any) {
    console.error('createReporter error:', error);
    return res.status(500).json({ success: false, message: error.message || 'રિપોર્ટર ઉમેરવામાં નિષ્ફળતા.' });
  }
}

export async function updateReporter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      name,
      designation,
      profileImage,
      biography,
      location,
      email,
      phone,
      experience,
      languages,
      specialization,
      socialLinks,
      status,
      isFeatured,
      joiningDate,
    } = req.body;

    const existing = await prisma.reporter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'રિપોર્ટર મળ્યા નથી.' });
    }

    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      slug = await generateUniqueSlug(name.trim(), id);
    }

    const updated = await prisma.reporter.update({
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
  } catch (error: any) {
    console.error('updateReporter error:', error);
    return res.status(500).json({ success: false, message: error.message || 'અપડેટ કરવામાં ક્ષતિ આવી.' });
  }
}

export async function toggleReporterStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const existing = await prisma.reporter.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'રિપોર્ટર મળ્યા નથી.' });
    }

    const newStatus = existing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const updated = await prisma.reporter.update({
      where: { id },
      data: { status: newStatus },
    });

    return res.json({
      success: true,
      data: updated,
      message: `રિપોર્ટર ${newStatus === 'ACTIVE' ? 'સક્રિય' : 'નિષ્ક્રિય'} કરવામાં આવ્યા.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'સ્ટેટસ બદલવામાં ક્ષતિ આવી.' });
  }
}

export async function deleteReporter(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const reporter = await prisma.reporter.findUnique({
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
    await prisma.news.updateMany({
      where: { reporterId: id },
      data: { reporterId: null },
    });

    await prisma.reporter.delete({ where: { id } });

    return res.json({
      success: true,
      message: `રિપોર્ટર '${reporter.name}' સફળતાપૂર્વક ડિલીટ કરવામાં આવ્યા.`,
    });
  } catch (error: any) {
    console.error('deleteReporter error:', error);
    return res.status(500).json({ success: false, message: 'ડિલીટ કરવામાં ક્ષતિ આવી.' });
  }
}

// ==========================================
// PUBLIC REPORTER CONTROLLERS
// ==========================================

export async function getPublicReporters(req: Request, res: Response) {
  try {
    const reporters = await prisma.reporter.findMany({
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
  } catch (error: any) {
    console.error('getPublicReporters error:', error);
    return res.status(500).json({ success: false, message: 'રિપોર્ટર્સ મેળવવામાં નિષ્ફળતા.' });
  }
}

export async function getPublicReporterBySlug(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const reporter = await prisma.reporter.findFirst({
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
    const latestNews = await prisma.news.findMany({
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
  } catch (error: any) {
    console.error('getPublicReporterBySlug error:', error);
    return res.status(500).json({ success: false, message: 'વિગતો મેળવવામાં નિષ્ફળતા.' });
  }
}
