"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdvertisers = getAdvertisers;
exports.createAdvertiser = createAdvertiser;
exports.updateAdvertiser = updateAdvertiser;
exports.deleteAdvertiser = deleteAdvertiser;
exports.getCampaigns = getCampaigns;
exports.createCampaign = createCampaign;
exports.updateCampaign = updateCampaign;
exports.deleteCampaign = deleteCampaign;
exports.getPlacements = getPlacements;
exports.createPlacement = createPlacement;
exports.getPopups = getPopups;
exports.createPopup = createPopup;
exports.updatePopup = updatePopup;
exports.deletePopup = deletePopup;
exports.getInvoices = getInvoices;
exports.createInvoice = createInvoice;
exports.getAdReports = getAdReports;
exports.getSlotAd = getSlotAd;
exports.getActivePopup = getActivePopup;
exports.trackAdImpression = trackAdImpression;
exports.trackAdClick = trackAdClick;
const prisma_js_1 = require("../config/prisma.js");
const client_1 = require("@prisma/client");
// ==========================================
// 1. ADVERTISERS MANAGEMENT
// ==========================================
async function getAdvertisers(req, res, next) {
    try {
        const advertisers = await prisma_js_1.prisma.advertiser.findMany({
            include: {
                _count: {
                    select: { campaigns: true, invoices: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: advertisers });
    }
    catch (err) {
        next(err);
    }
}
async function createAdvertiser(req, res, next) {
    try {
        const { companyName, contactPerson, phone, email, gstNumber, address, notes } = req.body;
        if (!companyName || !phone || !email) {
            res.status(400).json({ success: false, message: 'Company name, phone, and email are required' });
            return;
        }
        const advertiser = await prisma_js_1.prisma.advertiser.create({
            data: { companyName, contactPerson: contactPerson || companyName, phone, email, gstNumber, address, notes },
        });
        res.status(201).json({ success: true, data: advertiser });
    }
    catch (err) {
        next(err);
    }
}
async function updateAdvertiser(req, res, next) {
    try {
        const { id } = req.params;
        const { companyName, contactPerson, phone, email, gstNumber, address, notes, isActive } = req.body;
        const updated = await prisma_js_1.prisma.advertiser.update({
            where: { id },
            data: { companyName, contactPerson, phone, email, gstNumber, address, notes, isActive },
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
async function deleteAdvertiser(req, res, next) {
    try {
        const { id } = req.params;
        await prisma_js_1.prisma.advertiser.delete({ where: { id } });
        res.json({ success: true, message: 'Advertiser deleted successfully' });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 2. CAMPAIGNS & CREATIVES
// ==========================================
async function getCampaigns(req, res, next) {
    try {
        const campaigns = await prisma_js_1.prisma.adCampaign.findMany({
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
    }
    catch (err) {
        next(err);
    }
}
async function createCampaign(req, res, next) {
    try {
        const { advertiserId, name, budget, agreedPrice, startDate, endDate, status, targetDevices, creatives, placementIds, } = req.body;
        if (!advertiserId || !name || !startDate || !endDate) {
            res.status(400).json({ success: false, message: 'Missing required campaign fields' });
            return;
        }
        const campaign = await prisma_js_1.prisma.adCampaign.create({
            data: {
                advertiserId,
                name,
                budget: budget ? parseFloat(budget) : 0,
                agreedPrice: agreedPrice ? parseFloat(agreedPrice) : 0,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                status: status || client_1.AdCampaignStatus.ACTIVE,
                targetDevices: targetDevices || ['DESKTOP', 'MOBILE'],
                creatives: creatives && creatives.length > 0 ? {
                    create: creatives.map((c) => ({
                        name: c.name || name,
                        adType: c.adType || client_1.AdType.BANNER,
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
                await prisma_js_1.prisma.adCampaignPlacement.create({
                    data: {
                        campaignId: campaign.id,
                        placementId: plId,
                        priority: 1,
                    },
                });
            }
        }
        const fullCampaign = await prisma_js_1.prisma.adCampaign.findUnique({
            where: { id: campaign.id },
            include: { creatives: true, placements: { include: { placement: true } } },
        });
        res.status(201).json({ success: true, data: fullCampaign });
    }
    catch (err) {
        next(err);
    }
}
async function updateCampaign(req, res, next) {
    try {
        const { id } = req.params;
        const { name, budget, agreedPrice, startDate, endDate, status, targetDevices, placementIds } = req.body;
        await prisma_js_1.prisma.adCampaign.update({
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
            await prisma_js_1.prisma.adCampaignPlacement.deleteMany({ where: { campaignId: id } });
            for (const plId of placementIds) {
                await prisma_js_1.prisma.adCampaignPlacement.create({
                    data: { campaignId: id, placementId: plId, priority: 1 },
                });
            }
        }
        const updated = await prisma_js_1.prisma.adCampaign.findUnique({
            where: { id },
            include: { creatives: true, placements: { include: { placement: true } } },
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
async function deleteCampaign(req, res, next) {
    try {
        const { id } = req.params;
        await prisma_js_1.prisma.adCampaign.delete({ where: { id } });
        res.json({ success: true, message: 'Campaign deleted' });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 3. PLACEMENTS MANAGEMENT
// ==========================================
async function getPlacements(req, res, next) {
    try {
        const placements = await prisma_js_1.prisma.adPlacement.findMany({
            include: {
                campaigns: {
                    where: { isActive: true },
                    include: { campaign: { select: { id: true, name: true, status: true } } },
                },
            },
            orderBy: [{ pageGroup: 'asc' }, { rotationPriority: 'asc' }],
        });
        res.json({ success: true, data: placements });
    }
    catch (err) {
        next(err);
    }
}
async function createPlacement(req, res, next) {
    try {
        const { identifier, name, pageGroup, desktopDimensions, mobileDimensions, maxFileSizeKb, acceptedFormats, rotationPriority } = req.body;
        const pl = await prisma_js_1.prisma.adPlacement.create({
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
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 4. POPUP MANAGEMENT
// ==========================================
async function getPopups(req, res, next) {
    try {
        const popups = await prisma_js_1.prisma.adPopup.findMany({
            include: { campaign: { select: { id: true, name: true, advertiser: { select: { companyName: true } } } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: popups });
    }
    catch (err) {
        next(err);
    }
}
async function createPopup(req, res, next) {
    try {
        const { campaignId, heading, headingGu, description, descriptionGu, mediaUrl, ctaButton, destinationUrl, delaySeconds, frequencyCap, maxImpressions, targetDevices } = req.body;
        const popup = await prisma_js_1.prisma.adPopup.create({
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
    }
    catch (err) {
        next(err);
    }
}
async function updatePopup(req, res, next) {
    try {
        const { id } = req.params;
        const updated = await prisma_js_1.prisma.adPopup.update({
            where: { id },
            data: req.body,
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
}
async function deletePopup(req, res, next) {
    try {
        const { id } = req.params;
        await prisma_js_1.prisma.adPopup.delete({ where: { id } });
        res.json({ success: true, message: 'Popup deleted' });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 5. INVOICES & PAYMENTS
// ==========================================
async function getInvoices(req, res, next) {
    try {
        const invoices = await prisma_js_1.prisma.adInvoice.findMany({
            include: {
                advertiser: { select: { companyName: true, contactPerson: true, email: true, phone: true } },
                campaign: { select: { name: true } },
                payments: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: invoices });
    }
    catch (err) {
        next(err);
    }
}
async function createInvoice(req, res, next) {
    try {
        const { advertiserId, campaignId, amount, gstRate, dueDate } = req.body;
        const parsedAmount = parseFloat(amount);
        const rate = gstRate !== undefined ? parseFloat(gstRate) : 18.0;
        const gstAmount = (parsedAmount * rate) / 100;
        const totalAmount = parsedAmount + gstAmount;
        const count = await prisma_js_1.prisma.adInvoice.count();
        const invoiceNumber = `INV-BN-2026-${String(count + 1).padStart(3, '0')}`;
        const invoice = await prisma_js_1.prisma.adInvoice.create({
            data: {
                invoiceNumber,
                advertiserId,
                campaignId: campaignId || null,
                amount: parsedAmount,
                gstRate: rate,
                gstAmount,
                totalAmount,
                status: client_1.InvoiceStatus.PENDING,
                dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 15 * 86400000),
            },
            include: { advertiser: true },
        });
        res.status(201).json({ success: true, data: invoice });
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 6. REPORTS & ANALYTICS
// ==========================================
async function getAdReports(req, res, next) {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [totalCampaigns, activeCampaigns, totalAdvertisers, totalImpressions, totalClicks, events] = await Promise.all([
            prisma_js_1.prisma.adCampaign.count(),
            prisma_js_1.prisma.adCampaign.count({ where: { status: client_1.AdCampaignStatus.ACTIVE } }),
            prisma_js_1.prisma.advertiser.count(),
            prisma_js_1.prisma.adEvent.count({ where: { eventType: client_1.AdEventType.IMPRESSION } }),
            prisma_js_1.prisma.adEvent.count({ where: { eventType: client_1.AdEventType.CLICK } }),
            prisma_js_1.prisma.adEvent.findMany({
                where: { createdAt: { gte: thirtyDaysAgo } },
                select: { eventType: true, deviceType: true, createdAt: true, campaignId: true },
            }),
        ]);
        const ctr = totalImpressions > 0 ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0;
        // Daily breakdown for Recharts
        const dailyMap = new Map();
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
                if (ev.eventType === client_1.AdEventType.IMPRESSION)
                    entry.impressions++;
                if (ev.eventType === client_1.AdEventType.CLICK)
                    entry.clicks++;
            }
            if (ev.deviceType === 'MOBILE')
                mobileCount++;
            else
                desktopCount++;
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
    }
    catch (err) {
        next(err);
    }
}
// ==========================================
// 7. PUBLIC AD RENDERING & TRACKING
// ==========================================
async function getSlotAd(req, res, next) {
    try {
        const { placement } = req.params;
        const now = new Date();
        const placementRecord = await prisma_js_1.prisma.adPlacement.findUnique({
            where: { identifier: placement },
            include: {
                campaigns: {
                    where: {
                        isActive: true,
                        campaign: {
                            status: client_1.AdCampaignStatus.ACTIVE,
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
    }
    catch (err) {
        next(err);
    }
}
async function getActivePopup(req, res, next) {
    try {
        const now = new Date();
        const popup = await prisma_js_1.prisma.adPopup.findFirst({
            where: {
                isActive: true,
                campaign: {
                    status: client_1.AdCampaignStatus.ACTIVE,
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
    }
    catch (err) {
        next(err);
    }
}
async function trackAdImpression(req, res, next) {
    try {
        const { campaignId, placementId, deviceType } = req.body;
        if (!campaignId) {
            res.status(400).json({ success: false });
            return;
        }
        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        await prisma_js_1.prisma.adEvent.create({
            data: {
                campaignId,
                placementId: placementId || null,
                eventType: client_1.AdEventType.IMPRESSION,
                ipAddress,
                userAgent,
                deviceType: deviceType || 'DESKTOP',
            },
        });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
async function trackAdClick(req, res, next) {
    try {
        const { campaignId, placementId, deviceType } = req.body;
        if (!campaignId) {
            res.status(400).json({ success: false });
            return;
        }
        const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
        const userAgent = req.headers['user-agent'] || '';
        await prisma_js_1.prisma.adEvent.create({
            data: {
                campaignId,
                placementId: placementId || null,
                eventType: client_1.AdEventType.CLICK,
                ipAddress,
                userAgent,
                deviceType: deviceType || 'DESKTOP',
            },
        });
        res.json({ success: true });
    }
    catch (err) {
        next(err);
    }
}
