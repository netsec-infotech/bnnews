import { Router } from 'express';
import {
  getPublicNews,
  getNewsBySlug,
  getPublicCategories,
  getBreakingNews,
  getTrendingNews,
  getPublicSettings,
} from '../controllers/publicNewsController.js';

// Phase 3: Public Advertisement Serving & Events
import {
  getSlotAd,
  getActivePopup,
  trackAdImpression,
  trackAdClick,
} from '../controllers/advertisementCMSController.js';

// Phase 4: Public Social Feed
import { getPublicSocialFeed, getPublicLiveTvDetails } from '../controllers/socialMediaController.js';

// Phase 5: Public Videos, Reels & YouTube Live
import {
  getPublicVideos,
  getPublicReels,
  getYouTubeLiveSettings,
  recordVideoView,
} from '../controllers/videoCMSController.js';

// Phase 6: Our Team Showcase
import {
  getPublicTeam,
  getPublicTeamMemberBySlug,
} from '../controllers/teamCMSController.js';

// Module 1: Public Reporters & Admin Fallbacks
import {
  getPublicReporters,
  getPublicReporterBySlug,
  getReporterById,
  createReporter,
  updateReporter,
  toggleReporterStatus,
  deleteReporter,
} from '../controllers/reporterController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { Role } from '@prisma/client';

// Module 7: Dynamic Navigation Hierarchy
import { getPublicNavigation } from '../controllers/adminCategoryController.js';

// Module 10: Contact Submission
import { submitContactEnquiry } from '../controllers/contactController.js';

const router = Router();

// News Endpoints
router.get('/news', getPublicNews);
router.get('/news/latest', getPublicNews);
router.get('/news/videos', getPublicVideos);
router.get('/news/reels', getPublicReels);
router.get('/news/:slug', getNewsBySlug);
router.get('/categories', getPublicCategories);
router.get('/categories/:slug/news', getPublicNews);
router.get('/breaking-news', getBreakingNews);
router.get('/trending', getTrendingNews);
router.get('/settings', getPublicSettings);

// Module 7: Dynamic Navigation Tree
router.get('/navigation', getPublicNavigation);

// Module 1: Public Reporters
router.get('/reporters', getPublicReporters);
router.get('/reporters/:slug', getPublicReporterBySlug);
// Safe Fallbacks for Reporter Admin Operations when accessed without /admin prefix
router.post('/reporters', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), createReporter);
router.put('/reporters/:id', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), updateReporter);
router.patch('/reporters/:id/status', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), toggleReporterStatus);
router.patch('/reporters/:id/toggle-status', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR), toggleReporterStatus);
router.delete('/reporters/:id', authenticate, requireRole(Role.SUPER_ADMIN, Role.ADMIN), deleteReporter);

// Module 10: Contact Form Submission
router.post('/contact/submit', submitContactEnquiry);
router.post('/contact/enquiry', submitContactEnquiry);
router.post('/public/contact/enquiry', submitContactEnquiry);

// Advertisement Serving & Analytics
router.get('/ads/slot/:placement', getSlotAd);
router.get('/ads/popup', getActivePopup);
router.post('/ad-events/impression', trackAdImpression);
router.post('/ad-events/click', trackAdClick);

// Social Feeds (Instagram & Facebook)
router.get('/social-feed', getPublicSocialFeed);

// Videos, Reels & YouTube Live
router.get('/videos', getPublicVideos);
router.get('/reels', getPublicReels);
router.get('/live-tv', getPublicLiveTvDetails);
router.get('/youtube/live', getYouTubeLiveSettings);
router.post('/videos/:id/view', recordVideoView);

// Our Team Showcase
router.get('/team', getPublicTeam);
router.get('/team/:slug', getPublicTeamMemberBySlug);

export default router;
