import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';

export async function submitContactEnquiry(req: Request, res: Response) {
  try {
    const { name, email, phone, enquiryType, subject, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'તમારું નામ આપવું જરૂરી છે.' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'માન્ય ઈમેલ સરનામું આપવું જરૂરી છે.' });
    }
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'વિષય (Subject) આપવો જરૂરી છે.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'સંદેશો (Message) લખવો જરૂરી છે.' });
    }

    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || null;

    const enquiry = await prisma.contactEnquiry.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : null,
        enquiryType: enquiryType || 'GENERAL',
        subject: subject.trim(),
        message: message.trim(),
        status: 'PENDING',
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'આપનો સંદેશો સફળતાપૂર્વક મોકલવામાં આવ્યો છે. અમારી ટીમ ટૂંક સમયમાં આપનો સંપર્ક કરશે.',
      data: { id: enquiry.id },
    });
  } catch (error: any) {
    console.error('submitContactEnquiry error:', error);
    return res.status(500).json({
      success: false,
      message: 'સંદેશો મોકલવામાં ક્ષતિ આવી. કૃપા કરીને થોડીવાર પછી ફરી પ્રયાસ કરો.',
    });
  }
}

export async function getAdminEnquiries(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const enquiryType = req.query.enquiryType as string;
    const search = req.query.search as string;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (enquiryType && enquiryType !== 'ALL') {
      where.enquiryType = enquiryType;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, enquiries] = await Promise.all([
      prisma.contactEnquiry.count({ where }),
      prisma.contactEnquiry.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({
      success: true,
      data: enquiries,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('getAdminEnquiries error:', error);
    return res.status(500).json({ success: false, message: 'પૂછપરછો મેળવવામાં ક્ષતિ આવી.' });
  }
}

export async function getEnquiryById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const enquiry = await prisma.contactEnquiry.findUnique({ where: { id } });

    if (!enquiry) {
      return res.status(404).json({ success: false, message: 'પૂછપરછ મળી નથી.' });
    }

    // Auto mark as READ if still PENDING
    if (enquiry.status === 'PENDING') {
      await prisma.contactEnquiry.update({
        where: { id },
        data: { status: 'READ' },
      });
      enquiry.status = 'READ';
    }

    return res.json({ success: true, data: enquiry });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'વિગતો મેળવવામાં ક્ષતિ આવી.' });
  }
}

export async function updateEnquiryStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;

    const updated = await prisma.contactEnquiry.update({
      where: { id },
      data: {
        status: status !== undefined ? status : undefined,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
      },
    });

    return res.json({
      success: true,
      data: updated,
      message: 'પૂછપરછનું સ્ટેટસ સફળતાપૂર્વક અપડેટ થયું.',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'અપડેટ કરવામાં ક્ષતિ આવી.' });
  }
}

export async function deleteEnquiry(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.contactEnquiry.delete({ where: { id } });
    return res.json({ success: true, message: 'પૂછપરછ સફળતાપૂર્વક ડિલીટ કરવામાં આવી.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'ડિલીટ કરવામાં ક્ષતિ આવી.' });
  }
}
