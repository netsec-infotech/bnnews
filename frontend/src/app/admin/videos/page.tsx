'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Video,
  Film,
  Plus,
  Trash2,
  Edit3,
  Play,
  Eye,
  Clock,
  Search,
  ExternalLink,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { VideoItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'videos' | 'reels'>('all');
  const [search, setSearch] = useState('');

  // Editing state
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [editForm, setEditForm] = useState({
    titleGu: '',
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: '0:30',
    videoSource: 'YOUTUBE',
    isReel: false,
    showOnHome: true,
    isFeatured: false,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const openEditModal = (vid: VideoItem) => {
    setEditingVideo(vid);
    setEditForm({
      titleGu: vid.titleGu || '',
      title: vid.title || '',
      description: vid.description || '',
      videoUrl: vid.videoUrl || '',
      thumbnailUrl: vid.thumbnailUrl || '',
      duration: vid.duration || '0:30',
      videoSource: vid.videoSource || 'YOUTUBE',
      isReel: Boolean(vid.isReel),
      showOnHome: vid.showOnHome !== false,
      isFeatured: Boolean(vid.isFeatured),
    });
    setEditSuccess(false);
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;
    if (!editForm.titleGu.trim()) {
      setEditError('ગુજરાતી શીર્ષક જરૂરી છે.');
      return;
    }

    setSavingEdit(true);
    setEditError(null);

    try {
      const payload = {
        titleGu: editForm.titleGu.trim(),
        title: editForm.title.trim() || editForm.titleGu.trim(),
        description: editForm.description.trim() || null,
        videoUrl: editForm.videoUrl.trim(),
        thumbnailUrl: editForm.thumbnailUrl.trim() || null,
        duration: editForm.duration.trim() || '0:30',
        videoSource: editForm.videoSource,
        isReel: editForm.isReel,
        showOnHome: editForm.showOnHome,
        isFeatured: editForm.isFeatured,
      };

      const res = await api.put(`/admin/videos/${editingVideo.id}`, payload);
      if (res.data?.success) {
        setVideos((prev) =>
          prev.map((v) => (v.id === editingVideo.id ? { ...v, ...res.data.data } : v))
        );
        setEditSuccess(true);
        setTimeout(() => {
          setEditingVideo(null);
          setEditSuccess(false);
        }, 1000);
      } else {
        setEditError(res.data?.message || 'સાચવવામાં નિષ્ફળતા.');
      }
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'વીડિયો સંપાદિત કરવામાં ક્ષતિ આવી.');
    } finally {
      setSavingEdit(false);
    }
  };

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
    if (search && !v.titleGu.toLowerCase().includes(search.toLowerCase()) && !(v.description || '').toLowerCase().includes(search.toLowerCase())) return false;
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
            યૂટ્યુબ વીડિયો, વાયરલ શોર્ટ્સ, શીર્ષક (Title) અને સબટાઈટલ (Subtitle) સંપાદન
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
            placeholder="શીર્ષક અથવા સબટાઈટલ શોધો..."
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
                <th className="py-3 px-4">વીડિયો & સબટાઈટલ (Title & Subtitle)</th>
                <th className="py-3 px-4">સ્ત્રોત (Source)</th>
                <th className="py-3 px-4">કેટેગરી</th>
                <th className="py-3 px-4">સમયગાળો</th>
                <th className="py-3 px-4">પ્રકાર</th>
                <th className="py-3 px-4">વ્યૂઝ</th>
                <th className="py-3 px-4 text-right">સંપાદન / ક્રિયા</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    કોઈ વીડિયો કે રીલ મળેલ નથી.
                  </td>
                </tr>
              ) : (
                filtered.map((vid) => (
                  <tr key={vid.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 flex items-start gap-3">
                      <div className="relative w-16 h-12 rounded-md overflow-hidden bg-gray-900 shrink-0 mt-0.5">
                        <img
                          src={
                            vid.thumbnailUrl ||
                            'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80'
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-3.5 h-3.5 text-white fill-white/80" />
                        </div>
                      </div>
                      <div className="min-w-0 max-w-md space-y-0.5">
                        <h4 className="font-bold text-gray-900 text-xs line-clamp-1">
                          {vid.titleGu}
                        </h4>
                        {vid.description ? (
                          <p className="text-[11px] text-gray-500 line-clamp-2">
                            <span className="font-semibold text-gray-700">સબટાઈટલ: </span>
                            {vid.description}
                          </p>
                        ) : (
                          <p className="text-[10px] text-gray-400 italic">સબટાઈટલ ખાલી છે</p>
                        )}
                        {vid.title && vid.title !== vid.titleGu && (
                          <p className="text-[10px] text-gray-400 truncate">{vid.title}</p>
                        )}
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
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(vid)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="શીર્ષક અને સબટાઈટલ સંપાદિત કરો (Edit Title & Subtitle)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(vid.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="કાઢી નાખો (Delete)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* EDIT MODAL: EDITABLE TITLE & SUBTITLE FOR VIDEO / REEL     */}
      {/* ========================================================= */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-8">
            {/* Modal Header */}
            <div className="bg-[#202A72] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-accent-gold" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    વીડિયો / રીલ સંપાદન (Edit Video & Reel)
                  </h3>
                  <p className="text-[11px] text-gray-200">
                    શીર્ષક (Title) અને સબટાઈટલ (Subtitle) સંપાદિત કરો
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingVideo(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              {editSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>વીડિયો શીર્ષક અને સબટાઈટલ સફળતાપૂર્વક અપડેટ થયા!</span>
                </div>
              )}

              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Gujarati Title */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  ગુજરાતી મુખ્ય શીર્ષક (Gujarati Title) *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.titleGu}
                  onChange={(e) => setEditForm({ ...editForm, titleGu: e.target.value })}
                  placeholder="મુખ્ય ગુજરાતી શીર્ષક લખો..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary text-sm font-bold"
                />
              </div>

              {/* Subtitle / Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-800">
                    સબટાઈટલ / ટૂંકી વિગત (Subtitle / Short Description)
                  </label>
                  <span className="text-[11px] text-gray-400">રીલ/વીડિયો હેઠળ પ્રદર્શિત થશે</span>
                </div>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="સબટાઈટલ અથવા સારાંશ લખો..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary text-xs leading-relaxed"
                />
              </div>

              {/* English Title (Optional) */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  અંગ્રેજી શીર્ષક (English Title - વૈકલ્પિક)
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="English title..."
                  className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary text-xs"
                />
              </div>

              {/* Video URL & Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    વિડિયો URL (Video URL)
                  </label>
                  <input
                    type="text"
                    value={editForm.videoUrl}
                    onChange={(e) => setEditForm({ ...editForm, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    સમયગાળો (Duration)
                  </label>
                  <input
                    type="text"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    placeholder="0:30 અથવા 2:15"
                    className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  થંબનેલ છબી URL (Thumbnail URL)
                </label>
                <input
                  type="text"
                  value={editForm.thumbnailUrl}
                  onChange={(e) => setEditForm({ ...editForm, thumbnailUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-xs"
                />
              </div>

              {/* Type and Display Toggles */}
              <div className="pt-3 border-t border-gray-100 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.isReel}
                    onChange={(e) => setEditForm({ ...editForm, isReel: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>વાયરલ રીલ (Vertical 9:16)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
                  <input
                    type="checkbox"
                    checked={editForm.showOnHome}
                    onChange={(e) => setEditForm({ ...editForm, showOnHome: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>હોમપેજ પર દર્શાવો</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold transition-colors"
                >
                  રદ કરો (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-md transition-colors disabled:opacity-60"
                >
                  {savingEdit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>સાચવી રહ્યું છે...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>સાચવો (Save Changes)</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
