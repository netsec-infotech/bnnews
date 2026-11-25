'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Play,
  Share2,
  Eye,
  MessageCircle,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
} from 'lucide-react';
import { VideoItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function ReelsPage() {
  const [reels, setReels] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  useEffect(() => {
    api
      .get('/reels?limit=30')
      .then((res) => {
        if (res.data?.data) {
          setReels(res.data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleShare = (reel: VideoItem) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/reels?id=${reel.id}`;
      const text = `${reel.titleGu} - BN NEWS ગુજરાતી રીલ્સ જુઓ:`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    }
  };

  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/shorts/')) {
      const vidId = url.split('/shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0&controls=1`;
    }
    if (url.includes('youtube.com/watch')) {
      const vidId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0&controls=1`;
    }
    if (url.includes('youtu.be/')) {
      const vidId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vidId}?autoplay=1&rel=0&controls=1`;
    }
    if (url.includes('youtube.com/embed/')) {
      return `${url}?autoplay=1&rel=0&controls=1`;
    }
    return url;
  };

  const currentReel = activeReelIndex !== null ? reels[activeReelIndex] : null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-gujarati pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-gray-700"
            title="મુખ્ય પૃષ્ઠ"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Film className="w-5 h-5 text-secondary" />
              <span>BN NEWS વાયરલ રીલ્સ અને શોર્ટ્સ</span>
            </h1>
            <p className="text-xs text-gray-500">
              ગુજરાતના મહત્વપૂર્ણ બનાવો માત્ર ૩૦ થી ૬૦ સેકન્ડમાં
            </p>
          </div>
        </div>

        <Link
          href="/video-news"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-xs"
        >
          <Video className="w-3.5 h-3.5" />
          <span>વીડિયો બુલેટિન જુઓ</span>
        </Link>
      </div>

      {/* Reels Grid (Vertical 9:16 Cards) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="rounded-2xl bg-gray-200 aspect-[9/16] animate-pulse" />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-gray-200 text-xs">
          કોઈ રીલ્સ ઉપલબ્ધ નથી.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {reels.map((reel, idx) => (
            <div
              key={reel.id}
              onClick={() => setActiveReelIndex(idx)}
              className="group relative rounded-2xl overflow-hidden bg-gray-950 aspect-[9/16] shadow-md hover:shadow-xl transition-all border border-gray-800 flex flex-col justify-between cursor-pointer"
            >
              {/* Background Thumbnail */}
              <img
                src={reel.thumbnailUrl || '/images/bn-news-logo.png'}
                alt={reel.titleGu}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
              />

              {/* Top Badges */}
              <div className="relative z-10 p-3 flex items-center justify-between">
                <span className="bg-secondary text-white font-sans text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                  Reel
                </span>
                <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                  {reel.duration || '0:30'}
                </span>
              </div>

              {/* Play Button Indicator */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:scale-110 group-hover:bg-[#E51F2A] transition-all shadow-lg">
                  <Play className="w-5 h-5 fill-white ml-0.5" />
                </div>
              </div>

              {/* Bottom Overlay & Share */}
              <div className="relative z-10 p-3.5 bg-gradient-to-t from-black via-black/70 to-transparent space-y-2">
                <h3 className="text-white text-xs font-bold line-clamp-2 leading-snug drop-shadow-xs">
                  {reel.titleGu}
                </h3>

                <div className="flex items-center justify-between pt-1 border-t border-white/20 text-gray-300 text-[10px]">
                  <div className="flex items-center gap-1 font-mono">
                    <Eye className="w-3 h-3 text-secondary" />
                    <span>{reel.viewsCount || 0}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShare(reel);
                    }}
                    className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                    title="વોટ્સએપ શેર"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>શેર</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive 9:16 Reel Player Modal */}
      {currentReel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between border border-gray-800">
            {/* Close Button */}
            <button
              onClick={() => setActiveReelIndex(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Next / Prev Controls */}
            {activeReelIndex! > 0 && (
              <button
                onClick={() => setActiveReelIndex(activeReelIndex! - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {activeReelIndex! < reels.length - 1 && (
              <button
                onClick={() => setActiveReelIndex(activeReelIndex! + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Video Player */}
            <div className="w-full h-full relative">
              {currentReel.videoUrl?.includes('youtube.com') || currentReel.videoUrl?.includes('youtu.be') ? (
                <iframe
                  src={getEmbedUrl(currentReel.videoUrl)}
                  title={currentReel.titleGu}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={currentReel.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Bottom Details Overlay in Modal */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent text-white space-y-1 pointer-events-none">
              <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-bold uppercase">
                BN NEWS REEL
              </span>
              <p className="text-xs font-bold line-clamp-2">{currentReel.titleGu}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
