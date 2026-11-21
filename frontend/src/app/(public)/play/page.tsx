'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  MapPin,
  Search,
  Sparkles,
  Share2,
  Instagram,
  Facebook,
  Eye,
} from 'lucide-react';
import api from '../../../lib/api';

interface StoryProfile {
  id: string;
  name: string;
  avatar: string;
  hasUnseenStory?: boolean;
}

interface VideoAdItem {
  id: string;
  titleGu: string;
  title: string;
  sponsorName: string;
  sponsorAvatar?: string;
  mediaUrl: string;
  thumbnailUrl: string;
  whatsappNumber?: string;
  duration?: string;
  externalUrl?: string;
  viewsCount?: number;
}

const PROFILES: StoryProfile[] = [
  { id: '1', name: "Priya's Groc...", avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', hasUnseenStory: true },
  { id: '2', name: 'TechSphere ...', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', hasUnseenStory: true },
  { id: '3', name: 'City Square ...', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', hasUnseenStory: true },
  { id: '4', name: "Amit's Groc...", avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', hasUnseenStory: true },
  { id: '5', name: 'TinyTrends', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', hasUnseenStory: true },
  { id: '6', name: 'Snack Hub', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', hasUnseenStory: false },
];

const INITIAL_ADS: VideoAdItem[] = [
  {
    id: 'ad-1',
    titleGu: 'કોલગેટ મેક્સફ્રેશ કૂલિંગ ક્રિસ્ટલ્સ રેઇનબો જેલ',
    title: 'Colgate MaxFresh Rainbow Fresh Gel',
    sponsorName: "Amit's Grocery Hub",
    mediaUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&auto=format&fit=crop&q=80',
    duration: '0:10',
    whatsappNumber: '+919876543210',
    viewsCount: 1420,
  },
  {
    id: 'ad-2',
    titleGu: 'કેડબરી ડેરી મિલ્ક સિલ્ક બબ્લી ચોકલેટ બાર',
    title: 'Cadbury Dairy Milk Silk Bubbly Chocolate Bar',
    sponsorName: "Priya's Grocery Mart",
    mediaUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&auto=format&fit=crop&q=80',
    duration: '0:08',
    whatsappNumber: '+919876543210',
    viewsCount: 2310,
  },
  {
    id: 'ad-3',
    titleGu: 'લેક્મે ફોરએવર મેટ લિક્વિડ લિપ, ૧૬ કલાક લોંગલાસ્ટિંગ',
    title: 'Lakme Forever Matte Liquid Lip, 16hr Lipstick',
    sponsorName: 'Nykaa Beauty Hub',
    mediaUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&auto=format&fit=crop&q=80',
    duration: '0:10',
    whatsappNumber: '+919876543210',
    viewsCount: 3180,
  },
  {
    id: 'ad-4',
    titleGu: 'સેમસંગ ગેલેક્સી બુક ૩ 360 ટચસ્ક્રીન અલ્ટ્રા સ્લિમ લેપટોપ',
    title: 'SAMSUNG Galaxy Book3 360',
    sponsorName: 'TechSphere Electronics',
    mediaUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    duration: '0:10',
    whatsappNumber: '+919876543210',
    viewsCount: 1950,
  },
  {
    id: 'ad-5',
    titleGu: 'કેલોગ્સ ચોકોઝ ક્રન્ચી બ્રેકફાસ્ટ સિરીયલ',
    title: "Kellogg's Chocos Chocolatey Crunchy Breakfast",
    sponsorName: "Priya's Grocery Mart",
    mediaUrl: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?w=600&auto=format&fit=crop&q=80',
    duration: '0:12',
    whatsappNumber: '+919876543210',
    viewsCount: 890,
  },
  {
    id: 'ad-6',
    titleGu: 'સ્ક્વિડ ગેમ ઓરિજિનલ બ્લેક કોટન ટી-શર્ટ',
    title: 'Squid Game Black Cotton Premium T-Shirt',
    sponsorName: 'TinyTrends Apparel',
    mediaUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    duration: '0:10',
    whatsappNumber: '+919876543210',
    viewsCount: 1650,
  },
];

export default function PlayAndAdsPage() {
  const [ads, setAds] = useState<VideoAdItem[]>(INITIAL_ADS);
  const [socialTab, setSocialTab] = useState<'ALL' | 'INSTAGRAM' | 'FACEBOOK'>('ALL');
  const [socialPosts, setSocialPosts] = useState<any[]>([]);

  useEffect(() => {
    api.get('/ads').then((res) => {
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setAds(res.data.data);
      }
    });

    api.get('/social-feeds').then((res) => {
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSocialPosts(res.data.data);
      }
    });
  }, []);

  const openWhatsApp = (num: string, itemTitle: string) => {
    const text = encodeURIComponent(`નમસ્તે, મેં BN NEWS પર "${itemTitle}" ની જાહેરાત જોઈ. મને વધુ વિગત આપશો.`);
    window.open(`https://wa.me/${num.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-8 font-gujarati">
      {/* Top Banner / Location & Tagline Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs md:text-sm text-neutral-text font-bold">
          <MapPin className="w-4 h-4 text-secondary" />
          <span>ભુજ, કચ્છ, ગુજરાત (Bhuj, Gujarat, India)</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">સ્થાનિક સ્ટોર્સ અને સર્જકોના વીડિયો અને ડીલ્સ</span>
          <span className="bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            LIVE DEALS
          </span>
        </div>
      </div>

      {/* SECTION 1: WATCH & BUY / STORIES ROW (Matching Mockup 1) */}
      <section className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-primary flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-primary" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-neutral-text">
                Watch & Buy (વાર્તાઓ અને સ્ટોરીઝ)
              </h2>
              <p className="text-[11px] text-gray-400">
                Fresh updates from stores and creators you can shop
              </p>
            </div>
          </div>
        </div>

        {/* Circular Avatars Carousel */}
        <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-none">
          {PROFILES.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer group"
            >
              <div
                className={`w-16 h-16 md:w-18 md:h-18 rounded-full p-0.5 transition-transform group-hover:scale-105 shadow-sm ${
                  profile.hasUnseenStory
                    ? 'bg-gradient-to-tr from-yellow-400 via-secondary to-breaking'
                    : 'bg-gray-200'
                }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-0.5">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
              <span className="text-xs font-semibold text-neutral-text group-hover:text-primary transition-colors text-center truncate max-w-[80px]">
                {profile.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: EXPLORE SHOPPABLE VIDEOS & REELS (Matching Mockup 2) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-secondary/10 text-secondary flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-black text-neutral-text">
                Explore shoppable videos & Advertisements
              </h2>
              <p className="text-xs text-neutral-muted">
                Tap a video to watch, inquiry on WhatsApp, and connect directly with businesses
              </p>
            </div>
          </div>

          {/* Social Media Tabs */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSocialTab('ALL')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                socialTab === 'ALL' ? 'bg-primary text-white shadow-xs' : 'bg-gray-100 text-gray-700'
              }`}
            >
              તમામ ડીલ્સ
            </button>
            <button
              onClick={() => setSocialTab('INSTAGRAM')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all ${
                socialTab === 'INSTAGRAM'
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>Instagram Reels</span>
            </button>
            <button
              onClick={() => setSocialTab('FACEBOOK')}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold transition-all ${
                socialTab === 'FACEBOOK' ? 'bg-blue-600 text-white shadow-xs' : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Facebook className="w-3.5 h-3.5" />
              <span>Facebook Feeds</span>
            </button>
          </div>
        </div>

        {/* Video Reel Cards Grid (4 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-cardHover transition-all flex flex-col justify-between"
            >
              {/* Media Preview Aspect Ratio (3:4 or 4:5 vertical reel look) */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-900">
                <img
                  src={ad.thumbnailUrl || ad.mediaUrl}
                  alt={ad.titleGu}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Duration Badge (Top Left matching mockup e.g. ▶ 0:10) */}
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>{ad.duration || '0:10'}</span>
                </div>

                {/* Views Counter (Top Right) */}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3 text-gray-300" />
                  <span>{ad.viewsCount || 1}</span>
                </div>

                {/* Floating WhatsApp Action Button (Bottom Left) */}
                {ad.whatsappNumber && (
                  <button
                    onClick={() => openWhatsApp(ad.whatsappNumber!, ad.titleGu)}
                    className="absolute bottom-3 left-3 w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                    title="WhatsApp પર પૂછપરછ કરો"
                  >
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </button>
                )}
              </div>

              {/* Card Footer: Sponsor name, Product Title & Inquiry */}
              <div className="p-3.5 space-y-2">
                <h3 className="font-gujarati text-xs md:text-sm font-bold text-neutral-text line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {ad.titleGu}
                </h3>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-gray-100">
                  <span className="font-semibold text-gray-500 truncate max-w-[140px]">
                    {ad.sponsorName}
                  </span>

                  <button
                    onClick={() => ad.whatsappNumber ? openWhatsApp(ad.whatsappNumber, ad.titleGu) : null}
                    className="text-primary hover:text-secondary font-bold inline-flex items-center gap-1"
                  >
                    <span>પૂછપરછ</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: CONNECTED SOCIAL MEDIA FEEDS (INSTAGRAM & FACEBOOK EMBEDS) */}
      {socialPosts.length > 0 && (
        <section className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-pink-500 to-blue-600"></span>
              <h2 className="text-base font-extrabold text-neutral-text">
                BN NEWS ગુજરાતી સોશિયલ ફીડ (Live Social Feeds)
              </h2>
            </div>
            <span className="text-xs text-gray-400">@bnnewsgujarati પરથી તાજા અપડેટ્સ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialPosts.map((post) => (
              <a
                key={post.id}
                href={post.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-3 rounded-xl border border-gray-100 hover:border-primary/40 hover:bg-gray-50/50 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  {post.platform === 'INSTAGRAM' ? (
                    <Instagram className="w-4 h-4 text-pink-600" />
                  ) : (
                    <Facebook className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-xs font-bold text-neutral-text">{post.authorName}</span>
                </div>
                {post.thumbnailUrl && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2">
                    <img src={post.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                )}
                <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">{post.caption}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
