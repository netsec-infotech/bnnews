'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, Eye } from 'lucide-react';
import { NewsArticle } from '../../lib/types';

interface NewsCardProps {
  article: NewsArticle;
  variant?: 'standard' | 'horizontal' | 'compact' | 'hero';
}

export const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'standard' }) => {
  const categorySlug = article.category?.slug || 'gujarat';
  const categoryName = article.category?.nameGu || 'સમાચાર';
  const detailUrl = `/${categorySlug}/${article.slug}`;

  // Time format
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('gu-IN', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  const fallbackImage = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=60';
  const displayImage = article.featuredImage || fallbackImage;

  if (variant === 'compact') {
    return (
      <Link href={detailUrl} className="group flex items-start gap-3 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 p-1.5 rounded-lg transition-colors">
        <div className="w-20 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
          <img
            src={displayImage}
            alt={article.titleGu}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-gujarati text-xs md:text-sm font-bold text-neutral-text line-clamp-2 group-hover:text-primary transition-colors leading-snug">
            {article.titleGu}
          </h4>
          <span className="text-[11px] text-neutral-muted mt-1 block font-medium">
            {formattedDate}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        href={detailUrl}
        className="group bg-white rounded-xl p-3.5 border border-neutral-border hover:shadow-cardHover transition-all flex flex-col sm:flex-row gap-4"
      >
        <div className="sm:w-48 h-32 rounded-lg overflow-hidden bg-gray-100 shrink-0 relative border border-gray-200">
          <img
            src={displayImage}
            alt={article.titleGu}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = fallbackImage;
            }}
          />
          <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-extrabold px-2 py-0.5 rounded font-gujarati shadow-xs">
            {categoryName}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="font-gujarati text-base font-bold text-neutral-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {article.titleGu}
            </h3>
            {article.descriptionGu && (
              <p className="font-gujarati text-xs text-neutral-muted line-clamp-2 mt-1.5 leading-relaxed">
                {article.descriptionGu}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-neutral-muted mt-2">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3 h-3 text-secondary" />
              {formattedDate}
            </span>
            {article.viewsCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-primary" />
                {article.viewsCount}
              </span>
            )}
            {article.source?.attributionName && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-semibold">
                {article.source.attributionName}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // Standard vertical card
  return (
    <Link
      href={detailUrl}
      className="group bg-white rounded-xl overflow-hidden border border-neutral-border hover:shadow-cardHover transition-all flex flex-col"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={article.titleGu}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = fallbackImage;
          }}
        />
        <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded font-gujarati shadow-sm border-l-2 border-accent-gold">
          {categoryName}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-gujarati text-sm md:text-base font-bold text-neutral-text group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {article.titleGu}
          </h3>
          {article.descriptionGu && (
            <p className="font-gujarati text-xs text-neutral-muted line-clamp-2 mt-1.5 leading-relaxed font-normal">
              {article.descriptionGu}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-neutral-muted mt-3 pt-2.5 border-t border-gray-100">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3 h-3 text-secondary" />
            {formattedDate}
          </span>
          {article.source?.attributionName ? (
            <span className="text-gray-500 truncate max-w-[120px] font-semibold">
              {article.source.attributionName}
            </span>
          ) : (
            <span className="text-breaking font-bold tracking-tight">BN News</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
