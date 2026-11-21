import { Router } from 'express';
import { Role } from '@prisma/client';
import { authenticate, requireRole } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

// Controllers
import { getDashboardData } from '../controllers/adminDashboardController.js';
import {
  getAdminNews,
  getAdminNewsById,
  createManualNews,
  updateAdminNews,
  publishNews,
  rejectNews,
  deleteNews,
  bulkDeleteNews,
} from '../controllers/adminNewsController.js';
import {
  getRssSources,
  createRssSource,
  updateRssSource,
  deleteRssSource,
  testRssFeed,
  triggerManualFetch,
  getRssLogs,
} from '../controllers/adminRssController.js';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminCategoryController.js';
import { uploadMedia, getMediaList, deleteMedia } from '../controllers/adminMediaController.js';
import {
  getAdminBreakingNews,
  addBreakingNews,
  deleteBreakingNews,
  getAdminTrendingNews,
  addTrendingNews,
  deleteTrendingNews,
} from '../controllers/adminTrendingBreakingController.js';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/adminUsersController.js';
import { getAllSettings, updateSettings, getAuditLogs } from '../controllers/adminSettingsController.js';

// Phase 3: Comprehensive Advertisement CMS
import {
  getAdvertisers,
  createAdvertiser,
  updateAdvertiser,
  deleteAdvertiser,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getPlacements,
  createPlacement,
  getPopups,
  createPopup,
  updatePopup,
  deletePopup,
  getInvoices,
  createInvoice,
  getAdReports,
} from '../controllers/advertisementCMSController.js';

// Phase 4: Social Media Integration
import {
  getSocialAccounts,
  getOAuthAuthorizationUrl,
  handleYouTubeCallback,
  handleMetaCallback,
  connectYouTubeDirect,
  connectMetaDirect,
  syncSocialPlatform,
  disconnectAccount,
  getSocialSyncLogs,
  toggleSocialPost,
} from '../controllers/socialMediaController.js';

// Phase 5: Video News, Reels & YouTube Live
import {
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getVideoCategories,
  getYouTubeLiveSettings,
  updateYouTubeLiveSettings,
} from '../controllers/videoCMSController.js';

// Phase 6: Our Team CMS
import {
  getTeamDepartments,
  createTeamDepartment,
  getAdminTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
} from '../controllers/teamCMSController.js';

const router = Router();

// Protect all admin routes with authentication
router.use(authenticate);

// 1. Dashboard
router.get('/dashboard', getDashboardData);

// 2. News Management
router.get('/news', getAdminNews);
router.post('/news', createManualNews);
router.get('/news/:id', getAdminNewsById);
router.put('/news/:id', updateAdminNews);
router.delete('/news/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteNews);
router.post('/news/bulk-delete', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), bulkDeleteNews);
router.post('/news/:id/publish', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), publishNews);
router.post('/news/:id/reject', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), rejectNews);

// 3. RSS Management
router.get('/rss-sources', getRssSources);
router.post('/rss-sources', requireRole(Role.SUPER_ADMIN, Role.ADMIN), createRssSource);
router.put('/rss-sources/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), updateRssSource);
router.delete('/rss-sources/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteRssSource);
router.post('/rss-sources/test', testRssFeed);
router.post('/rss-sources/:id/fetch', triggerManualFetch);
router.get('/rss-logs', getRssLogs);

// 4. Categories Management
router.get('/categories', getCategories);
router.post('/categories', requireRole(Role.SUPER_ADMIN, Role.ADMIN), createCategory);
router.put('/categories/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), updateCategory);
router.delete('/categories/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteCategory);

// 5. Media Library
router.get('/media', getMediaList);
router.post('/media/upload', uploadMiddleware.single('image'), uploadMedia);
router.delete('/media/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteMedia);

// 6. Breaking News
router.get('/breaking', getAdminBreakingNews);
router.post('/breaking', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), addBreakingNews);
router.delete('/breaking/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), deleteBreakingNews);

// 7. Trending News
router.get('/trending', getAdminTrendingNews);
router.post('/trending', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), addTrendingNews);
router.delete('/trending/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), deleteTrendingNews);

// 8. Users & Permissions (Super Admin only)
router.get('/users', requireRole(Role.SUPER_ADMIN), getUsers);
router.post('/users', requireRole(Role.SUPER_ADMIN), createUser);
router.put('/users/:id', requireRole(Role.SUPER_ADMIN), updateUser);
router.delete('/users/:id', requireRole(Role.SUPER_ADMIN), deleteUser);

// 9. Website Settings & Audit Logs
router.get('/settings', getAllSettings);
router.post('/settings', requireRole(Role.SUPER_ADMIN, Role.ADMIN), updateSettings);
router.get('/audit-logs', requireRole(Role.SUPER_ADMIN, Role.ADMIN), getAuditLogs);

// 10. Advertisement CMS (Phase 3)
router.get('/advertisers', getAdvertisers);
router.post('/advertisers', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), createAdvertiser);
router.put('/advertisers/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), updateAdvertiser);
router.delete('/advertisers/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteAdvertiser);

router.get('/ads/campaigns', getCampaigns);
router.post('/ads/campaigns', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), createCampaign);
router.put('/ads/campaigns/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), updateCampaign);
router.delete('/ads/campaigns/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteCampaign);

router.get('/ads/placements', getPlacements);
router.post('/ads/placements', requireRole(Role.SUPER_ADMIN, Role.ADMIN), createPlacement);

router.get('/ads/popups', getPopups);
router.post('/ads/popups', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), createPopup);
router.put('/ads/popups/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), updatePopup);
router.delete('/ads/popups/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deletePopup);

router.get('/ads/invoices', getInvoices);
router.post('/ads/invoices', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.AD_MANAGER), createInvoice);
router.get('/ads/reports', getAdReports);

// 11. Social Media Management (Phase 4)
router.get('/social/accounts', getSocialAccounts);
router.get('/social/oauth-url', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), getOAuthAuthorizationUrl);
router.post('/social/oauth/youtube/callback', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), handleYouTubeCallback);
router.post('/social/oauth/meta/callback', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), handleMetaCallback);
router.post('/social/connect-youtube', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), connectYouTubeDirect);
router.post('/social/connect-meta', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), connectMetaDirect);
router.delete('/social/accounts/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), disconnectAccount);
router.post('/social/sync', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), syncSocialPlatform);
router.get('/social/logs', getSocialSyncLogs);
router.put('/social/posts/:id/toggle', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), toggleSocialPost);

// 12. Video News & Reels CMS (Phase 5)
router.get('/videos', getAdminVideos);
router.post('/videos', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.REPORTER), createVideo);
router.put('/videos/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), updateVideo);
router.delete('/videos/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteVideo);
router.get('/videos/categories', getVideoCategories);

router.get('/youtube/live', getYouTubeLiveSettings);
router.put('/youtube/live', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.SOCIAL_MEDIA_MANAGER), updateYouTubeLiveSettings);

// 13. Our Team CMS (Phase 6)
router.get('/team/departments', getTeamDepartments);
router.post('/team/departments', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.TEAM_MANAGER), createTeamDepartment);
router.get('/team/members', getAdminTeamMembers);
router.post('/team/members', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.TEAM_MANAGER), createTeamMember);
router.put('/team/members/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.TEAM_MANAGER), updateTeamMember);
router.delete('/team/members/:id', requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteTeamMember);

export default router;
