import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AdCampaignStatus, AdType, AdEventType, InvoiceStatus, Role } from '@prisma/client';
import { AuthenticatedRequest } from '../types/index.js';

// ==========================================
// 1. ADVERTISERS MANAGEMENT
// ==========================================

export async function getAdvertisers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const advertisers = await prisma.advertiser.findMany({
      include: {
        _count: {
          select: { campaigns: true, invoices: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: advertisers });
  } catch (err) {
    next(err);
  }
}

export async function createAdvertiser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { companyName, contactPerson, phone, email, gstNumber, address, notes } = req.body;
    if (!companyName || !phone || !email) {
      res.status(400).json({ success: false, message: 'Company name, phone, and email are required' });
      return;
    }

    const advertiser = await prisma.advertiser.create({
      data: { companyName, contactPerson: contactPerson || companyName, phone, email, gstNumber, address, notes },
    });
    res.status(201).json({ success: true, data: advertiser });
  } catch (err) {
    next(err);
  }
}

export async function updateAdvertiser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { companyName, contactPerson, phone, email, gstNumber, address, notes, isActive } = req.body;
    const updated = await prisma.advertiser.update({
      where: { id },
      data: { companyName, contactPerson, phone, email, gstNumber, address, notes, isActive },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteAdvertiser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.advertiser.delete({ where: { id } });
    res.json({ success: true, message: 'Advertiser deleted successfully' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 2. CAMPAIGNS & CREATIVES
// ==========================================

export async function getCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const campaigns = await prisma.adCampaign.findMany({
      include: {
        advertiser: { select: { companyName: true, contactPerson: true, phone: true } },
        creatives: true,
        placements: { include: { placement: true } },
        popups: true,
        _count: { select: { events: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: campaigns });
  } catch (err) {
    next(err);
  }
}

export async function createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      advertiserId,
      name,
      budget,
      agreedPrice,
      startDate,
      endDate,
      status,
      targetDevices,
      creatives,
      placementIds,
    } = req.body;

    if (!advertiserId || !name || !startDate || !endDate) {
      res.status(400).json({ success: false, message: 'Missing required campaign fields' });
      return;
    }

    const campaign = await prisma.adCampaign.create({
      data: {
        advertiserId,
        name,
        budget: budget ? parseFloat(budget) : 0,
        agreedPrice: agreedPrice ? parseFloat(agreedPrice) : 0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || AdCampaignStatus.ACTIVE,
        targetDevices: targetDevices || ['DESKTOP', 'MOBILE'],
        creatives: creatives && creatives.length > 0 ? {
          create: creatives.map((c: any) => ({
            name: c.name || name,
            adType: c.adType || AdType.BANNER,
            desktopCreative: c.desktopCreative,
            mobileCreative: c.mobileCreative,
            videoCreative: c.videoCreative,
            landingPageUrl: c.landingPageUrl || '#',
            altText: c.altText,
            duration: c.duration || '0:15',
          })),
        } : undefined,
      },
    });

    // Link Placements
    if (placementIds && Array.isArray(placementIds) && placementIds.length > 0) {
      for (const plId of placementIds) {
        await prisma.adCampaignPlacement.create({
          data: {
            campaignId: campaign.id,
            placementId: plId,
            priority: 1,
          },
        });
      }
    }

    const fullCampaign = await prisma.adCampaign.findUnique({
      where: { id: campaign.id },
      include: { creatives: true, placements: { include: { placement: true } } },
    });

    res.status(201).json({ success: true, data: fullCampaign });
  } catch (err) {
    next(err);
  }
}

export async function updateCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { name, budget, agreedPrice, startDate, endDate, status, targetDevices, placementIds } = req.body;

    await prisma.adCampaign.update({
      where: { id },
      data: {
        name,
        budget: budget !== undefined ? parseFloat(budget) : undefined,
        agreedPrice: agreedPrice !== undefined ? parseFloat(agreedPrice) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        status,
        targetDevices,
      },
    });

    if (placementIds && Array.isArray(placementIds)) {
      await prisma.adCampaignPlacement.deleteMany({ where: { campaignId: id } });
      for (const plId of placementIds) {
        await prisma.adCampaignPlacement.create({
          data: { campaignId: id, placementId: plId, priority: 1 },
        });
      }
    }

    const updated = await prisma.adCampaign.findUnique({
      where: { id },
      include: { creatives: true, placements: { include: { placement: true } } },
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deleteCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.adCampaign.delete({ where: { id } });
    res.json({ success: true, message: 'Campaign deleted' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 3. PLACEMENTS MANAGEMENT
// ==========================================

export async function getPlacements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const placements = await prisma.adPlacement.findMany({
      include: {
        campaigns: {
          where: { isActive: true },
          include: { campaign: { select: { id: true, name: true, status: true } } },
        },
      },
      orderBy: [{ pageGroup: 'asc' }, { rotationPriority: 'asc' }],
    });
    res.json({ success: true, data: placements });
  } catch (err) {
    next(err);
  }
}

export async function createPlacement(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { identifier, name, pageGroup, desktopDimensions, mobileDimensions, maxFileSizeKb, acceptedFormats, rotationPriority } = req.body;
    const pl = await prisma.adPlacement.create({
      data: {
        identifier,
        name,
        pageGroup: pageGroup || 'HOMEPAGE',
        desktopDimensions,
        mobileDimensions,
        maxFileSizeKb: maxFileSizeKb || 500,
        acceptedFormats: acceptedFormats || ['IMAGE', 'GIF', 'VIDEO'],
        rotationPriority: rotationPriority || 1,
      },
    });
    res.status(201).json({ success: true, data: pl });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 4. POPUP MANAGEMENT
// ==========================================

export async function getPopups(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const popups = await prisma.adPopup.findMany({
      include: { campaign: { select: { id: true, name: true, advertiser: { select: { companyName: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: popups });
  } catch (err) {
    next(err);
  }
}

export async function createPopup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId, heading, headingGu, description, descriptionGu, mediaUrl, ctaButton, destinationUrl, delaySeconds, frequencyCap, maxImpressions, targetDevices } = req.body;
    const popup = await prisma.adPopup.create({
      data: {
        campaignId,
        heading,
        headingGu,
        description,
        descriptionGu,
        mediaUrl,
        ctaButton: ctaButton || 'વધુ વિગતો જુઓ',
        destinationUrl,
        delaySeconds: delaySeconds || 3,
        frequencyCap: frequencyCap || 'ONCE_PER_SESSION',
        maxImpressions: maxImpressions || null,
        targetDevices: targetDevices || ['DESKTOP', 'MOBILE'],
      },
    });
    res.status(201).json({ success: true, data: popup });
  } catch (err) {
    next(err);
  }
}

export async function updatePopup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const updated = await prisma.adPopup.update({
      where: { id },
      data: req.body,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

export async function deletePopup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    await prisma.adPopup.delete({ where: { id } });
    res.json({ success: true, message: 'Popup deleted' });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 5. INVOICES & PAYMENTS
// ==========================================

export async function getInvoices(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const invoices = await prisma.adInvoice.findMany({
      include: {
        advertiser: { select: { companyName: true, contactPerson: true, email: true, phone: true } },
        campaign: { select: { name: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: invoices });
  } catch (err) {
    next(err);
  }
}

export async function createInvoice(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { advertiserId, campaignId, amount, gstRate, dueDate } = req.body;
    const parsedAmount = parseFloat(amount);
    const rate = gstRate !== undefined ? parseFloat(gstRate) : 18.0;
    const gstAmount = (parsedAmount * rate) / 100;
    const totalAmount = parsedAmount + gstAmount;

    const count = await prisma.adInvoice.count();
    const invoiceNumber = `INV-BN-2026-${String(count + 1).padStart(3, '0')}`;

    const invoice = await prisma.adInvoice.create({
      data: {
        invoiceNumber,
        advertiserId,
        campaignId: campaignId || null,
        amount: parsedAmount,
        gstRate: rate,
        gstAmount,
        totalAmount,
        status: InvoiceStatus.PENDING,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 86400000),
      },
      include: { advertiser: true },
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 6. REPORTS & ANALYTICS
// ==========================================

export async function getAdReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalCampaigns, activeCampaigns, totalAdvertisers, totalImpressions, totalClicks, events] = await Promise.all([
      prisma.adCampaign.count(),
      prisma.adCampaign.count({ where: { status: AdCampaignStatus.ACTIVE } }),
      prisma.advertiser.count(),
      prisma.adEvent.count({ where: { eventType: AdEventType.IMPRESSION } }),
      prisma.adEvent.count({ where: { eventType: AdEventType.CLICK } }),
      prisma.adEvent.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { eventType: true, deviceType: true, createdAt: true, campaignId: true },
      }),
    ]);

    const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;

    // Daily breakdown for Recharts
    const dailyMap = new Map<string, { date: string; impressions: number; clicks: number }>();
    for (let i = 14; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10); // MM-DD
      dailyMap.set(key, { date: key, impressions: 0, clicks: 0 });
    }

    let desktopCount = 0;
    let mobileCount = 0;

    for (const ev of events) {
      const key = ev.createdAt.toISOString().slice(5, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        if (ev.eventType === AdEventType.IMPRESSION) entry.impressions++;
        if (ev.eventType === AdEventType.CLICK) entry.clicks++;
      }
      if (ev.deviceType === 'MOBILE') mobileCount++;
      else desktopCount++;
    }

    res.json({
      success: true,
      data: {
        kpi: {
          totalCampaigns,
          activeCampaigns,
          totalAdvertisers,
          totalImpressions,
          totalClicks,
          ctr,
        },
        chartData: Array.from(dailyMap.values()),
        deviceBreakdown: {
          desktop: desktopCount || 65,
          mobile: mobileCount || 35,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ==========================================
// 7. PUBLIC AD RENDERING & TRACKING
// ==========================================

export async function getSlotAd(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { placement } = req.params;
    const now = new Date();

    const placementRecord = await prisma.adPlacement.findUnique({
      where: { identifier: placement },
      include: {
        campaigns: {
          where: {
            isActive: true,
            campaign: {
              status: AdCampaignStatus.ACTIVE,
              startDate: { lte: now },
              endDate: { gte: now },
            },
          },
          include: {
            campaign: {
              include: {
                creatives: { where: { isActive: true } },
                advertiser: { select: { companyName: true } },
              },
            },
          },
          orderBy: { priority: 'asc' },
        },
      },
    });

    if (!placementRecord || placementRecord.campaigns.length === 0) {
      res.json({ success: true, data: null });
      return;
    }

    // Pick top campaign or rotate
    const campaignPlacement = placementRecord.campaigns[0];
    const creative = campaignPlacement.campaign.creatives[0];

    if (!creative) {
      res.json({ success: true, data: null });
      return;
    }

    res.json({
      success: true,
      data: {
        campaignId: campaignPlacement.campaign.id,
        placementId: placementRecord.id,
        advertiserName: campaignPlacement.campaign.advertiser.companyName,
        name: creative.name,
        adType: creative.adType,
        desktopCreative: creative.desktopCreative,
        mobileCreative: creative.mobileCreative || creative.desktopCreative,
        videoCreative: creative.videoCreative,
        landingPageUrl: creative.landingPageUrl,
        altText: creative.altText,
        desktopDimensions: placementRecord.desktopDimensions,
        mobileDimensions: placementRecord.mobileDimensions,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getActivePopup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const popup = await prisma.adPopup.findFirst({
      where: {
        isActive: true,
        campaign: {
          status: AdCampaignStatus.ACTIVE,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
      include: {
        campaign: { select: { id: true, name: true, advertiser: { select: { companyName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: popup });
  } catch (err) {
    next(err);
  }
}

export async function trackAdImpression(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId, placementId, deviceType } = req.body;
    if (!campaignId) {
      res.status(400).json({ success: false });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    await prisma.adEvent.create({
      data: {
        campaignId,
        placementId: placementId || null,
        eventType: AdEventType.IMPRESSION,
        ipAddress,
        userAgent,
        deviceType: deviceType || 'DESKTOP',
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function trackAdClick(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { campaignId, placementId, deviceType } = req.body;
    if (!campaignId) {
      res.status(400).json({ success: false });
      return;
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    await prisma.adEvent.create({
      data: {
        campaignId,
        placementId: placementId || null,
        eventType: AdEventType.CLICK,
        ipAddress,
        userAgent,
        deviceType: deviceType || 'DESKTOP',
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}
