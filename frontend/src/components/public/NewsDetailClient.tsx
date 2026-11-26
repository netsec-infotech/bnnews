'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  Eye,
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  ChevronRight,
  Home,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react';
import { NewsArticle } from '../../lib/types';
import api from '../../lib/api';
import { getMediaUrl, normalizeArticleHtml } from '../../lib/media';
import NewsCard from './NewsCard';
import AdSlot from '../common/AdSlot';

interface NewsDetailClientProps {
  slug: string;
  categorySlug: string;
  initialArticle?: NewsArticle | null;
  initialRelated?: NewsArticle[];
}

export default function NewsDetailClient({
  slug,
  categorySlug,
  initialArticle = null,
  initialRelated = [],
}: NewsDetailClientProps) {
  const [article, setArticle] = useState<NewsArticle | null>(initialArticle);
  const [relatedNews, setRelatedNews] = useState<NewsArticle[]>(initialRelated);
  const [loading, setLoading] = useState(!initialArticle);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    if (!initialArticle) setLoading(true);

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
    const titleText = article?.titleGu || 'BN NEWS ગુજરાતી સમાચાર';
    const descText = article?.descriptionGu || '';

    if (platform === 'whatsapp') {
      const waText = `*${titleText}*\n\n${descText ? descText + '\n\n' : ''}${currentUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`, '_blank');
    } else if (platform === 'facebook') {
      const quoteText = descText ? `${titleText}\n\n${descText}` : titleText;
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(quoteText)}`,
        '_blank'
      );
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(titleText)}&url=${encodeURIComponent(currentUrl)}`,
        '_blank'
      );
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

  const reporter = article.reporter;

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
              {reporter ? (
                <Link href={`/reporter/${reporter.slug}`} className="font-bold text-primary hover:underline">
                  {reporter.name} ({reporter.designation})
                </Link>
              ) : (
                <span>{article.author?.name || 'BN News બ્યુરો'}</span>
              )}
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
            src={getMediaUrl(article.featuredImage)}
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

      {/* Editorial Content with Full Inline Images & Videos Support */}
      <div
        className="font-gujarati text-base md:text-lg leading-relaxed text-neutral-text space-y-4 pt-2 [&>p]:mb-4 [&>p]:leading-loose [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-6 [&>h3]:text-xl [&>h3]:font-bold [&>figure]:my-6 [&_img]:rounded-2xl [&_img]:w-full [&_img]:shadow-xs [&_figcaption]:text-xs [&_figcaption]:text-gray-500 [&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:font-medium [&_figcaption]:italic [&_iframe]:w-full [&_iframe]:rounded-2xl [&_iframe]:aspect-video [&_video]:w-full [&_video]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-[#ED1C2E] [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-gray-200 [&_th]:bg-gray-50 [&_th]:p-2.5 [&_td]:border [&_td]:border-gray-200 [&_td]:p-2.5"
        dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(article.content) || '' }}
      />

      {/* Reporter Bio Box (if article has an assigned reporter) */}
      {reporter && (
        <div className="my-8 p-5 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center sm:items-start gap-4 font-gujarati shadow-2xs">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary/20 shrink-0 bg-white">
            {reporter.profileImage ? (
              <img
                src={getMediaUrl(reporter.profileImage)}
                alt={reporter.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-primary font-bold text-xl">
                {reporter?.name ? reporter.name.charAt(0) : 'R'}
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs bg-primary text-white font-bold px-2 py-0.5 rounded">
                વિશેષ પત્રકાર અહેવાલ
              </span>
              <h4 className="font-bold text-base text-gray-900">{reporter.name}</h4>
            </div>

            <p className="text-xs font-semibold text-primary">
              {reporter.designation} {reporter.location ? `• ${reporter.location}` : ''}
            </p>

            {reporter.biography && (
              <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed pt-1">
                {reporter.biography}
              </p>
            )}

            <div className="pt-2">
              <Link
                href={`/reporter/${reporter.slug}`}
                className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline"
              >
                <span>પત્રકાર પ્રોફાઇલ અને તમામ અહેવાલો જુઓ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

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
