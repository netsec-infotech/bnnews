'use client';

import React, { useEffect, useState } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Check,
  Search,
  Film,
  Loader2,
  Eye,
  X,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { MediaItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function MediaLibraryAdminPage() {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Error/Success messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected media for detail modal
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const loadMedia = () => {
    setLoading(true);
    const typeParam = typeFilter === 'all' ? '' : `&type=${typeFilter}`;
    api
      .get(`/admin/media?search=${encodeURIComponent(search)}${typeParam}&limit=100`)
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
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.post('/admin/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setSuccessMessage('ફાઇલ સફળતાપૂર્વક અપલોડ થઈ ગઈ!');
        loadMedia();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'અપલોડ નિષ્ફળ');
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
    if (!confirm('શું તમે ખરેખર આ મીડિયા ફાઇલ કાઢી નાખવા માંગો છો?')) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await api.delete(`/admin/media/${id}`);
      if (res.data?.success) {
        setSuccessMessage('મીડિયા ફાઇલ સફળતાપૂર્વક કાઢી નાખવામાં આવી.');
        if (selectedMedia?.id === id) setSelectedMedia(null);
        loadMedia();
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err: any) {
      // Backend safe check returns 400 if media is in use
      setErrorMessage(err.response?.data?.message || 'આ ફાઇલ ઉપયોગમાં હોવાથી કાઢી શકાતી નથી.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      {/* Top Header */}
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

      {/* Alerts */}
      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)}>
            <X className="w-4 h-4 text-green-400" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ફાઇલના નામથી શોધો..."
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

                <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5 text-white text-[10px]">
                  <p className="truncate font-bold">{item.originalName}</p>
                  <p className="text-[9px] text-gray-300">
                    {(item.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => setSelectedMedia(item)}
                      className="p-1.5 bg-white/20 hover:bg-white/40 rounded text-white"
                      title="વિગતો જુઓ (View Details)"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

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
                      title="કાઢી નાખો (Delete)"
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

      {/* Media Details Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-gray-900 truncate pr-4">
                મીડિયા વિગતો: {selectedMedia.originalName}
              </h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-xl overflow-hidden bg-gray-100 max-h-64 flex items-center justify-center">
              {selectedMedia.mimeType?.startsWith('video/') ? (
                <video src={selectedMedia.url} controls className="max-h-64 w-full" />
              ) : (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.originalName}
                  className="max-h-64 object-contain mx-auto"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-3 rounded-xl border">
              <div>
                <span className="text-gray-500 block">ફાઇલ પ્રકાર:</span>
                <span className="font-mono font-semibold">{selectedMedia.mimeType}</span>
              </div>
              <div>
                <span className="text-gray-500 block">ફાઇલ સાઇઝ:</span>
                <span className="font-semibold">
                  {(selectedMedia.size / (1024 * 1024)).toFixed(2)} MB ({selectedMedia.size} bytes)
                </span>
              </div>
              {selectedMedia.width && selectedMedia.height && (
                <div>
                  <span className="text-gray-500 block">પરિમાણ (Dimensions):</span>
                  <span className="font-semibold">
                    {selectedMedia.width} x {selectedMedia.height} px
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-500 block">અપલોડ તારીખ:</span>
                <span className="font-semibold">
                  {new Date(selectedMedia.createdAt).toLocaleDateString('gu-IN')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">ફાઇલ URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={selectedMedia.url}
                  className="w-full text-xs font-mono px-3 py-1.5 border rounded-lg bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => copyUrl(selectedMedia.id, selectedMedia.url)}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark whitespace-nowrap flex items-center gap-1"
                >
                  {copiedId === selectedMedia.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === selectedMedia.id ? 'કોપી થયું' : 'URL કોપી'}</span>
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t">
              <button
                type="button"
                onClick={() => handleDelete(selectedMedia.id)}
                className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ફાઇલ કાઢી નાખો (Delete)</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="px-4 py-1.5 bg-gray-200 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-300"
              >
                બંધ કરો
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
