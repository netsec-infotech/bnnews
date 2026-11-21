'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Layers, Image as ImageIcon, Check } from 'lucide-react';
import { Advertiser, AdPlacement } from '../../../../lib/types';
import api from '../../../../lib/api';

export default function CreateAdCampaignPage() {
  const router = useRouter();

  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [advertiserId, setAdvertiserId] = useState('');
  const [budget, setBudget] = useState('25000');
  const [agreedPrice, setAgreedPrice] = useState('20000');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [adType, setAdType] = useState('BANNER');

  // Creative State
  const [creativeName, setCreativeName] = useState('');
  const [desktopCreative, setDesktopCreative] = useState('');
  const [mobileCreative, setMobileCreative] = useState('');
  const [landingPageUrl, setLandingPageUrl] = useState('https://');
  const [altText, setAltText] = useState('');

  // Multi-select Placements
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>([]);
  const [placementSearch, setPlacementSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/admin/advertisers').catch(() => ({ data: { data: [] } })),
      api.get('/admin/ads/placements').catch(() => ({ data: { data: [] } })),
    ]).then(([advRes, plRes]) => {
      if (advRes.data?.data) {
        setAdvertisers(advRes.data.data);
        if (advRes.data.data.length > 0) setAdvertiserId(advRes.data.data[0].id);
      }
      if (plRes.data?.data) {
        setPlacements(plRes.data.data);
      }
      setLoading(false);
    });
  }, []);

  const togglePlacement = (id: string) => {
    if (selectedPlacements.includes(id)) {
      setSelectedPlacements(selectedPlacements.filter((p) => p !== id));
    } else {
      setSelectedPlacements([...selectedPlacements, id]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !advertiserId || !desktopCreative) {
      alert('કૃપા કરીને કેમ્પેઇન નામ, જાહેરાતકર્તા અને ડેસ્કટોપ ક્રિએટિવ URL દાખલ કરો.');
      return;
    }

    try {
      await api.post('/admin/ads/campaigns', {
        name,
        advertiserId,
        budget,
        agreedPrice,
        startDate,
        endDate,
        status: 'ACTIVE',
        targetDevices: ['DESKTOP', 'MOBILE'],
        creatives: [
          {
            name: creativeName || name,
            adType,
            desktopCreative,
            mobileCreative: mobileCreative || desktopCreative,
            landingPageUrl,
            altText,
          },
        ],
        placementIds: selectedPlacements,
      });

      alert('જાહેરાત કેમ્પેઇન સફળતાપૂર્વક સક્રિય કરવામાં આવ્યું છે!');
      router.push('/admin/ads');
    } catch (err: any) {
      alert(err.response?.data?.message || 'કેમ્પેઇન સાચવવામાં નિષ્ફળતા.');
    }
  };

  // Group placements by pageGroup
  const filteredPlacements = placements.filter(
    (p) =>
      p.name.toLowerCase().includes(placementSearch.toLowerCase()) ||
      p.identifier.toLowerCase().includes(placementSearch.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-gujarati text-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/ads"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900">
              નવી જાહેરાત ઉમેરો (Add Advertisement Campaign)
            </h1>
            <p className="text-xs text-gray-500">
              ક્લાયન્ટ કેમ્પેઇન, મલ્ટિ-પ્લેસમેન્ટ્સ અને ક્રિએટિવ સેટિંગ્સ
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Step 1: Basic Campaign Info */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            ૧. કેમ્પેઇન અને ક્લાયન્ટ વિગતો (Campaign Details)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">કેમ્પેઇનનું નામ *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="દા.ત. દિવાળી મેગા ઓફર્સ ૨૦૨૬"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">જાહેરાતકર્તા (Advertiser / Client) *</label>
              <select
                value={advertiserId}
                onChange={(e) => setAdvertiserId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-white"
              >
                {advertisers.map((adv) => (
                  <option key={adv.id} value={adv.id}>
                    {adv.companyName} ({adv.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">કુલ બજેટ (₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">મંજૂર ભાવ / એગ્રીડ પ્રાઇસ (₹) *</label>
              <input
                type="number"
                required
                value={agreedPrice}
                onChange={(e) => setAgreedPrice(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">શરૂઆત તારીખ *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">સમાપ્તિ તારીખ *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Creative Details */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-2">
            ૨. ક્રિએટિવ અને મીડિયા સેટિંગ્સ (Creative Assets)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-gray-700 mb-1">જાહેરાત પ્રકાર (Ad Type)</label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary bg-white"
              >
                <option value="BANNER">બેનર જાહેરાત (Banner)</option>
                <option value="SIDEBAR">સાઇડબાર જાહેરાત (Sidebar)</option>
                <option value="IN_ARTICLE">ઇન-આર્ટિકલ જાહેરાત (In-Article)</option>
                <option value="POPUP">પોપઅપ જાહેરાત (Popup)</option>
                <option value="STICKY">સ્ટીકી બોટમ બેનર (Sticky)</option>
                <option value="VIDEO_AD">વીડિયો જાહેરાત (Video Ad)</option>
                <option value="SPONSORED_NEWS">સ્પોન્સર્ડ ન્યૂઝ (Sponsored News)</option>
                <option value="MOBILE">મોબાઇલ સ્પેશિયલ (Mobile Ad)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">લેન્ડિંગ પેજ URL (Destination Link) *</label>
              <input
                type="url"
                required
                value={landingPageUrl}
                onChange={(e) => setLandingPageUrl(e.target.value)}
                placeholder="https://clientwebsite.com/offer"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">ડેસ્કટોપ ક્રિએટિવ Image URL *</label>
              <input
                type="url"
                required
                value={desktopCreative}
                onChange={(e) => setDesktopCreative(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">મોબાઇલ ક્રિએટિવ Image URL (વૈકલ્પિક)</label>
              <input
                type="url"
                value={mobileCreative}
                onChange={(e) => setMobileCreative(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono text-[11px]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-gray-700 mb-1">Alt Text / શીર્ષક</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="દા.ત. રિલાયન્સ ડિજિટલ ફેસ્ટિવલ સેલ"
                className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Multi-Select Placement Selector */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-secondary" />
                <span>Display Advertisement At (પ્લેસમેન્ટ પસંદ કરો)</span>
              </h2>
              <p className="text-xs text-gray-500">
                એક કેમ્પેઇન એક સાથે વિવિધ પેજ અને પોઝિશન પર પ્રદર્શિત કરી શકાય છે
              </p>
            </div>

            <input
              type="text"
              value={placementSearch}
              onChange={(e) => setPlacementSearch(e.target.value)}
              placeholder="પ્લેસમેન્ટ શોધો..."
              className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-primary max-w-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-72 overflow-y-auto p-1">
            {filteredPlacements.map((pl) => {
              const selected = selectedPlacements.includes(pl.id);
              return (
                <div
                  key={pl.id}
                  onClick={() => togglePlacement(pl.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start justify-between gap-2 text-xs ${
                    selected
                      ? 'border-primary bg-primary/5 text-primary font-bold shadow-2xs'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                  }`}
                >
                  <div>
                    <p className="leading-snug">{pl.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">
                      {pl.pageGroup} • {pl.desktopDimensions || 'Responsive'}
                    </p>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                      selected ? 'bg-primary border-primary text-white' : 'border-gray-300'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 text-xs text-gray-500">
            પસંદ કરેલ પ્લેસમેન્ટ્સ સંખ્યા: <strong>{selectedPlacements.length}</strong>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/ads"
            className="px-5 py-2.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold text-xs transition-colors"
          >
            રદ કરો
          </Link>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs transition-colors shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-accent-gold" />
            <span>કેમ્પેઇન સાચવો અને સક્રિય કરો</span>
          </button>
        </div>
      </form>
    </div>
  );
}
