'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Image as ImageIcon, Film, X, Search, Check, Link as LinkIcon, FolderOpen, Loader2 } from 'lucide-react';
import api from '../../lib/api';
import { getMediaUrl } from '../../lib/media';
import { MediaItem } from '../../lib/types';

interface MediaUploadPickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  acceptType?: 'image' | 'video' | 'all';
  placeholder?: string;
  helperText?: string;
  required?: boolean;
  folder?: string;
}

export default function MediaUploadPicker({
  label,
  value,
  onChange,
  acceptType = 'all',
  placeholder = 'અપલોડ કરો અથવા પસંદ કરો',
  helperText,
  required = false,
}: MediaUploadPickerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showManualUrl, setShowManualUrl] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>(
    acceptType === 'all' ? 'all' : acceptType
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isVideo =
    value?.toLowerCase().endsWith('.mp4') ||
    value?.toLowerCase().endsWith('.webm') ||
    value?.toLowerCase().endsWith('.mov') ||
    value?.includes('/videos/');

  const loadMedia = () => {
    setLoadingMedia(true);
    const typeParam = filterType === 'all' ? '' : `&type=${filterType}`;
    api
      .get(`/admin/media?search=${encodeURIComponent(search)}${typeParam}&limit=40`)
      .then((res) => {
        if (res.data?.success) {
          setMediaList(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load media list:', err))
      .finally(() => setLoadingMedia(false));
  };

  useEffect(() => {
    if (isModalOpen) {
      loadMedia();
    }
  }, [isModalOpen, search, filterType]);

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

      if (res.data?.success && res.data.data?.url) {
        onChange(res.data.data.url);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'અપલોડ નિષ્ફળ થયું. કૃપા કરીને ફરી પ્રયાસ કરો.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const fileAcceptAttr =
    acceptType === 'image'
      ? 'image/jpeg,image/png,image/webp,image/gif'
      : acceptType === 'video'
      ? 'video/mp4,video/webm,video/quicktime,video/mkv'
      : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime';

  return (
    <div className="space-y-2 font-gujarati">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{showManualUrl ? 'અપલોડ મોડ' : 'URL લિંક મોડ'}</span>
        </button>
      </div>

      {showManualUrl ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://... અથવા /uploads/..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:border-primary"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 border border-gray-300 rounded-xl hover:bg-gray-100 text-gray-500"
              title="સાફ કરો"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Current Selection / Preview Box */}
          {value ? (
            <div className="relative rounded-xl border border-gray-200 bg-gray-50 p-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-36 h-24 rounded-lg overflow-hidden bg-black/10 flex items-center justify-center shrink-0 border border-gray-300">
                {isVideo ? (
                  <video
                    src={getMediaUrl(value)}
                    controls
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <img
                    src={getMediaUrl(value)}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 w-full text-left space-y-1">
                <div className="flex items-center gap-1.5">
                  {isVideo ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 flex items-center gap-1">
                      <Film className="w-3 h-3" /> વીડિયો
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> ઇમેજ
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-800 truncate">
                    {value.split('/').pop()}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 truncate font-mono">{value}</p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <Upload className="w-3 h-3" />
                    <span>નવું અપલોડ</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>લાઇબ્રેરીમાંથી બદલો</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => onChange('')}
                    className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    <span>દૂર કરો</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Upload Action Buttons */
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : acceptType === 'video' ? (
                  <Film className="w-4 h-4 text-secondary" />
                ) : (
                  <Upload className="w-4 h-4 text-secondary" />
                )}
                <span>
                  {uploading
                    ? 'અપલોડ થઈ રહ્યું છે...'
                    : acceptType === 'video'
                    ? 'નવો વીડિયો અપલોડ કરો'
                    : 'નવી ફાઇલ અપલોડ કરો'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all shadow-2xs"
              >
                <FolderOpen className="w-4 h-4 text-secondary" />
                <span>લાઇબ્રેરીમાંથી પસંદ કરો (Select from List)</span>
              </button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={fileAcceptAttr}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {helperText && <p className="text-[11px] text-gray-400">{helperText}</p>}

      {/* Media Library Picker Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden font-gujarati animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50/80">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    અપલોડ કરેલી મીડિયા યાદી (Uploaded Media Library)
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    તમારા સર્વર પર સંગ્રહિત ફાઇલ પસંદ કરો અથવા સીધી નવી અપલોડ કરો
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Controls: Search, Tabs & Direct Upload */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ફાઇલના નામથી શોધો..."
                    className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Type Filter Tabs */}
              {acceptType === 'all' && (
                <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      filterType === 'all' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'
                    }`}
                  >
                    બધા
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('image')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      filterType === 'image' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'
                    }`}
                  >
                    ઇમેજ
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterType('video')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      filterType === 'video' ? 'bg-white shadow-xs text-primary' : 'text-gray-600'
                    }`}
                  >
                    વીડિયો
                  </button>
                </div>
              )}

              {/* Upload within modal */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-secondary text-white rounded-lg text-xs font-bold hover:bg-orange-600 transition-all shadow-xs"
              >
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>નવી ફાઇલ અપલોડ કરો</span>
              </button>
            </div>

            {/* Media Items Grid */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-[300px] max-h-[55vh]">
              {loadingMedia ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs">મીડિયા લોડ થઈ રહ્યું છે...</p>
                </div>
              ) : mediaList.length === 0 ? (
                <div className="text-center py-16 text-gray-400 space-y-2">
                  <FolderOpen className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                  <p className="text-sm font-semibold">કોઈ મીડિયા મળ્યું નથી</p>
                  <p className="text-xs text-gray-400">
                    નવી ફાઇલ અપલોડ કરવા માટે ઉપરના બટન પર ક્લિક કરો.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {mediaList.map((item) => {
                    const itemIsVideo = item.mimeType?.startsWith('video/');
                    const isSelected = value === item.url;

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onChange(item.url);
                          setIsModalOpen(false);
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-[1.02] shadow-2xs ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/30 shadow-md'
                            : 'border-gray-200 hover:border-primary/60'
                        }`}
                      >
                        <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative">
                          {itemIsVideo ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white p-2">
                              <Film className="w-8 h-8 text-secondary mb-1" />
                              <span className="text-[10px] text-gray-300 truncate max-w-full">
                                {item.originalName}
                              </span>
                            </div>
                          ) : (
                            <img
                              src={getMediaUrl(item.thumbnailUrl || item.url)}
                              alt={item.altText || item.originalName}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          )}

                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded">
                            {itemIsVideo ? 'VIDEO' : 'IMAGE'}
                          </div>
                        </div>

                        <div className="p-2 bg-white text-left">
                          <p className="text-[11px] font-bold text-gray-800 truncate">
                            {item.originalName}
                          </p>
                          <p className="text-[9px] text-gray-400">
                            {(item.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
              <span>કુલ {mediaList.length} મીડિયા ફાઇલો</span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-bold transition-colors"
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
