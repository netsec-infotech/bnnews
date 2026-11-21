'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Megaphone,
  Plus,
  Users,
  Layers,
  Sparkles,
  BarChart2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  Search,
} from 'lucide-react';
import { AdCampaign } from '../../../lib/types';
import api from '../../../lib/api';

export default function AdminAdsDashboardPage() {
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadCampaigns = () => {
    setLoading(true);
    api
      .get('/admin/ads/campaigns')
      .then((res) => {
        if (res.data?.success) {
          setCampaigns(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે આ જાહેરાત કેમ્પેઇન કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/ads/campaigns/${id}`);
      loadCampaigns();
    } catch {
      alert('કેમ્પેઇન કાઢી શકાયું નહીં.');
    }
  };

  const filteredCampaigns = campaigns.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.advertiser?.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      {/* Header & Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-secondary" />
            <span>જાહેરાત વ્યવસ્થાપન CMS (Advertisement Management)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            થર્ડ-પાર્ટી જાહેરાતો, ક્લાયન્ટ્સ, મલ્ટિ-પ્લેસમેન્ટ્સ અને કેમ્પેઇન અહેવાલોનું સંચાલન
          </p>
        </div>

        <Link
          href="/admin/ads/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-colors w-fit"
        >
          <Plus className="w-4 h-4 text-accent-gold" />
          <span>નવી જાહેરાત ઉમેરો (Add Ad)</span>
        </Link>
      </div>

      {/* Sub-modules Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2">
        <Link
          href="/admin/ads"
          className="px-3.5 py-1.5 rounded-lg bg-primary text-white font-bold text-xs shadow-xs"
        >
          તમામ કેમ્પેઇન (All Ads)
        </Link>
        <Link
          href="/admin/ads/advertisers"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-primary" />
          <span>જાહેરાતકર્તાઓ / ક્લાયન્ટ્સ</span>
        </Link>
        <Link
          href="/admin/ads/placements"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-secondary" />
          <span>પ્લેસમેન્ટ સિલેક્ટર (૩૦+ જગ્યાઓ)</span>
        </Link>
        <Link
          href="/admin/ads/popups"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>પોપઅપ વ્યવસ્થાપન</span>
        </Link>
        <Link
          href="/admin/ads/reports"
          className="px-3.5 py-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <BarChart2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>રિપોર્ટિંગ અને ઇન્વોઇસ</span>
        </Link>
      </div>

      {/* Search Filter */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="કેમ્પેઇન અથવા ક્લાયન્ટનું નામ શોધો..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">કેમ્પેઇન નામ</th>
                <th className="py-3 px-4">જાહેરાતકર્તા (Advertiser)</th>
                <th className="py-3 px-4">બજેટ / ભાવ</th>
                <th className="py-3 px-4">પ્લેસમેન્ટ્સ</th>
                <th className="py-3 px-4">સમયગાળો</th>
                <th className="py-3 px-4">સ્થિતિ</th>
                <th className="py-3 px-4 text-right">ક્રિયાઓ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCampaigns.length > 0 ? (
                filteredCampaigns.map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900 text-sm">{camp.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {camp.creatives?.length || 0} ક્રિએટિવ્સ • {camp.targetDevices?.join(', ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">
                        {camp.advertiser?.companyName || 'Unknown'}
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {camp.advertiser?.phone}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-primary">
                      ₹{(camp.agreedPrice || camp.budget || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {camp.placements && camp.placements.length > 0 ? (
                          camp.placements.map((p, i) => (
                            <span
                              key={i}
                              className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded"
                            >
                              {p.placement?.name || 'પ્લેસમેન્ટ'}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-[10px]">સામાન્ય સ્લોટ</span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-gray-600 font-mono text-[11px] whitespace-nowrap">
                      {new Date(camp.startDate).toLocaleDateString('en-GB')} થી{' '}
                      {new Date(camp.endDate).toLocaleDateString('en-GB')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          camp.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        title="કાઢી નાખો"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    કોઈ જાહેરાત કેમ્પેઇન મળ્યા નથી.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
