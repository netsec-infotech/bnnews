'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Radio,
  Play,
  Share2,
  Calendar,
  Clock,
  Eye,
  Check,
  Film,
  Sparkles,
  Volume2,
} from 'lucide-react';
import { YouTubeLiveSetting, VideoItem } from '../../../lib/types';
import api from '../../../lib/api';
import AdSlot from '../../../components/common/AdSlot';

export default function LiveTvPage() {
  const [liveSetting, setLiveSetting] = useState<YouTubeLiveSetting | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/youtube/live').catch(() => ({ data: { data: null } })),
      api.get('/videos?limit=30').catch(() => ({ data: { data: [] } })),
    ]).then(([liveRes, videoRes]) => {
      const vids: VideoItem[] = (videoRes.data?.data || []).filter(
        (v: VideoItem) => !v.videoUrl?.includes('dQw4w9WgXcQ')
      );
      setVideos(vids);

      if (liveRes.data?.data) {
        setLiveSetting(liveRes.data.data);
      }

      // Default active video: First real bulletin
      if (vids.length > 0) {
        setActiveVideo(vids[0]);
      }
      setLoading(false);
    });
  }, []);

  const getEmbedInfo = (url?: string) => {
    if (!url) return { isYouTube: true, embedUrl: '' };

    if (url.includes('dQw4w9WgXcQ')) {
      return { isYouTube: true, embedUrl: '' };
    }

    if (url.includes('youtube.com/watch')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      return { isYouTube: true, embedUrl: `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0` };
    }
    if (url.includes('youtube.com/shorts/')) {
      const vidId = url.split('/shorts/')[1]?.split('?')[0];
      return { isYouTube: true, embedUrl: `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0` };
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      return { isYouTube: true, embedUrl: `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0` };
    }
    if (url.includes('youtube.com/embed/')) {
      return { isYouTube: true, embedUrl: `${url}?autoplay=1&rel=0` };
    }

    return { isYouTube: false, embedUrl: url, directUrl: url };
  };

  const handleSelectVideo = (vid: VideoItem) => {
    setActiveVideo(vid);
    // Track video view
    api.post(`/videos/${vid.id}/view`).catch(() => {});
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = activeVideo?.videoUrl || window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeEmbed = getEmbedInfo(activeVideo?.videoUrl);

  const rawDate = activeVideo?.publishedAt || activeVideo?.createdAt;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('gu-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-gujarati pb-12">
      {/* Top Banner Header */}
      <div className="bg-[#141b4d] text-white p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border-b-4 border-secondary">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full bg-[#E51F2A] flex items-center justify-center animate-pulse shadow-lg shrink-0">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight">BN NEWS LIVE TV</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E51F2A] text-white text-[10px] font-sans font-bold uppercase tracking-wider animate-pulse">
                • LIVE 24x7
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              તમારા વિસ્તારની, તમારા ભાષામાં... અવિરત જીવંત સમાચાર પ્રસારણ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/videos"
            className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors whitespace-nowrap"
          >
            વીડિયો લાઇબ્રેરી
          </Link>
          <Link
            href="/reels"
            className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-white text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1"
          >
            <Film className="w-3.5 h-3.5" />
            <span>વાયરલ રીલ્સ</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Single Responsive Video Player + Live Bulletins Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Player & Detailed Metadata (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border border-gray-800 relative">
            {activeEmbed.embedUrl ? (
              activeEmbed.isYouTube ? (
                <iframe
                  key={activeVideo?.id || 'live-player'}
                  src={activeEmbed.embedUrl}
                  title={activeVideo?.titleGu || 'BN News Live Stream'}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  key={activeVideo?.id || 'direct-player'}
                  src={activeEmbed.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 space-y-3 bg-slate-900">
                <img src="/logo.png" alt="BN News" className="w-20 h-20 object-contain opacity-75" />
                <p className="text-sm font-bold">વીડિયો લોડ થઈ રહ્યો છે...</p>
              </div>
            )}
          </div>

          {/* Video Headline, Upload Date, Time & Metadata Card */}
          {activeVideo && (
            <div className="bg-white rounded-2xl p-5 border border-gray-200/90 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#E51F2A] text-white text-xs font-extrabold shadow-2xs">
                  {activeVideo.category?.nameGu || 'મુખ્ય બુલેટિન'}
                </span>

                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold transition-all shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">લિંક કોપી થઈ!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-primary" />
                      <span>શેર કરો</span>
                    </>
                  )}
                </button>
              </div>

              {/* Title */}
              <h2 className="text-lg md:text-xl font-black text-gray-900 leading-snug">
                {activeVideo.titleGu || activeVideo.title}
              </h2>

              {/* Description */}
              {activeVideo.description && (
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed pt-1">
                  {activeVideo.description}
                </p>
              )}

              {/* Upload Details Bar (Date, Time, Views, Duration, Official Channel) */}
              <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-sans text-[11px] sm:text-xs">
                  {formattedDate && (
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#E51F2A]" />
                      <span>{formattedDate}</span>
                    </div>
                  )}

                  {activeVideo.duration && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span className="font-mono">{activeVideo.duration}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>{activeVideo.viewsCount || 0} વ્યૂઝ</span>
                  </div>
                </div>

                {/* Channel Badge */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-gray-200 shrink-0">
                    <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">BN NEWS GUJARATI</span>
                </div>
              </div>
            </div>
          )}

          {/* Ad Slot Below Player */}
          <AdSlot placement="live_tv_below_player" />
        </div>

        {/* Right Column: Live Chat/Bulletin Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-black text-gray-900">
                  તાજા વીડિયો બુલેટિન (Latest Bulletins)
                </h3>
              </div>
              <span className="text-[11px] text-gray-400 font-bold">{videos.length}</span>
            </div>

            {/* Scrollable Bulletins list - Click changes video in the same panel */}
            <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
              {videos.map((vid) => {
                const isSelected = activeVideo?.id === vid.id;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => handleSelectVideo(vid)}
                    className={`w-full text-left group flex gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-primary ring-1 ring-primary/30 shadow-xs'
                        : 'border-gray-200/70 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-24 sm:w-28 h-16 rounded-lg overflow-hidden bg-gray-900 shrink-0">
                      <img
                        src={
                          vid.thumbnailUrl ||
                          'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80'
                        }
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-primary text-white' : 'bg-black/60 text-white'
                          }`}
                        >
                          <Play className="w-3 h-3 fill-white ml-0.5" />
                        </div>
                      </div>
                      {vid.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono px-1 rounded">
                          {vid.duration}
                        </span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                      <h4
                        className={`text-xs font-bold line-clamp-2 leading-snug transition-colors ${
                          isSelected ? 'text-primary font-black' : 'text-gray-900 group-hover:text-primary'
                        }`}
                      >
                        {vid.titleGu}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-gray-400 font-sans pt-1">
                        <span>
                          {vid.createdAt
                            ? new Date(vid.createdAt).toLocaleDateString('gu-IN', {
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'તાજેતર'}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-primary font-bold">
                            વાગી રહ્યું છે
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live TV Sidebar Ad Slot */}
          <AdSlot placement="live_tv_sidebar" />
        </div>
      </div>
    </div>
  );
}
