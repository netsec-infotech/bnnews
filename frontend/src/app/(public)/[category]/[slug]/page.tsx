'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Clock, Eye, Share2, Facebook, Twitter, MessageCircle, ExternalLink, ChevronRight, Home, User as UserIcon } from 'lucide-react';
import { NewsArticle } from '../../../../lib/types';
import api from '../../../../lib/api';
import NewsCard from '../../../../components/public/NewsCard';
import AdSlot from '../../../../components/common/AdSlot';

export default function NewsDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const categorySlug = params?.category as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    api
      .get(`/news/${slug}`)
      .then((res) => {
        if (res.data?.success) {
          setArticle(res.data.data);
          setRelatedNews(res.data.related || []);
        }
      })
      .catch((err) => console.error('Error fetching article:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    if (typeof window === 'undefined') return;
    const currentUrl = window.location.href;
    const shareText = article?.titleGu || 'BN NEWS ગુજરાતી સમાચાર';

    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + currentUrl)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
    } else if (platform === 'copy') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 animate-pulse space-y-4">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-10 w-full bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
        <div className="aspect-video w-full bg-gray-200 rounded-xl"></div>
        <div className="space-y-2 pt-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 font-gujarati">
        <h2 className="text-xl font-bold text-gray-800">સમાચાર મળ્યા નથી અથવા દૂર કરવામાં આવ્યા છે.</h2>
        <Link href="/" className="inline-block mt-4 text-primary font-semibold hover:underline">
          મુખ્ય પૃષ્ઠ પર પાછા જાઓ
        </Link>
      </div>
    );
  }

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('gu-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <article className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-muted font-gujarati overflow-x-auto pb-1">
        <Link href="/" className="hover:text-primary flex items-center gap-1 shrink-0">
          <Home className="w-3.5 h-3.5" />
          <span>હોમ</span>
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
        <Link href={`/${categorySlug}`} className="hover:text-primary font-semibold text-primary shrink-0">
          {article.category?.nameGu || 'સમાચાર'}
        </Link>
        <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
        <span className="truncate text-gray-400 max-w-xs">{article.titleGu}</span>
      </nav>

      {/* Ad Slot Above Article */}
      <AdSlot placement="news_above_article" />

      {/* Headline & Metadata */}
      <div className="space-y-3">
        <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded font-gujarati inline-block">
          {article.category?.nameGu}
        </span>

        <h1 className="font-gujarati text-2xl md:text-4xl font-extrabold text-neutral-text leading-tight">
          {article.titleGu}
        </h1>

        {article.descriptionGu && (
          <p className="font-gujarati text-base md:text-lg text-gray-600 font-medium leading-relaxed border-l-4 border-secondary pl-3">
            {article.descriptionGu}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-4 py-3 border-y border-gray-200 text-xs text-neutral-muted">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-gujarati">
              <UserIcon className="w-3.5 h-3.5 text-primary" />
              <span>{article.author?.name || 'BN News બ્યુરો'}</span>
            </span>

            <span className="flex items-center gap-1.5 font-gujarati">
              <Clock className="w-3.5 h-3.5 text-secondary" />
              <span>{formattedDate}</span>
            </span>

            {article.viewsCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                <span>{article.viewsCount} વાંચન</span>
              </span>
            )}
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 font-gujarati flex items-center gap-1">
              <Share2 className="w-3.5 h-3.5 text-primary" /> શેર કરો:
            </span>
            <button
              onClick={() => handleShare('whatsapp')}
              className="p-1.5 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-xs"
              title="વોટ્સએપ પર શેર કરો"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="p-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
              title="ફેસબુક પર શેર કરો"
            >
              <Facebook className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleShare('twitter')}
              className="p-1.5 rounded-full bg-sky-500 text-white hover:bg-sky-600 transition-colors shadow-xs"
              title="ટ્વિટર પર શેર કરો"
            >
              <Twitter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleShare('copy')}
              className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-[11px] font-gujarati transition-colors text-gray-700"
            >
              {copied ? 'લિંક કોપી થઈ!' : 'કોપી લિંક'}
            </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {article.featuredImage && (
        <div className="rounded-xl overflow-hidden shadow-sm border border-neutral-border bg-gray-100">
          <img
            src={article.featuredImage}
            alt={article.titleGu}
            className="w-full max-h-[500px] object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Ad Slot Below Featured Image */}
      <AdSlot placement="news_below_featured_image" />

      {/* Editorial Content */}
      <div
        className="font-gujarati text-base md:text-lg leading-relaxed text-neutral-text space-y-4 pt-2 [&>p]:mb-4 [&>p]:leading-loose [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-6 [&>h3]:text-xl [&>h3]:font-bold"
        dangerouslySetInnerHTML={{ __html: article.content || '' }}
      />

      {/* Ad Slot After Article Content */}
      <AdSlot placement="news_after_article" />

      {/* Related News Section */}
      {relatedNews.length > 0 && (
        <div className="pt-10 border-t border-gray-200 space-y-4">
          <h3 className="font-gujarati font-bold text-xl text-primary flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-secondary rounded-full"></span>
            <span>આ પણ વાંચો (Related News)</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {relatedNews.map((rel) => (
              <NewsCard key={rel.id} article={rel} variant="standard" />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
