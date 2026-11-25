'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Play,
  ArrowRight,
  Calendar,
  Flame,
  Newspaper,
  Radio,
  X,
  ExternalLink,
} from 'lucide-react';
import { NewsArticle, VideoItem } from '../../lib/types';
import api from '../../lib/api';
import AdSlot from '../../components/common/AdSlot';

export default function HomePage() {
  const [liveNews, setLiveNews] = useState<NewsArticle[]>([]);
  const [trendingNews, setTrendingNews] = useState<any[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [popupVideo, setPopupVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/news?limit=30').catch(() => ({ data: { data: [] } })),
      api.get('/trending').catch(() => ({ data: { data: [] } })),
      api.get('/videos?limit=12').catch(() => ({ data: { data: [] } })),
    ]).then(([newsRes, trendRes, videoRes]) => {
      if (newsRes.data?.data && Array.isArray(newsRes.data.data)) {
        setLiveNews(newsRes.data.data);
      }
      if (trendRes.data?.data && Array.isArray(trendRes.data.data)) {
        setTrendingNews(trendRes.data.data);
      }
      if (videoRes.data?.data && Array.isArray(videoRes.data.data)) {
        const cleanVids = videoRes.data.data.filter(
          (v: VideoItem) => !v.videoUrl?.includes('dQw4w9WgXcQ') && !v.isReel
        );
        setVideos(cleanVids);
      }
      setLoading(false);
    });
  }, []);

  // Split live approved news into Hero Slider (top 5), Secondary, and Latest News
  const heroSlides = liveNews.slice(0, 5);
  const heroArticle = heroSlides[activeSlide] || (liveNews.length > 0 ? liveNews[0] : null);
  const secondaryArticles = liveNews.length > 1 ? liveNews.slice(1, 4) : [];

  useEffect(() => {
    if (isSliderPaused || heroSlides.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isSliderPaused, heroSlides.length]);
  // Row 1: 5 latest articles alongside Live TV card
  const latestRow1Articles = liveNews.length > 4 ? liveNews.slice(4, 9) : liveNews.slice(1, 6);
  // Additional 2 rows (6 cards per row = 12 additional cards)
  const latestAdditionalArticles = liveNews.length > 9 ? liveNews.slice(9, 21) : liveNews.slice(6, 18);

  // Trending articles: from /trending API or fallback to subsequent live news
  const trendingList =
    trendingNews.length > 0
      ? trendingNews.slice(0, 5).map((t) => t.news || t)
      : liveNews.slice(2, 7);

  const getPopupEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/shorts/')) {
      const vidId = url.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0`;
    }
    if (url.includes('youtube.com/embed/')) {
      return `${url}?autoplay=1&rel=0`;
    }
    return url;
  };

  const getCategoryColor = (catName?: string) => {
    if (!catName) return 'bg-[#1877F2]';
    if (catName.includes('ગુજરાત')) return 'bg-[#F58220]';
    if (catName.includes('ભારત')) return 'bg-[#1877F2]';
    if (catName.includes('વિશ્વ')) return 'bg-[#8B5CF6]';
    if (catName.includes('વેપાર') || catName.includes('વ્યાપાર')) return 'bg-[#EAB308]';
    if (catName.includes('રમત')) return 'bg-[#EF4444]';
    if (catName.includes('હવામાન') || catName.includes('મહાનગર')) return 'bg-[#6366F1]';
    return 'bg-[#202B78]';
  };

  return (
    <div className="space-y-8 font-gujarati">
      {/* Top Banner Advertisement Slot */}
      <AdSlot placement="homepage_below_breaking" />

      {/* ========================================================= */}
      {/* SECTION 1: HERO, SECONDARY & TRENDING (EXACT REFERENCE UI) */}
      {/* ========================================================= */}
      {heroArticle ? (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: Interactive Auto-Sliding Featured Hero News Carousel (5 cols on XL, 6 cols on LG) */}
          <div
            className="lg:col-span-6 xl:col-span-5 flex relative group/slider"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            <Link
              href={`/${heroArticle.category?.slug || 'gujarat'}/${heroArticle.slug}`}
              className="group relative w-full rounded-2xl overflow-hidden shadow-xs hover:shadow-cardHover transition-all flex flex-col justify-end min-h-[420px] lg:min-h-[460px] bg-gray-900 border border-gray-200"
            >
              {/* Background image with Ken Burns zoom */}
              {heroArticle.featuredImage ? (
                <img
                  key={`hero-img-${heroArticle.id}`}
                  src={heroArticle.featuredImage}
                  alt={heroArticle.titleGu}
                  className="absolute inset-0 w-full h-full object-cover animate-ken-burns brightness-95"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-navy via-slate-800 to-black flex items-center justify-center p-8">
                  <img src="/logo.png" alt="" className="w-32 h-32 object-contain opacity-40" />
                </div>
              )}

              {/* Top Bar: Category Pill + Slide Counter */}
              <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
                <span className="bg-[#E51B2B] text-white font-extrabold text-xs px-3 py-1 rounded-md shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {heroArticle.category?.nameGu || 'રાષ્ટ્રીય સમાચાર'}
                </span>
                {heroSlides.length > 1 && (
                  <span className="bg-black/55 backdrop-blur-xs text-white/90 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/15">
                    {activeSlide + 1} / {heroSlides.length}
                  </span>
                )}
              </div>

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent"></div>

              {/* Content at bottom with smooth slide-fade */}
              <div key={`hero-text-${heroArticle.id}`} className="relative p-5 sm:p-6 md:p-8 space-y-3 text-white animate-slide-fade">
                {/* Bold Gujarati Headline */}
                <h1 className="text-xl sm:text-2xl lg:text-xl font-black leading-snug group-hover:text-yellow-300 transition-colors">
                  {heroArticle.titleGu}
                </h1>

                {/* Description Snippet */}
                {heroArticle.descriptionGu && (
                  <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed font-normal">
                    {heroArticle.descriptionGu}
                  </p>
                )}

                {/* Date & Action Button */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>
                      {heroArticle.publishedAt
                        ? new Date(heroArticle.publishedAt).toLocaleDateString('gu-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : 'આજના સમાચાર'}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-[#183B7E] hover:bg-[#E51B2B] text-white font-bold text-xs px-4 py-2 rounded-lg shadow-xs transition-colors">
                    <span>વાંચો વધુ</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

                {/* Interactive Dots indicator */}
                {heroSlides.length > 1 && (
                  <div
                    className="flex items-center gap-1.5 pt-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    {heroSlides.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveSlide(idx);
                        }}
                        aria-label={`Slide ${idx + 1}`}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          activeSlide === idx
                            ? 'w-6 bg-white shadow-xs'
                            : 'w-2 bg-white/45 hover:bg-white/80'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Auto-Slide Progress Bar */}
              {heroSlides.length > 1 && !isSliderPaused && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15 z-20">
                  <div
                    key={`progress-${activeSlide}`}
                    className="h-full bg-gradient-to-r from-[#E51B2B] via-[#F58220] to-[#FFD900] animate-slider-progress"
                  />
                </div>
              )}
            </Link>

            {/* Prev / Next Navigation Arrows */}
            {heroSlides.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
                  }}
                  aria-label="Previous slide"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-[#E51B2B] text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover/slider:opacity-100 transition-all shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
                  }}
                  aria-label="Next slide"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-[#E51B2B] text-white flex items-center justify-center backdrop-blur-xs opacity-0 group-hover/slider:opacity-100 transition-all shadow-md"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          {/* Center: 3 Stacked Secondary News Cards (4 cols on XL, 6 cols on LG) */}
          <div className="lg:col-span-6 xl:col-span-4 flex flex-col justify-between gap-3.5">
            {secondaryArticles.length > 0 ? (
              secondaryArticles.map((article, idx) => (
                <Link
                  key={article.id || idx}
                  href={`/${article.category?.slug || 'gujarat'}/${article.slug}`}
                  className="group news-card-creative bg-white rounded-2xl p-3 sm:p-3.5 border border-gray-200/90 hover:border-primary/30 hover:shadow-cardHover flex items-center gap-3.5 flex-1 justify-between shadow-2xs"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-28 sm:w-32 h-20 sm:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt={article.titleGu}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-blue-50 flex items-center justify-center text-primary p-2">
                        <img src="/logo.png" alt="" className="w-10 h-10 object-contain opacity-60" />
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <span
                      className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded text-white ${getCategoryColor(
                        article.category?.nameGu
                      )}`}
                    >
                      {article.category?.nameGu || 'સમાચાર'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                      {article.titleGu}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>
                        {article.publishedAt
                          ? new Date(article.publishedAt).toLocaleDateString('gu-IN', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'તાજેતર'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-gray-200 text-center text-xs text-gray-400 flex items-center justify-center flex-1">
                સંપાદકીય ટીમ દ્વારા વધુ સમાચાર પ્રકાશિત થતાં અહીં પ્રદર્શિત થશે.
              </div>
            )}
          </div>

          {/* Right: 🔥 ટ્રેન્ડિંગ સમાચાર (Trending 1 to 5) (3 cols on XL, 12 cols on LG) */}
          <div className="lg:col-span-12 xl:col-span-3 flex flex-col">
            <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 flex-1 flex flex-col justify-between">
              {/* Header */}
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Flame className="w-5 h-5 text-[#F58220]" />
                <h3 className="font-black text-base text-gray-900">
                  ટ્રેન્ડિંગ સમાચાર
                </h3>
              </div>

              {/* 5 Numbered Items */}
              <div className="divide-y divide-gray-100 flex-1 flex flex-col justify-between pt-1">
                {trendingList.length > 0 ? (
                  trendingList.slice(0, 5).map((item, idx) => (
                    <Link
                      key={item.id || idx}
                      href={`/${item.category?.slug || 'gujarat'}/${item.slug}`}
                      className="group flex items-center gap-3 py-2.5 hover:bg-gray-50/80 rounded-lg px-1 transition-colors"
                    >
                      {/* Orange Rank Number */}
                      <span className="text-base font-black text-[#F58220] w-4 text-center shrink-0">
                        {idx + 1}
                      </span>

                      {/* Small Square Thumbnail */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                        {item.featuredImage ? (
                          <img
                            src={item.featuredImage}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-orange-50 flex items-center justify-center p-1">
                            <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary transition-colors flex-1">
                        {item.titleGu || item.title}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="py-6 text-center text-xs text-gray-400">
                    કોઈ ટ્રેન્ડિંગ સમાચાર ઉપલબ્ધ નથી
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      ) : !loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center my-6">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
            <Newspaper className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-1">હાલમાં કોઈ તાજા સમાચાર ઉપલબ્ધ નથી</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            સંપાદકીય ટીમ દ્વારા મંજૂર કરાયેલ સમાચાર અહીં તાત્કાલિક પ્રદર્શિત થશે.
          </p>
        </div>
      ) : null}

      {/* Mid-Page In-Feed Advertisement Slot */}
      <AdSlot placement="homepage_between_latest" />

      {/* ========================================================= */}
      {/* SECTION 2: તાજા સમાચાર & LIVE TV BANNER (MATCHING REFERENCE) */}
      {/* ========================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-[#E51B2B] inline-block rounded-full"></span>
            <h2 className="text-lg md:text-xl font-black text-gray-900">
              તાજા સમાચાર
            </h2>
          </div>

          <Link
            href="/latest-news"
            className="text-xs font-bold text-primary hover:text-[#E51B2B] flex items-center gap-1 transition-colors"
          >
            <span>બધા સમાચાર જુઓ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Row 1: 5 Latest News Cards + Live TV Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch">
          {latestRow1Articles.map((article) => (
            <Link
              key={article.id}
              href={`/${article.category?.slug || 'gujarat'}/${article.slug}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs hover:shadow-cardHover transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                {article.featuredImage ? (
                  <img
                    src={article.featuredImage}
                    alt={article.titleGu}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-blue-50 flex items-center justify-center p-2">
                    <img src="/logo.png" alt="" className="w-12 h-12 object-contain opacity-50" />
                  </div>
                )}
                {/* Category Pill */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded text-white shadow-xs ${getCategoryColor(
                      article.category?.nameGu
                    )}`}
                  >
                    {article.category?.nameGu || 'સમાચાર'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {article.titleGu}
                </h3>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium pt-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString('gu-IN', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'તાજેતર'}
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {/* Official BN News Gujarati Live TV Card matching reference */}
          <div className="group rounded-2xl overflow-hidden border border-slate-700/30 bg-gradient-to-br from-[#0c1432] via-[#152358] to-[#1a2c70] p-4 flex flex-col items-center justify-between text-center shadow-md hover:shadow-xl transition-all">
            <div className="space-y-2 mt-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-white p-1 shadow-lg flex items-center justify-center">
                <img src="/logo.png" alt="BN News" className="w-full h-full object-contain" />
              </div>
              <h4 className="text-white font-black text-sm pt-1">
                BN NEWS ગુજરાતી
              </h4>
              <p className="text-xs text-gray-300 font-bold">
                Live 24 x 7
              </p>
            </div>

            <Link
              href="/live-tv"
              className="mt-3 w-full py-2 bg-[#E51B2B] hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all group-hover:scale-102"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Live TV</span>
            </Link>
          </div>
        </div>

        {/* Rows 2 & 3: Additional 2 Full Rows of Latest News Cards (12 Cards) */}
        {latestAdditionalArticles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-stretch pt-1">
            {latestAdditionalArticles.map((article) => (
              <Link
                key={article.id}
                href={`/${article.category?.slug || 'gujarat'}/${article.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs hover:shadow-cardHover transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                  {article.featuredImage ? (
                    <img
                      src={article.featuredImage}
                      alt={article.titleGu}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-50 flex items-center justify-center p-2">
                      <img src="/logo.png" alt="" className="w-12 h-12 object-contain opacity-50" />
                    </div>
                  )}
                  {/* Category Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded text-white shadow-xs ${getCategoryColor(
                        article.category?.nameGu
                      )}`}
                    >
                      {article.category?.nameGu || 'સમાચાર'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {article.titleGu}
                  </h3>

                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium pt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString('gu-IN', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'તાજેતર'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================= */}
      {/* SECTION 3: વીડિયો સમાચાર (YOUTUBE CHANNEL REAL VIDEOS)       */}
      {/* ========================================================= */}
      {videos.length > 0 && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 bg-[#E51B2B] inline-block rounded-full"></span>
              <h2 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                <Play className="w-4 h-4 fill-red-600 text-red-600" />
                <span>વીડિયો સમાચાર</span>
              </h2>
            </div>

            <Link
              href="/video-news"
              className="text-xs font-bold text-primary hover:text-[#E51B2B] flex items-center gap-1 transition-colors"
            >
              <span>બધા વીડિયો જુઓ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {videos.slice(0, 4).map((vid) => (
              <div
                key={vid.id}
                onClick={() => setPopupVideo(vid)}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-2xs hover:shadow-cardHover transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=80'}
                    alt={vid.titleGu}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[#E51F2A] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-white translate-x-0.5" />
                    </div>
                  </div>
                  {vid.duration && (
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                      {vid.duration}
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <h3 className="font-bold text-xs sm:text-sm text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                    {vid.titleGu}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium pt-1 border-t border-gray-100">
                    <span className="font-bold text-primary">BN NEWS LIVE</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPopupVideo(vid);
                      }}
                      className="text-[#E51F2A] font-bold hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-[#E51F2A]" />
                      <span>અહીં ચલાવો</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video Popup Player Modal */}
      {popupVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
          onClick={() => setPopupVideo(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full shadow-2xl border border-gray-800 flex flex-col font-gujarati animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header / Title bar */}
            <div className="bg-[#141b4d] text-white p-3.5 sm:p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Play className="w-4 h-4 text-[#E51F2A] fill-[#E51F2A] shrink-0" />
                <h3 className="text-sm sm:text-base font-bold truncate">
                  {popupVideo.titleGu || popupVideo.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPopupVideo(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                title="બંધ કરો (Close)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="bg-black aspect-video w-full relative">
              {popupVideo.videoUrl?.includes('youtube') || popupVideo.videoUrl?.includes('youtu.be') ? (
                <iframe
                  src={getPopupEmbedUrl(popupVideo.videoUrl)}
                  title={popupVideo.titleGu}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={popupVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Video Details Below */}
            <div className="p-4 sm:p-5 space-y-3 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base sm:text-lg font-black text-gray-900">
                  {popupVideo.titleGu || popupVideo.title}
                </h2>
                {popupVideo.videoUrl && (
                  <a
                    href={popupVideo.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                  >
                    <span>યુટ્યુબ પર જુઓ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {popupVideo.description && (
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {popupVideo.description}
                </p>
              )}

              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 font-sans">
                <div className="flex items-center gap-3">
                  {popupVideo.createdAt && (
                    <div className="flex items-center gap-1 text-gray-700">
                      <Calendar className="w-3.5 h-3.5 text-[#E51F2A]" />
                      <span>
                        {new Date(popupVideo.createdAt).toLocaleDateString('gu-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {popupVideo.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span>{popupVideo.duration}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <img src="/logo.png" alt="" className="w-5 h-5 object-contain" />
                  <span>BN NEWS GUJARATI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Leaderboard Advertisement */}
      <AdSlot placement="homepage_bottom_leaderboard" />
    </div>
  );
}
