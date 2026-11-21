'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Video, Film, Plus, Trash2, Edit, Play, Eye, Clock, Search, ExternalLink } from 'lucide-react';
import { VideoItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'reels'>('all');
  const [search, setSearch] = useState('');

  const loadVideos = () => {
    setLoading(true);
    api
      .get('/admin/videos')
      .then((res) => {
        if (res.data?.success) setVideos(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે આ વીડિયો કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/videos/${id}`);
      loadVideos();
    } catch {
      alert('વીડિયો કાઢી શકાયો નહીં.');
    }
  };

  const filtered = videos.filter((v) => {
    if (activeTab === 'videos' && v.isReel) return false;
    if (activeTab === 'reels' && !v.isReel) return false;
    if (search && !v.titleGu.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Video className="w-6 h-6 text-secondary" />
            <span>વીડિયો અને રીલ્સ વ્યવસ્થાપન (Video & Reels CMS)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            યૂટ્યુબ વીડિયો, વાયરલ શોર્ટ્સ, ફેસબુક/ઇન્સ્ટા ક્લિપ્સ અને ડાયરેક્ટ વિડિયોઝનું સંચાલન
          </p>
        </div>

        <Link
          href="/admin/videos/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-colors w-fit"
        >
          <Plus className="w-4 h-4 text-accent-gold" />
          <span>નવો વીડિયો / રીલ ઉમેરો</span>
        </Link>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            તમામ વિડિયો ({videos.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'videos'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            લાંબા વીડિયો ({videos.filter((v) => !v.isReel).length})
          </button>
          <button
            onClick={() => setActiveTab('reels')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'reels'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            વાયરલ રીલ્સ ({videos.filter((v) => v.isReel).length})
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="વીડિયો શીર્ષક શોધો..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Video Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">વીડિયો</th>
                <th className="py-3 px-4">સ્ત્રોત (Source)</th>
                <th className="py-3 px-4">કેટેગરી</th>
                <th className="py-3 px-4">સમયગાળો</th>
                <th className="py-3 px-4">પ્રકાર</th>
                <th className="py-3 px-4">વ્યૂઝ</th>
                <th className="py-3 px-4 text-right">ક્રિયા</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((vid) => (
                <tr key={vid.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <div className="relative w-16 h-10 rounded-md overflow-hidden bg-gray-900 shrink-0">
                      <img
                        src={vid.thumbnailUrl || 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 max-w-md">
                      <h4 className="font-bold text-gray-900 text-xs truncate">
                        {vid.titleGu}
                      </h4>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">{vid.title}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-primary text-[11px]">
                    {vid.videoSource}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-bold">
                      {vid.category?.nameGu || 'સામાન્ય'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-gray-600">
                    {vid.duration || '0:30'}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        vid.isReel ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {vid.isReel ? 'Reel (9:16)' : 'Video (16:9)'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold">
                    {vid.viewsCount || 0}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(vid.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="કાઢી નાખો"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
