'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Video,
  Play,
  Clock,
  Eye,
  Share2,
  Film,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';
import { VideoItem } from '../../../lib/types';
import api from '../../../lib/api';
import AdSlot from '../../../components/common/AdSlot';

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get('/videos?limit=50')
      .then((res) => {
        const vids: VideoItem[] = (res.data?.data || []).filter(
          (v: VideoItem) => !v.videoUrl?.includes('dQw4w9WgXcQ')
        );
        setVideos(vids);
        if (vids.length > 0) {
          setSelectedVideo(vids[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getEmbedInfo = (url?: string) => {
    if (!url) return { isYouTube: true, embedUrl: '' };

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
    setSelectedVideo(vid);
    api.post(`/videos/${vid.id}/view`).catch(() => {});
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = selectedVideo?.videoUrl || window.location.href;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeEmbed = getEmbedInfo(selectedVideo?.videoUrl);

  const rawDate = selectedVideo?.publishedAt || selectedVideo?.createdAt;
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
    <div className="space-y-6 font-gujarati max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-[#141b4d] text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border-b-4 border-secondary">
        <div>
          <div className="flex items-center gap-2">
            <Video className="w-6 h-6 text-secondary" />
            <h1 className="text-2xl font-black tracking-tight">વીડિયો સમાચાર (Video News)</h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            ગુજરાત અને દેશ-દુનિયાના તમામ મહત્વના સમાચાર વિગતવાર વીડિયો અહેવાલમાં
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reels"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-secondary-hover text-white text-xs font-bold transition-all shadow-xs"
          >
            <Film className="w-4 h-4" />
            <span>શોર્ટ્સ અને રીલ્સ</span>
          </Link>
          <Link
            href="/live-tv"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E51F2A] hover:bg-red-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>LIVE TV</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Player on Left (8 cols) + All Videos in Sidebar on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Video Player & Details BELOW the player */}
        <div className="lg:col-span-8 space-y-4">
          {selectedVideo ? (
            <>
              {/* Main Video Frame */}
              <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-2xl border border-gray-800 relative">
                {activeEmbed.embedUrl ? (
                  activeEmbed.isYouTube ? (
                    <iframe
                      key={selectedVideo.id}
                      src={activeEmbed.embedUrl}
                      title={selectedVideo.titleGu}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={selectedVideo.id}
                      src={activeEmbed.embedUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white p-6 space-y-2">
                    <img src="/logo.png" alt="" className="w-16 h-16 object-contain opacity-60" />
                    <p className="text-xs">વીડિયો લોડ થઈ રહ્યો છે...</p>
                  </div>
                )}
              </div>

              {/* Title & Other Details BELOW the Video */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-secondary text-white text-xs font-bold shadow-2xs">
                    {selectedVideo.category?.nameGu || 'વીડિયો સમાચાર'}
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

                {/* Bold Title Below Video */}
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug">
                  {selectedVideo.titleGu || selectedVideo.title}
                </h2>

                {/* Description Below Title */}
                {selectedVideo.description && (
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed pt-1">
                    {selectedVideo.description}
                  </p>
                )}

                {/* Date, Time, Duration & Channel Details Bar */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
                  <div className="flex flex-wrap items-center gap-4 font-sans text-xs">
                    {formattedDate && (
                      <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#E51F2A]" />
                        <span>{formattedDate}</span>
                      </div>
                    )}

                    {selectedVideo.duration && (
                      <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        <span className="font-mono">{selectedVideo.duration}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-gray-600">
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedVideo.viewsCount || 0} વ્યૂઝ</span>
                    </div>
                  </div>

                  {/* Channel Tag */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white p-0.5 border border-gray-200 shrink-0">
                      <img src="/logo.png" alt="" className="w-full h-full object-contain" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">BN NEWS GUJARATI</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-200">
              કોઈ વીડિયો પસંદ કરેલ નથી
            </div>
          )}

          {/* Ad Slot Below Details */}
          <AdSlot placement="videos_between_videos" />
        </div>

        {/* Right: Sidebar with ALL Videos visible */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-black text-gray-900">
                  તમામ વીડિયો સમાચાર (All Videos)
                </h3>
              </div>
              <span className="text-xs text-gray-400 font-bold">{videos.length}</span>
            </div>

            {/* Scrollable list of all videos */}
            <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
              {videos.map((vid) => {
                const isSelected = selectedVideo?.id === vid.id;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => handleSelectVideo(vid)}
                    className={`w-full text-left group flex gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/90 border-primary ring-1 ring-primary/30 shadow-xs'
                        : 'border-gray-200/70 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-28 h-18 rounded-lg overflow-hidden bg-gray-900 shrink-0">
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
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            isSelected ? 'bg-primary text-white shadow-md' : 'bg-black/60 text-white'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
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
                            હાલમાં ચાલુ
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ad Slot */}
          <AdSlot placement="videos_sidebar" />
        </div>
      </div>
    </div>
  );
}
