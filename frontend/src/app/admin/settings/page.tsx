'use client';

import React, { useEffect, useState } from 'react';
import { Settings, Save, Check } from 'lucide-react';
import api from '../../../lib/api';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    site_title: 'BN NEWS ગુજરાતી',
    site_tagline: 'તમારા વિસ્તારની, તમારા ભાષામાં...',
    site_description: '',
    contact_email: 'editor@bnnews.in',
    contact_phone: '+91 79 2658 0000',
    contact_address: 'BN મીડિયા સેન્ટર, અમદાવાદ',
    live_tv_enabled: 'true',
    live_tv_url: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: '',
    instagram_url: '',
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api
      .get('/admin/settings')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const map: Record<string, string> = {};
          res.data.data.forEach((s: any) => {
            map[s.key] = s.value;
          });
          setSettings((prev) => ({ ...prev, ...map }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, val: string) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    try {
      await api.post('/admin/settings', settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'સેટિંગ્સ સાચવી શકાયા નહીં');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6 font-gujarati">
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>વેબસાઇટ સેટિંગ્સ (Website Settings)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            બ્રાન્ડિંગ, સંપર્ક વિગતો, સોશિયલ મીડિયા અને Live TV સ્ટ્રીમ કન્ફિગરેશન
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold">
            <Check className="w-3.5 h-3.5" />
            <span>સેટિંગ્સ સાચવવામાં આવ્યા!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Branding */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-primary border-b pb-1">બ્રાન્ડિંગ અને ટાઇટલ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">વેબસાઇટ શીર્ષક (Brand Title)</label>
              <input
                type="text"
                value={settings.site_title || ''}
                onChange={(e) => handleChange('site_title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">બ્રાન્ડ ટેગલાઇન (Tagline)</label>
              <input
                type="text"
                value={settings.site_tagline || ''}
                onChange={(e) => handleChange('site_tagline', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>
        </div>

        {/* Live TV */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-primary border-b pb-1">Live TV સ્ટ્રીમિંગ</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Live TV Embed URL (YouTube Stream / HLS)</label>
              <input
                type="text"
                value={settings.live_tv_url || ''}
                onChange={(e) => handleChange('live_tv_url', e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Live TV સુવિધા</label>
              <select
                value={settings.live_tv_enabled || 'true'}
                onChange={(e) => handleChange('live_tv_enabled', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              >
                <option value="true">સક્રિય (Enabled)</option>
                <option value="false">નિષ્ક્રિય (Disabled)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-primary border-b pb-1">સંપર્ક વિગતો</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">સંપાદકીય ઈમેલ</label>
              <input
                type="email"
                value={settings.contact_email || ''}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">ફોન નંબર</label>
              <input
                type="text"
                value={settings.contact_phone || ''}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-primary border-b pb-1">સોશિયલ મીડિયા લિંક્સ</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={settings.facebook_url || ''}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Twitter (X) URL</label>
              <input
                type="url"
                value={settings.twitter_url || ''}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                value={settings.youtube_url || ''}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-1">Instagram URL</label>
              <input
                type="url"
                value={settings.instagram_url || ''}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 shadow-sm text-xs"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>સેટિંગ્સ સાચવો (Save Settings)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
