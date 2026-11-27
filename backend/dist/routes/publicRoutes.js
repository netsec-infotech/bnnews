"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const publicNewsController_js_1 = require("../controllers/publicNewsController.js");
// Phase 3: Public Advertisement Serving & Events
const advertisementCMSController_js_1 = require("../controllers/advertisementCMSController.js");
// Phase 4: Public Social Feed
const socialMediaController_js_1 = require("../controllers/socialMediaController.js");
// Phase 5: Public Videos, Reels & YouTube Live
const videoCMSController_js_1 = require("../controllers/videoCMSController.js");
// Phase 6: Our Team Showcase
const teamCMSController_js_1 = require("../controllers/teamCMSController.js");
// Module 1: Public Reporters & Admin Fallbacks
const reporterController_js_1 = require("../controllers/reporterController.js");
const auth_js_1 = require("../middleware/auth.js");
const client_1 = require("@prisma/client");
// Module 7: Dynamic Navigation Hierarchy
const adminCategoryController_js_1 = require("../controllers/adminCategoryController.js");
// Module 10: Contact Submission
const contactController_js_1 = require("../controllers/contactController.js");
const router = (0, express_1.Router)();
// News Endpoints
router.get('/news', publicNewsController_js_1.getPublicNews);
router.get('/news/latest', publicNewsController_js_1.getPublicNews);
router.get('/news/videos', videoCMSController_js_1.getPublicVideos);
router.get('/news/reels', videoCMSController_js_1.getPublicReels);
router.get('/news/:slug', publicNewsController_js_1.getNewsBySlug);
router.get('/categories', publicNewsController_js_1.getPublicCategories);
router.get('/categories/:slug/news', publicNewsController_js_1.getPublicNews);
router.get('/breaking-news', publicNewsController_js_1.getBreakingNews);
router.get('/trending', publicNewsController_js_1.getTrendingNews);
router.get('/settings', publicNewsController_js_1.getPublicSettings);
// Module 7: Dynamic Navigation Tree
router.get('/navigation', adminCategoryController_js_1.getPublicNavigation);
// Module 1: Public Reporters
router.get('/reporters', reporterController_js_1.getPublicReporters);
router.get('/reporters/:slug', reporterController_js_1.getPublicReporterBySlug);
// Safe Fallbacks for Reporter Admin Operations when accessed without /admin prefix
router.post('/reporters', auth_js_1.authenticate, (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.createReporter);
router.put('/reporters/:id', auth_js_1.authenticate, (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.updateReporter);
router.patch('/reporters/:id/status', auth_js_1.authenticate, (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.toggleReporterStatus);
router.patch('/reporters/:id/toggle-status', auth_js_1.authenticate, (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.toggleReporterStatus);
router.delete('/reporters/:id', auth_js_1.authenticate, (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), reporterController_js_1.deleteReporter);
// Module 10: Contact Form Submission
router.post('/contact/submit', contactController_js_1.submitContactEnquiry);
router.post('/contact/enquiry', contactController_js_1.submitContactEnquiry);
router.post('/public/contact/enquiry', contactController_js_1.submitContactEnquiry);
// Advertisement Serving & Analytics
router.get('/ads/slot/:placement', advertisementCMSController_js_1.getSlotAd);
router.get('/ads/popup', advertisementCMSController_js_1.getActivePopup);
router.post('/ad-events/impression', advertisementCMSController_js_1.trackAdImpression);
router.post('/ad-events/click', advertisementCMSController_js_1.trackAdClick);
// Social Feeds (Instagram & Facebook)
router.get('/social-feed', socialMediaController_js_1.getPublicSocialFeed);
// Videos, Reels & YouTube Live
router.get('/videos', videoCMSController_js_1.getPublicVideos);
router.get('/reels', videoCMSController_js_1.getPublicReels);
router.get('/live-tv', socialMediaController_js_1.getPublicLiveTvDetails);
router.get('/youtube/live', videoCMSController_js_1.getYouTubeLiveSettings);
router.post('/videos/:id/view', videoCMSController_js_1.recordVideoView);
// Our Team Showcase
router.get('/team', teamCMSController_js_1.getPublicTeam);
router.get('/team/:slug', teamCMSController_js_1.getPublicTeamMemberBySlug);
exports.default = router;
