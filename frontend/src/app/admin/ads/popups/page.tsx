'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Plus, Trash2, ArrowLeft, ExternalLink, Clock, ShieldAlert } from 'lucide-react';
import { AdPopup, AdCampaign } from '../../../../lib/types';
import api from '../../../../lib/api';

export default function AdPopupsPage() {
  const [popups, setPopups] = useState<AdPopup[]>([]);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [campaignId, setCampaignId] = useState('');
  const [heading, setHeading] = useState('');
  const [headingGu, setHeadingGu] = useState('');
  const [descriptionGu, setDescriptionGu] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [ctaButton, setCtaButton] = useState('વધુ વિગતો જુઓ');
  const [delaySeconds, setDelaySeconds] = useState(3);
  const [frequencyCap, setFrequencyCap] = useState('ONCE_PER_SESSION');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/ads/popups').catch(() => ({ data: { data: [] } })),
      api.get('/admin/ads/campaigns').catch(() => ({ data: { data: [] } })),
    ]).then(([popRes, campRes]) => {
      if (popRes.data?.data) setPopups(popRes.data.data);
      if (campRes.data?.data) {
        setCampaigns(campRes.data.data);
        if (campRes.data.data.length > 0) setCampaignId(campRes.data.data[0].id);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/ads/popups', {
        campaignId,
        heading: heading || headingGu,
        headingGu,
        descriptionGu,
        mediaUrl,
        destinationUrl,
        ctaButton,
        delaySeconds,
        frequencyCap,
      });
      setModalOpen(false);
      setHeading('');
      setHeadingGu('');
      setDescriptionGu('');
      setMediaUrl('');
      setDestinationUrl('');
      loadData();
    } catch {
      alert('પોપઅપ સાચવવામાં નિષ્ફળતા.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે આ પોપઅપ કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/ads/popups/${id}`);
      loadData();
    } catch {
      alert('કાઢી શકાયું નહીં.');
    }
  };

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
              <Sparkles className="w-6 h-6 text-amber-500" />
              <span>પોપઅપ જાહેરાત વ્યવસ્થાપન (Popup CMS)</span>
            </h1>
            <p className="text-xs text-gray-500">
              એન્ટ્રી પોપઅપ, ડીલે મોડલ, ફ્રિક્વન્સી કેપ અને ક્લિક લક્ષ્યીકરણ
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-colors w-fit"
        >
          <Plus className="w-4 h-4 text-accent-gold" />
          <span>નવું પોપઅપ ઉમેરો</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {popups.map((pop) => (
          <div
            key={pop.id}
            className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-44 bg-gray-900 overflow-hidden">
              <img
                src={pop.mediaUrl}
                alt={pop.heading}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                {pop.frequencyCap}
              </span>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="text-base font-bold text-gray-900">
                {pop.headingGu || pop.heading}
              </h3>
              {pop.descriptionGu && (
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {pop.descriptionGu}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                <span className="flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>ડીલે: {pop.delaySeconds} સેકન્ડ</span>
                </span>
                <span className="font-bold text-emerald-600">
                  {pop.currentImpressions} વ્યૂઝ
                </span>
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <a
                href={pop.destinationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <span>લિંક તપાસો</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleDelete(pop.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
              નવું પોપઅપ સેટિંગ્સ
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">સંબંધિત કેમ્પેઇન</label>
                <select
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-white"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">પોપઅપ હેડલાઇન (ગુજરાતી) *</label>
                <input
                  type="text"
                  required
                  value={headingGu}
                  onChange={(e) => setHeadingGu(e.target.value)}
                  placeholder="દા.ત. રિલાયન્સ ડિજિટલ મહા ઓફર"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ટૂંકી વિગત</label>
                <textarea
                  rows={2}
                  value={descriptionGu}
                  onChange={(e) => setDescriptionGu(e.target.value)}
                  placeholder="દા.ત. મર્યાદિત સમય માટે ૫૦% સુધીની છૂટ..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">મીડિયા Image URL *</label>
                  <input
                    type="url"
                    required
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">લક્ષ્ય URL (Landing) *</label>
                  <input
                    type="url"
                    required
                    value={destinationUrl}
                    onChange={(e) => setDestinationUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ડિસ્પ્લે ડીલે (સેકન્ડ)</label>
                  <input
                    type="number"
                    min={1}
                    value={delaySeconds}
                    onChange={(e) => setDelaySeconds(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ફ્રિક્વન્સી કેપ</label>
                  <select
                    value={frequencyCap}
                    onChange={(e) => setFrequencyCap(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-white"
                  >
                    <option value="ONCE_PER_SESSION">સત્ર દીઠ એકવાર (Once Per Session)</option>
                    <option value="ONCE_PER_DAY">દિવસ દીઠ એકવાર (Once Per Day)</option>
                    <option value="EVERY_PAGE">દરેક પેજ પર</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
