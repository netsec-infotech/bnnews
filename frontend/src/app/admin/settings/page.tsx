'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Check,
  Globe,
  Sliders,
  Share2,
  Search,
  FileText,
  PhoneCall,
  Image as ImageIcon,
  CheckCircle,
  Sparkles,
  Key,
} from 'lucide-react';
import api from '../../../lib/api';
import MediaUploadPicker from '../../../components/common/MediaUploadPicker';

export default function SettingsAdminPage() {
  const [activeTab, setActiveTab] = useState<
    'general' | 'branding' | 'homepage' | 'social' | 'seo' | 'about' | 'contact' | 'ai'
  >('general');

  const [settings, setSettings] = useState<Record<string, string>>({
    // General
    site_title: 'BN NEWS ગુજરાતી',
    site_tagline: 'તમારા વિસ્તારની, તમારા ભાષામાં...',
    site_description: 'ગુજરાતના દરેક ખૂણેથી વિશ્વસનીય અને ઝડપી ગુજરાતી સમાચાર',
    footer_copyright: '© 2026 BN NEWS GUJARATI. All Rights Reserved.',

    // Branding
    site_logo: '',
    site_favicon: '',

    // Homepage
    home_latest_news_count: '10',
    home_video_news_count: '4',
    home_reels_count: '6',
    home_show_breaking: 'true',
    home_show_trending: 'true',
    home_show_videos: 'true',
    home_show_reels: 'true',

    // Live TV
    live_tv_enabled: 'true',
    live_tv_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',

    // Social
    facebook_url: 'https://facebook.com/bnnewsgujarati',
    twitter_url: 'https://x.com/bnnewsgujarati',
    youtube_url: 'https://youtube.com/@bnnewsgujarati',
    instagram_url: 'https://instagram.com/bnnewsgujarati',
    whatsapp_channel_url: 'https://whatsapp.com/channel/bnnews',
    telegram_url: 'https://t.me/bnnewsgujarati',

    // SEO
    seo_meta_title: 'BN NEWS ગુજરાતી | તાજા અને સચોટ સમાચાર',
    seo_meta_description: 'ગુજરાત, ભારત, વિશ્વ, રાજકારણ, વેપાર, ટેકનોલોજી અને રમતગમતના તાજા સમાચાર ગુજરાતીમાં વાંચો.',
    seo_keywords: 'ગુજરાતી સમાચાર, ગુજરાત ન્યૂઝ, બ્રેકિંગ ન્યૂઝ, અમદાવાદ સમાચાર, BN News Gujarati',
    seo_og_image: '',

    // About Us CMS
    about_title: 'BN NEWS ગુજરાતી વિશે (About BN News Gujarati)',
    about_subtitle: 'સત્ય, પારદર્શિતા અને લોકોનો અવાજ - અમારો સંકલ્પ',
    about_story:
      'BN NEWS ગુજરાતી એ ગુજરાતનું અગ્રણી અને ઝડપથી વિકસતું ડિજિટલ સમાચાર માધ્યમ છે. અમે રાજકારણ, સામાજિક મુદ્દાઓ, રમતગમત, મનોરંજન અને આંતરરાષ્ટ્રીય ઘટનાઓને નિષ્પક્ષ અને સચોટ દ્રષ્ટિકોણથી પ્રસ્તુત કરીએ છીએ.',
    about_vision:
      'ગુજરાતના નાગરિકોને સૌથી વિશ્વસનીય, ઝડપી અને સચોટ સમાચાર આપવા અને લોકશાહીના ચોથા સ્તંભ તરીકે લોકોના અવાજને વાચા આપવી.',
    about_mission:
      'તટસ્થ પત્રકારત્વના સિદ્ધાંતોનું પાલન કરવું, કોઈપણ દબાણ વગર સાચી હકીકતો લોકો સમક્ષ લાવવી અને ડિજિટલ યુગમાં સામાન્ય જનતા સાથે સીધો સંવાદ સ્થાપવો.',
    about_image: '',

    // Contact Us CMS
    contact_title: 'અમારો સંપર્ક કરો (Contact Us)',
    contact_subtitle: 'સમાચાર, પ્રેસ રીલીઝ, પ્રતિસાદ અથવા જાહેરાત માટે સંપર્ક કરો',
    contact_email: 'editor@bnnewsgujarati.com',
    contact_phone: '+91 90996 76267',
    contact_whatsapp: '+91 90996 76267',
    contact_address: '2nd Floor, Office No 207/1, Akshar Plaza Complex Padra, Padra, Gujarat 391440',
    contact_maps_url:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14777.625625477813!2d73.06941584348633!3d22.235955353597327!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc39396e053a1%3A0xe54955bce56feae4!2sPadra%2C%20Gujarat%20391440!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    contact_working_hours: 'સોમવાર - શનિવાર: સવારે 10:00 થી સાંજે 07:00 (સમાચાર ટીમ: 24x7)',
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

  const tabs = [
    { id: 'general', label: 'સામાન્ય (General)', icon: Settings },
    { id: 'branding', label: 'બ્રાન્ડિંગ (Branding)', icon: ImageIcon },
    { id: 'homepage', label: 'હોમપેજ કન્ફિગ (Homepage)', icon: Sliders },
    { id: 'social', label: 'સોશિયલ મીડિયા (Social)', icon: Share2 },
    { id: 'seo', label: 'SEO સેટિંગ્સ (SEO)', icon: Search },
    { id: 'ai', label: 'AI અને API કી (Gemini)', icon: Sparkles },
    { id: 'about', label: 'અમારા વિશે CMS (About)', icon: FileText },
    { id: 'contact', label: 'સંપર્ક CMS (Contact)', icon: PhoneCall },
  ];

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6 font-gujarati pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>વેબસાઇટ સેટિંગ્સ અને CMS (Website Settings & CMS)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            બ્રાન્ડિંગ, હોમપેજ લેઆઉટ, SEO, સોશિયલ મીડિયા, અબાઉટ પેજ અને સંપર્ક પૃષ્ઠનું સંપૂર્ણ સંચાલન
          </p>
        </div>

        {saved && (
          <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold shadow-xs">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા!</span>
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-gray-200 pb-2 scrollbar-none">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* TAB 1: GENERAL */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b pb-2">સામાન્ય વેબસાઇટ માહિતી</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">વેબસાઇટ શીર્ષક (Brand Title) *</label>
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

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">ટૂંકું સાઇટ વર્ણન (Site Description)</label>
                <textarea
                  rows={3}
                  value={settings.site_description || ''}
                  onChange={(e) => handleChange('site_description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">ફૂટર કૉપિરાઇટ ટેક્સ્ટ (Footer Copyright)</label>
                <input
                  type="text"
                  value={settings.footer_copyright || ''}
                  onChange={(e) => handleChange('footer_copyright', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BRANDING */}
        {activeTab === 'branding' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b pb-2">બ્રાન્ડિંગ અને લોગો મેનેજમેન્ટ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <MediaUploadPicker
                  label="વેબસાઇટ મુખ્ય લોગો (Header Logo)"
                  value={settings.site_logo || ''}
                  onChange={(val) => handleChange('site_logo', val)}
                  folder="branding"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <MediaUploadPicker
                  label="વેબસાઇટ ફેવિકોન (Favicon 32x32)"
                  value={settings.site_favicon || ''}
                  onChange={(val) => handleChange('site_favicon', val)}
                  folder="branding"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOMEPAGE */}
        {activeTab === 'homepage' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-primary border-b pb-2">હોમપેજ લેઆઉટ અને સમાચાર સંખ્યા</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  તાજા સમાચાર સંખ્યા (Latest News Count)
                </label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={settings.home_latest_news_count || '10'}
                  onChange={(e) => handleChange('home_latest_news_count', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">હોમપેજ પર બતાવવાના તાજા સમાચાર</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  વિડિયો સમાચાર સંખ્યા (Video News Count)
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={settings.home_video_news_count || '4'}
                  onChange={(e) => handleChange('home_video_news_count', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">હોમપેજ પર દર્શાવવાના મુખ્ય વીડિયો</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  શોર્ટ રીલ્સ સંખ્યા (Reels Count)
                </label>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={settings.home_reels_count || '6'}
                  onChange={(e) => handleChange('home_reels_count', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">હોમપેજ પર દર્શાવવાના 9:16 રીલ્સ</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <h4 className="font-bold text-gray-800">સેક્શન ડિસ્પ્લે કંટ્રોલ (Show / Hide)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border">
                  <input
                    type="checkbox"
                    checked={settings.home_show_breaking !== 'false'}
                    onChange={(e) => handleChange('home_show_breaking', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-semibold text-gray-700">બ્રેકિંગ ન્યૂઝ ટિકર</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border">
                  <input
                    type="checkbox"
                    checked={settings.home_show_trending !== 'false'}
                    onChange={(e) => handleChange('home_show_trending', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-semibold text-gray-700">ટ્રેન્ડિંગ લિસ્ટ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border">
                  <input
                    type="checkbox"
                    checked={settings.home_show_videos !== 'false'}
                    onChange={(e) => handleChange('home_show_videos', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-semibold text-gray-700">વિડિયો સમાચાર સેક્શન</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer bg-white p-2.5 rounded-lg border">
                  <input
                    type="checkbox"
                    checked={settings.home_show_reels !== 'false'}
                    onChange={(e) => handleChange('home_show_reels', e.target.checked ? 'true' : 'false')}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="font-semibold text-gray-700">વાયરલ રીલ્સ સેક્શન</span>
                </label>
              </div>
            </div>

            {/* Live TV Settings */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-gray-800">Live TV કન્ફિગરેશન</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Live TV Stream URL (YouTube / Embed)</label>
                  <input
                    type="text"
                    value={settings.live_tv_url || ''}
                    onChange={(e) => handleChange('live_tv_url', e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Live TV સક્રિયતા</label>
                  <select
                    value={settings.live_tv_enabled || 'true'}
                    onChange={(e) => handleChange('live_tv_enabled', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="true">સક્રિય (Live Stream On)</option>
                    <option value="false">નિષ્ક્રિય (Off)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL */}
        {activeTab === 'social' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b pb-2">સોશિયલ મીડિયા ચેનલો અને લિંક્સ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Facebook Page URL</label>
                <input
                  type="url"
                  value={settings.facebook_url || ''}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Twitter / X URL</label>
                <input
                  type="url"
                  value={settings.twitter_url || ''}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">YouTube Channel URL</label>
                <input
                  type="url"
                  value={settings.youtube_url || ''}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Instagram Profile URL</label>
                <input
                  type="url"
                  value={settings.instagram_url || ''}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">WhatsApp Channel / Group Link</label>
                <input
                  type="url"
                  value={settings.whatsapp_channel_url || ''}
                  onChange={(e) => handleChange('whatsapp_channel_url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Telegram Channel Link</label>
                <input
                  type="url"
                  value={settings.telegram_url || ''}
                  onChange={(e) => handleChange('telegram_url', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SEO */}
        {activeTab === 'seo' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b pb-2">ગ્લોબલ સર્ચ એન્જિન ઓપ્ટિમાઇઝેશન (SEO)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">ડિફૉલ્ટ મેટા શીર્ષક (Meta Title)</label>
                <input
                  type="text"
                  value={settings.seo_meta_title || ''}
                  onChange={(e) => handleChange('seo_meta_title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">ડિફૉલ્ટ મેટા વર્ણન (Meta Description)</label>
                <textarea
                  rows={3}
                  value={settings.seo_meta_description || ''}
                  onChange={(e) => handleChange('seo_meta_description', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">મુખ્ય કીવર્ડ્સ (Keywords - અલ્પવિરામથી અલગ કરો)</label>
                <input
                  type="text"
                  value={settings.seo_keywords || ''}
                  onChange={(e) => handleChange('seo_keywords', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <MediaUploadPicker
                  label="સોશિયલ શેરિંગ ઇમેજ (Open Graph / Twitter OG Image)"
                  value={settings.seo_og_image || ''}
                  onChange={(val) => handleChange('seo_og_image', val)}
                  folder="seo"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT US CMS */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b pb-2">અમારા વિશે પેજ કન્ટેન્ટ (About Us CMS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">પૃષ્ઠ શીર્ષક (About Title)</label>
                <input
                  type="text"
                  value={settings.about_title || ''}
                  onChange={(e) => handleChange('about_title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">પૃષ્ઠ ઉપશીર્ષક (Subtitle)</label>
                <input
                  type="text"
                  value={settings.about_subtitle || ''}
                  onChange={(e) => handleChange('about_subtitle', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">મુખ્ય વાર્તા / પરિચય (Full Story)</label>
                <textarea
                  rows={5}
                  value={settings.about_story || ''}
                  onChange={(e) => handleChange('about_story', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">અમારું વિઝન (Vision Statement)</label>
                <textarea
                  rows={3}
                  value={settings.about_vision || ''}
                  onChange={(e) => handleChange('about_vision', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">અમારું મિશન (Mission Statement)</label>
                <textarea
                  rows={3}
                  value={settings.about_mission || ''}
                  onChange={(e) => handleChange('about_mission', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <MediaUploadPicker
                  label="અબાઉટ પેજ બેનર / ઑફિસ છબી (Office / Team Banner Image)"
                  value={settings.about_image || ''}
                  onChange={(val) => handleChange('about_image', val)}
                  folder="about"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: CONTACT US CMS */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-primary border-b pb-2">સંપર્ક પૃષ્ઠ કન્ટેન્ટ (Contact Us CMS)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-1">સંપર્ક શીર્ષક</label>
                <input
                  type="text"
                  value={settings.contact_title || ''}
                  onChange={(e) => handleChange('contact_title', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">સંપર્ક ઉપશીર્ષક</label>
                <input
                  type="text"
                  value={settings.contact_subtitle || ''}
                  onChange={(e) => handleChange('contact_subtitle', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">સંપાદકીય ઈમેલ (Email)</label>
                <input
                  type="email"
                  value={settings.contact_email || ''}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ફોન નંબર (Phone)</label>
                <input
                  type="text"
                  value={settings.contact_phone || ''}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">વોટ્સએપ હેલ્પલાઇન (WhatsApp Number)</label>
                <input
                  type="text"
                  value={settings.contact_whatsapp || ''}
                  onChange={(e) => handleChange('contact_whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">કાર્યકારી કલાકો (Working Hours)</label>
                <input
                  type="text"
                  value={settings.contact_working_hours || ''}
                  onChange={(e) => handleChange('contact_working_hours', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">ઓફિસનું સરનામું (Full Address)</label>
                <textarea
                  rows={2}
                  value={settings.contact_address || ''}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Google Maps Embed URL (iframe src)
                </label>
                <input
                  type="text"
                  value={settings.contact_maps_url || ''}
                  onChange={(e) => handleChange('contact_maps_url', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 8. AI & Gemini API Settings */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-neutral-text border-b pb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              <span>Google Gemini AI અને API કી રૂપરેખાંકન (AI Settings)</span>
            </h3>

            <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Key className="w-4 h-4 text-[#7C3AED]" />
                <span>નવી Google Gemini API Key અહીં દાખલ કરો:</span>
              </div>
              <p className="text-purple-700 text-[11px]">
                તમે Google AI Studio (aistudio.google.com/app/apikey) માંથી ફ્રી API Key મેળવીને અહીં દાખલ કરી શકો છો. અહીં સેવ કરવાથી તે તરત જ કાર્યરત થઈ જશે.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-1">
                  Google Gemini API Key (AIzaSy...)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={settings.gemini_api_key || ''}
                    onChange={(e) => handleChange('gemini_api_key', e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full pl-9 pr-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                  />
                  <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  આ કી વડે પેન્ડિંગ સમાચાર પુનઃનિર્માણ (AI Recreator), લેખ જનરેશન અને અનુવાદ સ્વચાલિત થશે.
                </p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  AI મોડેલ (Gemini Model)
                </label>
                <select
                  value={settings.gemini_model || 'auto'}
                  onChange={(e) => handleChange('gemini_model', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs bg-white font-mono"
                >
                  <option value="auto">Auto-Detect (તમારી API કી મુજબ શ્રેષ્ઠ મોડેલ આપમેળે પસંદ થશે - ભલામણ કરેલ)</option>
                  <option value="gemini-2.5-flash">gemini-2.5-flash (ઝડપી અને નવીનતમ)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (વિસ્તૃત Pro પત્રકારત્વ)</option>
                  <option value="gemini-2.0-flash">gemini-2.0-flash (સ્ટેબલ)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center gap-2 shadow-sm text-xs"
          >
            <Save className="w-4 h-4 text-secondary" />
            <span>સેટિંગ્સ સાચવો (Save All Settings)</span>
          </button>
        </div>
      </form>
    </div>
  );
}
