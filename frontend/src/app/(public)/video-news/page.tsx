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
  Check,
  ChevronRight,
  User,
} from 'lucide-react';
import { VideoItem } from '../../../lib/types';
import api from '../../../lib/api';
import AdSlot from '../../../components/common/AdSlot';

export default function VideoNewsPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    // Fetch video news (isReel: false)
    api
      .get(`/videos?limit=24&page=${page}`)
      .then((res) => {
        const vids: VideoItem[] = (res.data?.data || []).filter(
          (v: VideoItem) => !v.videoUrl?.includes('dQw4w9WgXcQ') && !v.isReel
        );
        setVideos(vids);
        if (vids.length > 0 && !selectedVideo) {
          setSelectedVideo(vids[0]);
        }
        if (res.data?.meta?.totalPages) {
          setTotalPages(res.data.meta.totalPages);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page]);

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
            <h1 className="text-xl md:text-2xl font-black">
              વિડિયો સમાચાર બુલેટિન (Video News Reports)
            </h1>
          </div>
          <p className="text-xs text-gray-300 mt-1">
            ગુજરાત અને દેશ-દુનિયાના તમામ મહત્વના સમાચાર વિગતવાર 16:9 વિડિયો અહેવાલમાં
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/reels"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-xs transition-opacity"
          >
            <Film className="w-4 h-4" />
            <span>શોર્ટ રીલ્સ (Reels)</span>
          </Link>
          <Link
            href="/live-tv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-xs transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>LIVE TV</span>
          </Link>
        </div>
      </div>

      {/* Main Video Stage */}
      {selectedVideo && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white p-4 md:p-6 rounded-2xl border border-gray-200/90 shadow-xs">
          {/* Left: Video Player */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black shadow-inner">
              {activeEmbed.isYouTube ? (
                <iframe
                  src={activeEmbed.embedUrl}
                  title={selectedVideo.titleGu}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeEmbed.embedUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              )}
            </div>

            {/* Video Details Under Player */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded">
                  {selectedVideo.category?.nameGu || 'મુખ્ય સમાચાર બુલેટિન'}
                </span>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  {formattedDate && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-secondary" />
                      <span>{formattedDate}</span>
                    </span>
                  )}
                  {selectedVideo.viewsCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{selectedVideo.viewsCount} વ્યુઝ</span>
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
                {selectedVideo.titleGu}
              </h2>

              {selectedVideo.description && (
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  {selectedVideo.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Share2 className="w-3.5 h-3.5 text-primary" />}
                  <span>{copied ? 'લિંક કોપી થઈ!' : 'વિડિયો શેર કરો'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right: Sidebar Video Playlist */}
          <div className="lg:col-span-4 space-y-3 border-t lg:border-t-0 lg:border-l lg:pl-6 border-gray-100">
            <h3 className="font-bold text-sm text-gray-900 flex items-center justify-between">
              <span>તાજા વિડિયો બુલેટિન</span>
              <span className="text-[11px] text-gray-400 font-normal">({videos.length} વિડિયો)</span>
            </h3>

            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 scrollbar-thin">
              {videos.map((vid) => {
                const isSelected = selectedVideo.id === vid.id;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    onClick={() => handleSelectVideo(vid)}
                    className={`w-full text-left p-2 rounded-xl flex gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-50 border border-primary/30 shadow-xs ring-1 ring-primary/20'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="relative w-28 h-18 rounded-lg overflow-hidden bg-gray-900 shrink-0 aspect-video">
                      <img
                        src={vid.thumbnailUrl || '/images/bn-news-logo.png'}
                        alt={vid.titleGu}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white" />
                      </div>
                      {vid.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded font-mono">
                          {vid.duration}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <p
                        className={`text-xs font-bold line-clamp-2 leading-snug ${
                          isSelected ? 'text-primary' : 'text-gray-800'
                        }`}
                      >
                        {vid.titleGu}
                      </p>
                      <span className="text-[10px] text-gray-400 block">
                        {new Date(vid.publishedAt || vid.createdAt || Date.now()).toLocaleDateString('gu-IN')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Ad Slot */}
      <AdSlot placement="news_after_article" />
    </div>
  );
}
