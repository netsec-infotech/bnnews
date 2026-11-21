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

// Phase 6: Public Team Showcase
import {
  getPublicTeam,
  getPublicTeamMemberBySlug,
} from '../controllers/teamCMSController.js';

const router = Router();

// News Endpoints
router.get('/news', getPublicNews);
router.get('/news/:slug', getNewsBySlug);
router.get('/categories', getPublicCategories);
router.get('/categories/:slug/news', getPublicNews);
router.get('/breaking-news', getBreakingNews);
router.get('/trending', getTrendingNews);
router.get('/settings', getPublicSettings);

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
