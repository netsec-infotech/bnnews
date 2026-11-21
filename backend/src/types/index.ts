import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface NewsQueryFilters {
  status?: string;
  categoryId?: string;
  sourceId?: string;
  search?: string;
  isBreaking?: boolean;
  isTrending?: boolean;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'created_at' | 'published_at' | 'views_count';
  sortOrder?: 'asc' | 'desc';
}

export interface RssFeedItem {
  title: string;
  link: string;
  pubDate?: string;
  guid?: string;
  content?: string;
  contentSnippet?: string;
  description?: string;
  enclosure?: {
    url?: string;
    type?: string;
    length?: number;
  };
  'media:content'?: {
    $?: {
      url?: string;
    };
  };
  'media:thumbnail'?: {
    $?: {
      url?: string;
    };
  };
  creator?: string;
  author?: string;
}
