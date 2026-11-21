'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Film, Play, Share2, Eye, MessageCircle, Heart, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { VideoItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function ReelsPage() {
  const [reels, setReels] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    api
      .get('/reels?limit=15')
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-gujarati">
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
          href="/videos"
          className="px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors shadow-xs"
        >
          વીડિયો સમાચાર જુઓ
        </Link>
      </div>

      {/* Reels Grid (Vertical 9:16 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            className="group relative rounded-2xl overflow-hidden bg-gray-950 aspect-[9/16] shadow-md hover:shadow-xl transition-all border border-gray-800 flex flex-col justify-between"
          >
            {/* Background Thumbnail / Video Preview */}
            <img
              src={reel.thumbnailUrl || 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600&auto=format&fit=crop&q=80'}
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
                  <span>{reel.viewsCount || 120}</span>
                </div>

                <button
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
    </div>
  );
}
