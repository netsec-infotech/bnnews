"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_js_1 = require("../middleware/auth.js");
const upload_js_1 = require("../middleware/upload.js");
// Controllers
const adminDashboardController_js_1 = require("../controllers/adminDashboardController.js");
const adminNewsController_js_1 = require("../controllers/adminNewsController.js");
const adminRssController_js_1 = require("../controllers/adminRssController.js");
const adminCategoryController_js_1 = require("../controllers/adminCategoryController.js");
const adminMediaController_js_1 = require("../controllers/adminMediaController.js");
const adminTrendingBreakingController_js_1 = require("../controllers/adminTrendingBreakingController.js");
const adminUsersController_js_1 = require("../controllers/adminUsersController.js");
const adminSettingsController_js_1 = require("../controllers/adminSettingsController.js");
// Phase 3: Comprehensive Advertisement CMS
const advertisementCMSController_js_1 = require("../controllers/advertisementCMSController.js");
// Phase 4: Social Media Integration
const socialMediaController_js_1 = require("../controllers/socialMediaController.js");
// Phase 5: Video News, Reels & YouTube Live
const videoCMSController_js_1 = require("../controllers/videoCMSController.js");
// Phase 6: Our Team CMS
const teamCMSController_js_1 = require("../controllers/teamCMSController.js");
// Module 1: Reporter Management
const reporterController_js_1 = require("../controllers/reporterController.js");
// Module 6: Gemini AI News Writer
const aiNewsController_js_1 = require("../controllers/aiNewsController.js");
// Module 10: Contact Enquiries Management
const contactController_js_1 = require("../controllers/contactController.js");
const adminMediaController_js_2 = require("../controllers/adminMediaController.js");
const router = (0, express_1.Router)();
// Protect all admin routes with authentication
router.use(auth_js_1.authenticate);
// 1. Dashboard
router.get('/dashboard', adminDashboardController_js_1.getDashboardData);
// 2. News Management
router.get('/news', adminNewsController_js_1.getAdminNews);
router.post('/news', adminNewsController_js_1.createManualNews);
router.get('/news/:id', adminNewsController_js_1.getAdminNewsById);
router.put('/news/:id', adminNewsController_js_1.updateAdminNews);
router.delete('/news/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminNewsController_js_1.deleteNews);
router.post('/news/bulk-delete', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.bulkDeleteNews);
router.post('/news/:id/publish', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.publishNews);
router.put('/news/:id/publish', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.publishNews);
router.patch('/news/:id/publish', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.publishNews);
router.post('/news/:id/reject', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.rejectNews);
router.put('/news/:id/reject', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.rejectNews);
router.patch('/news/:id/reject', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminNewsController_js_1.rejectNews);
// 3. RSS Management
router.get('/rss-sources', adminRssController_js_1.getRssSources);
router.post('/rss-sources', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminRssController_js_1.createRssSource);
router.put('/rss-sources/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminRssController_js_1.updateRssSource);
router.delete('/rss-sources/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminRssController_js_1.deleteRssSource);
router.post('/rss-sources/test', adminRssController_js_1.testRssFeed);
router.post('/rss-sources/:id/fetch', adminRssController_js_1.triggerManualFetch);
router.get('/rss-logs', adminRssController_js_1.getRssLogs);
// 4. Categories Management
router.get('/categories', adminCategoryController_js_1.getCategories);
router.post('/categories', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminCategoryController_js_1.createCategory);
router.put('/categories/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminCategoryController_js_1.updateCategory);
router.delete('/categories/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminCategoryController_js_1.deleteCategory);
// 5. Media Library
router.get('/media', adminMediaController_js_1.getMediaList);
router.post('/media/upload', upload_js_1.uploadMiddleware.single('image'), adminMediaController_js_1.uploadMedia);
router.post('/media/upload-image', upload_js_1.uploadMiddleware.single('image'), adminMediaController_js_2.uploadImage);
router.post('/media/upload-video', upload_js_1.uploadMiddleware.single('video'), adminMediaController_js_2.uploadVideo);
router.delete('/media/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminMediaController_js_1.deleteMedia);
// 6. Breaking News
router.get('/breaking', adminTrendingBreakingController_js_1.getAdminBreakingNews);
router.post('/breaking', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminTrendingBreakingController_js_1.addBreakingNews);
router.delete('/breaking/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminTrendingBreakingController_js_1.deleteBreakingNews);
// 7. Trending News
router.get('/trending', adminTrendingBreakingController_js_1.getAdminTrendingNews);
router.post('/trending', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminTrendingBreakingController_js_1.addTrendingNews);
router.delete('/trending/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), adminTrendingBreakingController_js_1.deleteTrendingNews);
// 8. Users & Permissions (Super Admin only)
router.get('/users', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN), adminUsersController_js_1.getUsers);
router.post('/users', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN), adminUsersController_js_1.createUser);
router.put('/users/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN), adminUsersController_js_1.updateUser);
router.patch('/users/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN), adminUsersController_js_1.updateUser);
router.delete('/users/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN), adminUsersController_js_1.deleteUser);
// 9. Website Settings & Audit Logs
router.get('/settings', adminSettingsController_js_1.getAllSettings);
router.post('/settings', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminSettingsController_js_1.updateSettings);
router.get('/audit-logs', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), adminSettingsController_js_1.getAuditLogs);
// 10. Advertisement CMS (Phase 3)
router.get('/advertisers', advertisementCMSController_js_1.getAdvertisers);
router.post('/advertisers', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.createAdvertiser);
router.put('/advertisers/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.updateAdvertiser);
router.delete('/advertisers/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), advertisementCMSController_js_1.deleteAdvertiser);
router.get('/ads/campaigns', advertisementCMSController_js_1.getCampaigns);
router.post('/ads/campaigns', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.createCampaign);
router.put('/ads/campaigns/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.updateCampaign);
router.delete('/ads/campaigns/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), advertisementCMSController_js_1.deleteCampaign);
router.get('/ads/placements', advertisementCMSController_js_1.getPlacements);
router.post('/ads/placements', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), advertisementCMSController_js_1.createPlacement);
router.get('/ads/popups', advertisementCMSController_js_1.getPopups);
router.post('/ads/popups', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.createPopup);
router.put('/ads/popups/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.updatePopup);
router.delete('/ads/popups/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), advertisementCMSController_js_1.deletePopup);
router.get('/ads/invoices', advertisementCMSController_js_1.getInvoices);
router.post('/ads/invoices', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.AD_MANAGER), advertisementCMSController_js_1.createInvoice);
router.get('/ads/reports', advertisementCMSController_js_1.getAdReports);
// 11. Social Media Management (Phase 4)
router.get('/social/accounts', socialMediaController_js_1.getSocialAccounts);
router.get('/social/oauth-url', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.getOAuthAuthorizationUrl);
router.post('/social/oauth/youtube/callback', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.handleYouTubeCallback);
router.post('/social/oauth/meta/callback', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.handleMetaCallback);
router.post('/social/connect-youtube', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.connectYouTubeDirect);
router.post('/social/connect-meta', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.connectMetaDirect);
router.delete('/social/accounts/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), socialMediaController_js_1.disconnectAccount);
router.post('/social/sync', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.syncSocialPlatform);
router.get('/social/logs', socialMediaController_js_1.getSocialSyncLogs);
router.put('/social/posts/:id/toggle', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), socialMediaController_js_1.toggleSocialPost);
// 12. Video News & Reels CMS (Phase 5)
router.get('/videos', videoCMSController_js_1.getAdminVideos);
router.post('/videos', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), videoCMSController_js_1.createVideo);
router.put('/videos/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), videoCMSController_js_1.updateVideo);
router.patch('/videos/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), videoCMSController_js_1.updateVideo);
router.delete('/videos/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), videoCMSController_js_1.deleteVideo);
router.get('/videos/categories', videoCMSController_js_1.getVideoCategories);
router.get('/youtube/live', videoCMSController_js_1.getYouTubeLiveSettings);
router.put('/youtube/live', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.SOCIAL_MEDIA_MANAGER), videoCMSController_js_1.updateYouTubeLiveSettings);
// 13. Our Team CMS (Phase 6)
router.get('/team/departments', teamCMSController_js_1.getTeamDepartments);
router.post('/team/departments', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.TEAM_MANAGER), teamCMSController_js_1.createTeamDepartment);
router.get('/team/members', teamCMSController_js_1.getAdminTeamMembers);
router.post('/team/members', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.TEAM_MANAGER), teamCMSController_js_1.createTeamMember);
router.put('/team/members/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.TEAM_MANAGER), teamCMSController_js_1.updateTeamMember);
router.delete('/team/members/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), teamCMSController_js_1.deleteTeamMember);
// 14. Reporters Management (Module 1)
router.get('/reporters', reporterController_js_1.getAdminReporters);
router.get('/reporters/:id', reporterController_js_1.getReporterById);
router.post('/reporters', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.createReporter);
router.put('/reporters/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.updateReporter);
router.patch('/reporters/:id/status', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.toggleReporterStatus);
router.patch('/reporters/:id/toggle-status', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR), reporterController_js_1.toggleReporterStatus);
router.delete('/reporters/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), reporterController_js_1.deleteReporter);
// 15. Gemini AI Multilingual News Writing (Module 6)
router.post('/ai/news/generate', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleGenerateNews);
router.post('/ai/generate', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleGenerateNews);
router.post('/ai/news/recreate', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleRecreateNews);
router.post('/ai/recreate', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleRecreateNews);
router.post('/ai/news/rewrite', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleRewriteNews);
router.post('/ai/rewrite', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleRewriteNews);
router.post('/ai/news/translate', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleTranslateNews);
router.post('/ai/translate', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleTranslateNews);
router.post('/ai/news/headline', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleGenerateHeadlines);
router.post('/ai/headlines', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleGenerateHeadlines);
router.post('/ai/news/summarize', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleSummarizeNews);
router.post('/ai/summary', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN, client_1.Role.EDITOR, client_1.Role.REPORTER), aiNewsController_js_1.handleSummarizeNews);
// 16. Contact Enquiries Management (Module 10)
router.get('/contact-enquiries', contactController_js_1.getAdminEnquiries);
router.get('/contact-enquiries/:id', contactController_js_1.getEnquiryById);
router.put('/contact-enquiries/:id', contactController_js_1.updateEnquiryStatus);
router.delete('/contact-enquiries/:id', (0, auth_js_1.requireRole)(client_1.Role.SUPER_ADMIN, client_1.Role.ADMIN), contactController_js_1.deleteEnquiry);
exports.default = router;
