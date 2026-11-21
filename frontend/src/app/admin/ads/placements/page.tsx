'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, CheckCircle2, Monitor, Smartphone, Sparkles, Filter } from 'lucide-react';
import { AdPlacement } from '../../../../lib/types';
import api from '../../../../lib/api';

export default function AdPlacementsPage() {
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState('ALL');

  useEffect(() => {
    api
      .get('/admin/ads/placements')
      .then((res) => {
        if (res.data?.success) setPlacements(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const groups = ['ALL', 'HOMEPAGE', 'NEWS_DETAIL', 'CATEGORY', 'VIDEOS_REELS', 'LIVE_TV', 'POPUP_STICKY'];

  const filtered = activeGroup === 'ALL'
    ? placements
    : placements.filter((p) => p.pageGroup === activeGroup);

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/ads"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-secondary" />
              <span>જાહેરાત પ્લેસમેન્ટ સ્લોટ્સ (૩૦+ Positions)</span>
            </h1>
            <p className="text-xs text-gray-500">
              વેબસાઇટના તમામ પાનાઓ પર પૂર્વ-નિર્ધારિત સ્લોટ્સ, ડાયમેન્શન્સ અને રૂલ્સ
            </p>
          </div>
        </div>

        <Link
          href="/admin/ads/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-colors"
        >
          <span>આ સ્લોટ્સ પર જાહેરાત મૂકો</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2 text-xs">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeGroup === g
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {g === 'ALL'
              ? 'બધા સ્લોટ્સ (All 30+)'
              : g === 'HOMEPAGE'
              ? 'હોમપેજ'
              : g === 'NEWS_DETAIL'
              ? 'સમાચાર વિગતવાર'
              : g === 'CATEGORY'
              ? 'કેટેગરી પેજ'
              : g === 'VIDEOS_REELS'
              ? 'વીડિયો અને રીલ્સ'
              : g === 'LIVE_TV'
              ? 'લાઈવ ટીવી'
              : 'પોપઅપ અને સ્ટીકી'}
          </button>
        ))}
      </div>

      {/* Placements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((pl) => (
          <div
            key={pl.id}
            className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-cardHover transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1">
                <span className="uppercase tracking-wider">{pl.pageGroup}</span>
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>સક્રિય</span>
                </span>
              </div>
              <h3 className="text-sm font-bold text-gray-900 leading-snug">
                {pl.name}
              </h3>
              <p className="text-[11px] font-mono text-gray-500 mt-1">
                id: {pl.identifier}
              </p>
            </div>

            <div className="pt-2 border-t border-gray-100 space-y-1.5 text-[11px] text-gray-600">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-500">
                  <Monitor className="w-3.5 h-3.5 text-primary" />
                  <span>ડેસ્કટોપ સાઈઝ:</span>
                </span>
                <span className="font-mono font-bold text-gray-800">
                  {pl.desktopDimensions || 'Responsive'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-gray-500">
                  <Smartphone className="w-3.5 h-3.5 text-secondary" />
                  <span>મોબાઇલ સાઈઝ:</span>
                </span>
                <span className="font-mono font-bold text-gray-800">
                  {pl.mobileDimensions || 'Fluid'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                <span>મહત્તમ ફાઈલ સાઈઝ: {pl.maxFileSizeKb} KB</span>
                <span>ફોર્મેટ: JPG, PNG, GIF</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
