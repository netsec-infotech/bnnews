'use client';

import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Upload, Trash2, Copy, Check, Search, Film, Loader2 } from 'lucide-react';
import { MediaItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function MediaLibraryAdminPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadMedia = () => {
    setLoading(true);
    const typeParam = typeFilter === 'all' ? '' : `&type=${typeFilter}`;
    api
      .get(`/admin/media?search=${encodeURIComponent(search)}${typeParam}&limit=50`)
      .then((res) => {
        if (res.data?.success) setMediaList(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMedia();
  }, [search, typeFilter]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        loadMedia();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'અપલોડ નિષ્ફળ');
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (id: string, url: string) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે આ મીડિયા ફાઇલ કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/media/${id}`);
      loadMedia();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાતી નથી');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-secondary" />
            <span>મીડિયા લાઇબ્રેરી (Media Library)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            છબીઓ અને વીડિયો સીધા અપલોડ કરો, સંગ્રહિત મીડિયા મેનેજ કરો
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shadow-sm w-fit disabled:opacity-50">
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <Upload className="w-4 h-4 text-secondary" />
          )}
          <span>{uploading ? 'અપલોડ થઈ રહ્યું છે...' : 'નવી ફાઇલ (Image/Video) અપલોડ કરો'}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="મીડિયા ફાઇલ શોધો..."
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-bold">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded-md transition-all ${
              typeFilter === 'all' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'
            }`}
          >
            બધા ({mediaList.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('image')}
            className={`px-3 py-1 rounded-md transition-all ${
              typeFilter === 'image' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'
            }`}
          >
            ઇમેજ
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('video')}
            className={`px-3 py-1 rounded-md transition-all ${
              typeFilter === 'video' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'
            }`}
          >
            વીડિયો
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="aspect-square bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : mediaList.length === 0 ? (
        <p className="py-12 text-center text-xs text-neutral-muted">
          લાઇબ્રેરીમાં કોઈ મીડિયા ફાઇલ નથી.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {mediaList.map((item) => {
            const isVideo = item.mimeType?.startsWith('video/');

            return (
              <div
                key={item.id}
                className="group relative bg-gray-50 rounded-xl overflow-hidden border border-gray-200 aspect-square flex flex-col justify-between shadow-2xs hover:shadow-md transition-all"
              >
                {isVideo ? (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-2 text-white">
                    <Film className="w-10 h-10 text-secondary mb-1" />
                    <span className="text-[10px] text-gray-300 truncate max-w-full text-center">
                      {item.originalName}
                    </span>
                  </div>
                ) : (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                <div className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                  {isVideo ? 'VIDEO' : 'IMAGE'}
                </div>

                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 text-white text-[10px]">
                  <p className="truncate font-bold">{item.originalName}</p>
                  <p className="text-[9px] text-gray-300">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => copyUrl(item.id, item.url)}
                      className="px-2 py-1 bg-white/20 hover:bg-white/40 rounded flex items-center gap-1 font-bold"
                      title="URL કોપી કરો"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3 h-3 text-emerald-300" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === item.id ? 'કોપી થયું' : 'URL'}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded text-white"
                      title="કાઢી નાખો"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
