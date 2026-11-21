'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Video, Film, Play } from 'lucide-react';
import api from '../../../../lib/api';
import MediaUploadPicker from '../../../../components/common/MediaUploadPicker';

export default function CreateVideoPage() {
  const router = useRouter();

  const [titleGu, setTitleGu] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoSource, setVideoSource] = useState('YOUTUBE');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('0:30');
  const [isReel, setIsReel] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [showOnHome, setShowOnHome] = useState(true);
  const [showOnVideos, setShowOnVideos] = useState(true);
  const [showOnReels, setShowOnReels] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleGu || !videoUrl) {
      alert('કૃપા કરીને ગુજરાતી શીર્ષક અને વિડિયો URL દાખલ કરો.');
      return;
    }

    try {
      await api.post('/admin/videos', {
        title: title || titleGu,
        titleGu,
        description,
        videoSource,
        videoUrl,
        thumbnailUrl,
        duration,
        isReel,
        isFeatured,
        showOnHome,
        showOnVideos,
        showOnReels: isReel ? true : showOnReels,
      });

      alert('વીડિયો સફળતાપૂર્વક સાચવવામાં આવ્યો!');
      router.push('/admin/videos');
    } catch {
      alert('વીડિયો સાચવવામાં નિષ્ફળતા.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-gujarati text-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/videos"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              નવો વીડિયો / રીલ ઉમેરો (Add Video or Reel)
            </h1>
            <p className="text-xs text-gray-500">
              યુટ્યુબ, સોશિયલ પ્લેટફોર્મ્સ અથવા ડાયરેક્ટ વીડિયો લિંક્સ
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4 text-xs">
          <div>
            <label className="block font-bold text-gray-700 mb-1">ગુજરાતી શીર્ષક (Gujarati Title) *</label>
            <input
              type="text"
              required
              value={titleGu}
              onChange={(e) => setTitleGu(e.target.value)}
              placeholder="દા.ત. અમદાવાદ મેટ્રો ફેઝ-૨ માત્ર ૬૦ સેકન્ડમાં જુઓ ભવ્ય નજારો!"
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary text-sm font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">વિડિયો સ્ત્રોત (Source)</label>
              <select
                value={videoSource}
                onChange={(e) => setVideoSource(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-white"
              >
                <option value="YOUTUBE">YouTube Video / Shorts</option>
                <option value="INSTAGRAM">Instagram Reel / Post</option>
                <option value="FACEBOOK">Facebook Watch</option>
                <option value="DIRECT_UPLOAD">Direct MP4 / WebM Link</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">સમયગાળો (Duration)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="0:30 અથવા 12:45"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono"
              />
            </div>
          </div>

          <div>
            <MediaUploadPicker
              label="વીડિયો ફાઇલ (Video File Upload / Select)"
              value={videoUrl}
              onChange={setVideoUrl}
              acceptType="video"
              required
              helperText="સીધો MP4/WebM વીડિયો અપલોડ કરો, લાઇબ્રેરીમાંથી પસંદ કરો અથવા URL લિંક મોડથી YouTube/Instagram લિંક વાપરો."
            />
          </div>

          <div>
            <MediaUploadPicker
              label="વીડિયો થંબનેલ છબી (Video Thumbnail)"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              acceptType="image"
              helperText="વીડિયો માટે કસ્ટમ કવર ઇમેજ અપલોડ કરો અથવા પસંદ કરો."
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">ટૂંકી વિગત (Description)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="વીડિયો વિશે ટૂંકી માહિતી..."
              className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Checkbox Options */}
          <div className="pt-2 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isReel}
                onChange={(e) => setIsReel(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              <span>વાયરલ રીલ (Vertical 9:16)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              <span>ફીચર્ડ વીડિયો (ટોચ પર)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700">
              <input
                type="checkbox"
                checked={showOnHome}
                onChange={(e) => setShowOnHome(e.target.checked)}
                className="w-4 h-4 rounded text-primary"
              />
              <span>હોમપેજ પર દર્શાવો</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/videos"
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs"
          >
            રદ કરો
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-accent-gold" />
            <span>વીડિયો પ્રકાશિત કરો</span>
          </button>
        </div>
      </form>
    </div>
  );
}
