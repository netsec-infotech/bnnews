export type Role =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'EDITOR'
  | 'REPORTER'
  | 'AD_MANAGER'
  | 'SOCIAL_MEDIA_MANAGER'
  | 'TEAM_MANAGER';

export type NewsStatus = 'PENDING' | 'DRAFT' | 'PUBLISHED' | 'REJECTED';
export type SourceStatus = 'ACTIVE' | 'INACTIVE' | 'ERROR';
export type AdCampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'EXPIRED';
export type AdType =
  | 'BANNER'
  | 'SIDEBAR'
  | 'POPUP'
  | 'STICKY'
  | 'IN_ARTICLE'
  | 'VIDEO_AD'
  | 'SPONSORED_NEWS'
  | 'HOMEPAGE_FEATURED'
  | 'MOBILE';
export type VideoSource = 'YOUTUBE' | 'INSTAGRAM' | 'FACEBOOK' | 'DIRECT_UPLOAD';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameGu: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order: number;
  isActive: boolean;
  seoTitle?: string;
  seoDesc?: string;
  _count?: {
    news: number;
  };
}

export interface RssSource {
  id: string;
  name: string;
  feedUrl: string;
  websiteUrl?: string;
  defaultCategoryId?: string;
  defaultCategory?: Category;
  collectionInterval: number;
  status: SourceStatus;
  language: string;
  attributionName?: string;
  lastFetchTime?: string;
  lastSuccessTime?: string;
  totalArticlesCount: number;
  lastError?: string;
  createdAt: string;
  _count?: {
    news: number;
    sourceItems: number;
  };
}

export interface NewsSourceItem {
  id: string;
  sourceId: string;
  sourceGuid: string;
  sourceUrl: string;
  title: string;
  description?: string;
  content?: string;
  author?: string;
  rawImageUrl?: string;
  publishedDate?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleGu: string;
  slug: string;
  description?: string;
  descriptionGu?: string;
  content?: string;
  featuredImage?: string;
  additionalImages?: string[];
  categoryId?: string;
  category?: Category;
  sourceId?: string;
  source?: RssSource;
  sourceItem?: NewsSourceItem;
  sourceUrl?: string;
  sourceGuid?: string;
  authorId?: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: NewsStatus;
  isBreaking: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags?: string[];
  viewsCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreakingNewsItem {
  id: string;
  newsId: string;
  tickerText?: string;
  order: number;
  isActive: boolean;
  news: {
    id: string;
    titleGu: string;
    slug: string;
    category?: {
      slug: string;
      nameGu: string;
    };
  };
}

export interface TrendingNewsItem {
  id: string;
  newsId: string;
  priority: number;
  isActive: boolean;
  news: {
    id: string;
    titleGu: string;
    slug: string;
    featuredImage?: string;
    publishedAt?: string;
    category?: {
      slug: string;
      nameGu: string;
    };
  };
}

export interface RssLogItem {
  id: string;
  sourceId: string;
  status: 'INFO' | 'WARN' | 'ERROR';
  message: string;
  itemsFetched: number;
  itemsSaved: number;
  createdAt: string;
  source?: {
    name: string;
  };
}

export interface DashboardData {
  kpi: {
    totalNews: number;
    publishedNews: number;
    pendingNews: number;
    draftNews: number;
    breakingNews?: number;
    trendingNews?: number;
    todayNews: number;
    activeSources: number;
  };
  latestImported: NewsArticle[];
  recentlyPublished: NewsArticle[];
  recentLogs: RssLogItem[];
  failedSources: RssSource[];
  publicationChart?: { date: string; count: number }[];
  categoryStats?: { name: string; slug: string; count: number; percentage: number }[];
  trendPoints?: { label: string; value: number }[];
  sevenDaysActivity?: {
    newsAdded: number;
    rssImported: number;
    publishedNews: number;
    rejectedNews: number;
    activeEditors: number;
  };
}

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  createdAt: string;
}

// ==========================================
// ADVERTISEMENT TYPES (Phase 3)
// ==========================================

export interface Advertiser {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNumber?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    campaigns: number;
    invoices: number;
  };
}

export interface AdCreative {
  id: string;
  campaignId: string;
  name: string;
  adType: AdType;
  desktopCreative?: string;
  mobileCreative?: string;
  videoCreative?: string;
  landingPageUrl: string;
  altText?: string;
  duration?: string;
  isActive: boolean;
}

export interface AdPlacement {
  id: string;
  identifier: string;
  name: string;
  pageGroup: string;
  desktopDimensions?: string;
  mobileDimensions?: string;
  maxFileSizeKb: number;
  acceptedFormats: string[];
  isActive: boolean;
  rotationPriority: number;
}

export interface AdPopup {
  id: string;
  campaignId: string;
  heading: string;
  headingGu?: string;
  description?: string;
  descriptionGu?: string;
  mediaUrl: string;
  ctaButton: string;
  destinationUrl: string;
  delaySeconds: number;
  frequencyCap: string;
  maxImpressions?: number;
  currentImpressions: number;
  isActive: boolean;
  targetDevices: string[];
}

export interface AdCampaign {
  id: string;
  advertiserId: string;
  advertiser?: Advertiser;
  name: string;
  budget?: number;
  agreedPrice?: number;
  startDate: string;
  endDate: string;
  status: AdCampaignStatus;
  targetDevices: string[];
  creatives?: AdCreative[];
  placements?: { placement: AdPlacement }[];
  popups?: AdPopup[];
  createdAt: string;
}

export interface AdInvoice {
  id: string;
  invoiceNumber: string;
  advertiserId: string;
  advertiser?: Advertiser;
  campaignId?: string;
  campaign?: { name: string };
  amount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  dueDate: string;
  paidAt?: string;
  createdAt: string;
}

export interface SlotAdData {
  campaignId: string;
  placementId?: string;
  advertiserName: string;
  name: string;
  adType: AdType;
  desktopCreative?: string;
  mobileCreative?: string;
  videoCreative?: string;
  landingPageUrl: string;
  altText?: string;
  desktopDimensions?: string;
  mobileDimensions?: string;
}

// ==========================================
// SOCIAL MEDIA TYPES (Phase 4)
// ==========================================

export interface SocialAccount {
  id: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE';
  accountId?: string;
  accountName?: string;
  pageId?: string;
  pageName?: string;
  profilePicture?: string;
  isConnected: boolean;
  status: 'ACTIVE' | 'EXPIRED' | 'DISCONNECTED' | 'ERROR';
  lastError?: string;
  tokenExpiresAt?: string;
  lastSyncedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SocialPostItem {
  id: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE';
  postId?: string;
  postUrl: string;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  mediaType?: 'POST' | 'VIDEO' | 'REEL' | 'SHORTS';
  authorName?: string;
  isActive: boolean;
  publishedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface SocialSyncLogItem {
  id: string;
  platform: string;
  status: 'SUCCESS' | 'FAILED';
  message: string;
  itemsFetched: number;
  createdAt: string;
}

// ==========================================
// VIDEO & REELS TYPES (Phase 5)
// ==========================================

export interface VideoCategory {
  id: string;
  name: string;
  nameGu: string;
  slug: string;
  order: number;
  isActive: boolean;
  _count?: { videos: number };
}

export interface VideoItem {
  id: string;
  title: string;
  titleGu: string;
  slug: string;
  description?: string;
  videoSource: VideoSource;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: string;
  categoryId?: string;
  category?: VideoCategory;
  isFeatured: boolean;
  isTrending: boolean;
  isReel: boolean;
  showOnHome: boolean;
  showOnVideos: boolean;
  showOnReels: boolean;
  viewsCount: number;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface YouTubeLiveSetting {
  id: string;
  channelId?: string;
  liveVideoId?: string;
  isLive: boolean;
  streamTitle?: string;
  streamThumbnail?: string;
  fallbackEmbedUrl?: string;
}

// ==========================================
// OUR TEAM TYPES (Phase 6)
// ==========================================

export interface TeamDepartment {
  id: string;
  name: string;
  nameGu: string;
  slug: string;
  order: number;
  isActive: boolean;
  members?: TeamMember[];
  _count?: { members: number };
}

export interface TeamMember {
  id: string;
  name: string;
  nameGu: string;
  slug: string;
  photoUrl?: string;
  designation: string;
  designationGu: string;
  departmentId: string;
  department?: TeamDepartment;
  bio?: string;
  bioGu?: string;
  experienceYears: number;
  district?: string;
  languages: string[];
  email?: string;
  phone?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  youtubeUrl?: string;
  displayOrder: number;
  isFeatured: boolean;
  isActive: boolean;
}
