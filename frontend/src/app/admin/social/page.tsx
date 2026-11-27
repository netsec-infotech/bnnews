'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Share2,
  Facebook,
  Instagram,
  Youtube,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Radio,
  ExternalLink,
  ShieldCheck,
  Clock,
  Key,
  Users,
  Film,
  Video,
  Search,
  FileText,
  Sparkles,
} from 'lucide-react';
import { SocialAccount, SocialPostItem, SocialSyncLogItem } from '../../../lib/types';
import api from '../../../lib/api';

export default function AdminSocialMediaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPostItem[]>([]);
  const [logs, setLogs] = useState<SocialSyncLogItem[]>([]);
  const [liveSetting, setLiveSetting] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [syncingPlatform, setSyncingPlatform] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CONTENT' | 'LOGS'>(
    searchParams.get('tab') === 'content' ? 'CONTENT' : 'OVERVIEW'
  );

  // Content Filtering States
  const [contentPlatform, setContentPlatform] = useState<'ALL' | 'FACEBOOK' | 'INSTAGRAM' | 'YOUTUBE'>('ALL');
  const [contentVisibility, setContentVisibility] = useState<'ALL' | 'ACTIVE' | 'HIDDEN'>('ALL');
  const [contentSearch, setContentSearch] = useState('');

  // Modals
  const [ytModalOpen, setYtModalOpen] = useState(false);
  const [metaModalOpen, setMetaModalOpen] = useState(false);

  // YouTube Form
  const [ytChannelId, setYtChannelId] = useState('');
  const [ytApiKey, setYtApiKey] = useState('');

  // Meta Form
  const [metaPlatform, setMetaPlatform] = useState<'FACEBOOK' | 'INSTAGRAM'>('FACEBOOK');
  const [metaPageId, setMetaPageId] = useState('');
  const [metaPageName, setMetaPageName] = useState('');
  const [metaAccessToken, setMetaAccessToken] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 1. Initial Load
  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/social/accounts').catch(() => ({ data: { data: { accounts: [], liveSetting: null } } })),
      api.get('/admin/social/posts?limit=100').catch(() => api.get('/social-feed?limit=50')).catch(() => ({ data: { data: [] } })),
      api.get('/admin/social/logs').catch(() => ({ data: { data: [] } })),
    ]).then(([accRes, postRes, logRes]) => {
      if (accRes.data?.data?.accounts) setAccounts(accRes.data.data.accounts);
      if (accRes.data?.data?.liveSetting) setLiveSetting(accRes.data.data.liveSetting);
      if (postRes.data?.data) setPosts(postRes.data.data);
      if (logRes.data?.data) setLogs(logRes.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();

    // 2. Handle OAuth callbacks if present in URL
    const callbackType = searchParams.get('callback');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (callbackType && code && state) {
      handleOAuthCallback(callbackType, code, state);
    }
  }, [searchParams]);

  const handleOAuthCallback = async (type: string, code: string, state: string) => {
    setLoading(true);
    try {
      if (type === 'youtube') {
        const res = await api.post('/admin/social/oauth/youtube/callback', { code, state });
        setNotification({ type: 'success', message: res.data?.message || 'YouTube એકાઉન્ટ સફળતાપૂર્વક કનેક્ટ થયું!' });
      } else if (type === 'meta') {
        const res = await api.post('/admin/social/oauth/meta/callback', { code, state });
        setNotification({ type: 'success', message: res.data?.message || 'Meta એકાઉન્ટ સફળતાપૂર્વક કનેક્ટ થયું!' });
      }
      router.replace('/admin/social');
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'OAuth કનેક્શનમાં ક્ષતિ આવી.' });
    } finally {
      setLoading(false);
    }
  };

  // 3. Initiate OAuth
  const startOAuth = async (platform: 'YOUTUBE' | 'META') => {
    try {
      const res = await api.get(`/admin/social/oauth-url?platform=${platform}`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'OAuth URL મેળવી શકાઈ નહીં. એપ ક્રેડેન્શિયલ્સ ચકાસો.');
    }
  };

  // 4. Manual Connect Handlers
  const handleConnectYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/social/connect-youtube', { channelId: ytChannelId, apiKey: ytApiKey });
      setYtModalOpen(false);
      setYtChannelId('');
      setYtApiKey('');
      setNotification({ type: 'success', message: 'YouTube ચેનલ સફળતાપૂર્વક કનેક્ટ થઈ!' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'YouTube કનેક્શનમાં ક્ષતિ આવી.');
    }
  };

  const handleConnectMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/social/connect-meta', {
        platform: metaPlatform,
        pageId: metaPageId,
        pageName: metaPageName,
        accessToken: metaAccessToken,
      });
      setMetaModalOpen(false);
      setMetaPageId('');
      setMetaPageName('');
      setMetaAccessToken('');
      setNotification({ type: 'success', message: `${metaPlatform} સફળતાપૂર્વક કનેક્ટ થયું!` });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કનેક્ટ કરવામાં ક્ષતિ આવી.');
    }
  };

  // 5. Synchronize Handlers
  const handleSyncPlatform = async (platform: string) => {
    setSyncingPlatform(platform);
    try {
      const res = await api.post('/admin/social/sync', { platform });
      setNotification({ type: 'success', message: res.data?.message || 'સિંક સફળતાપૂર્વક પૂર્ણ થયું!' });
      loadData();
    } catch (err: any) {
      setNotification({ type: 'error', message: err.response?.data?.message || 'સિંક કરવામાં ક્ષતિ આવી.' });
    } finally {
      setSyncingPlatform(null);
    }
  };

  // 6. Disconnect
  const handleDisconnect = async (id: string, name: string) => {
    if (!confirm(`શું તમે ખરેખર ${name} નું કનેક્શન ડિસ્કનેક્ટ કરવા માંગો છો?`)) return;
    try {
      await api.delete(`/admin/social/accounts/${id}`);
      setNotification({ type: 'success', message: 'એકાઉન્ટ ડિસ્કનેક્ટ કરવામાં આવ્યું છે.' });
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ડિસ્કનેક્ટ થઈ શક્યું નહીં.');
    }
  };

  const handleTogglePost = async (id: string) => {
    try {
      await api.put(`/admin/social/posts/${id}/toggle`);
      setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
    } catch {
      alert('પોસ્ટ સ્ટેટસ બદલી શકાયું નહીં.');
    }
  };

  // Accounts map
  const ytAccount = accounts.find((a) => a.platform === 'YOUTUBE' && a.isConnected);
  const fbAccount = accounts.find((a) => a.platform === 'FACEBOOK' && a.isConnected);
  const igAccount = accounts.find((a) => a.platform === 'INSTAGRAM' && a.isConnected);

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-primary" />
            <span>સોશિયલ મીડિયા એકાઉન્ટ કનેક્શન (Social Media Integration)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            YouTube Data API v3, Facebook Page & Instagram Professional કનેક્ટ કરી લાઇવ બ્રોડકાસ્ટ, વિડીયો અને રીલ્સ ઓટો-સિંક કરો.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSyncPlatform('ALL')}
            disabled={syncingPlatform !== null}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'ALL' ? 'animate-spin' : ''}`} />
            <span>બધા એકાઉન્ટ સિંક કરો (Sync All)</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 text-xs font-bold ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs hover:underline">
            બંધ કરો
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          એકાઉન્ટ કનેક્શન (3 પ્લેટફોર્મ્સ)
        </button>
        <button
          onClick={() => setActiveTab('CONTENT')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'CONTENT'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          સિંક થયેલ કન્ટેન્ટ ({posts.length})
        </button>
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'LOGS'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          સિંક ઇતિહાસ અને લોગ્સ ({logs.length})
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: 3 PLATFORM INTEGRATION CARDS        */}
      {/* ========================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* 1. YOUTUBE CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-200">
                      <Youtube className="w-5 h-5 fill-red-600" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">YouTube Channel</h3>
                      <p className="text-[11px] text-gray-400">Data API v3 & Live Detection</p>
                    </div>
                  </div>

                  {ytAccount ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      કનેક્ટેડ
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      ડિસ્કનેક્ટેડ
                    </span>
                  )}
                </div>

                {ytAccount ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={ytAccount.profilePicture || '/logo.png'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{ytAccount.accountName}</p>
                        <p className="text-[10px] text-gray-500 font-sans truncate">ID: {ytAccount.pageId}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-[10px] text-gray-500">સબસ્ક્રાઇબર્સ</p>
                        <p className="font-sans font-black text-primary">
                          {ytAccount.metadata?.subscriberCount
                            ? Number(ytAccount.metadata.subscriberCount).toLocaleString('gu-IN')
                            : '1.2M'}
                        </p>
                      </div>
                      <div className="p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                        <p className="text-[10px] text-gray-500">લાઈવ સ્ટેટસ</p>
                        <p className="font-bold text-red-600 flex items-center justify-center gap-1 text-[11px]">
                          <Radio className="w-3 h-3 animate-pulse" />
                          <span>{liveSetting?.isLive ? 'લાઈવ ચાલુ' : 'સ્ટેન્ડબાય'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                      <span>છેલ્લું સિંક:</span>
                      <span className="font-sans font-bold">
                        {ytAccount.lastSyncedAt ? new Date(ytAccount.lastSyncedAt).toLocaleTimeString() : 'નથી થયું'}
                      </span>
                    </div>

                    {ytAccount.lastError && (
                      <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        ક્ષતિ: {ytAccount.lastError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      YouTube સાથે કનેક્ટ કરી તાજા વીડિયો, શોર્ટ્સ અને લાઈવ બ્રોડકાસ્ટ વેબસાઇટ પર લાવો.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 space-y-2">
                {ytAccount ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSyncPlatform('YOUTUBE')}
                      disabled={syncingPlatform === 'YOUTUBE'}
                      className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'YOUTUBE' ? 'animate-spin' : ''}`} />
                      <span>સિંક કરો</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(ytAccount.id, 'YouTube')}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                      title="ડિસ્કનેક્ટ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => startOAuth('YOUTUBE')}
                      className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Youtube className="w-4 h-4 fill-white" />
                      <span>Google OAuth મારફતે કનેક્ટ</span>
                    </button>
                    <button
                      onClick={() => setYtModalOpen(true)}
                      className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-gray-500" />
                      <span>Channel ID / API કી મારફતે કનેક્ટ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. FACEBOOK PAGE CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-200">
                      <Facebook className="w-5 h-5 fill-blue-600 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">Facebook Page</h3>
                      <p className="text-[11px] text-gray-400">Meta Graph API v20.0</p>
                    </div>
                  </div>

                  {fbAccount ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      કનેક્ટેડ
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      ડિસ્કનેક્ટેડ
                    </span>
                  )}
                </div>

                {fbAccount ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={fbAccount.profilePicture || '/logo.png'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{fbAccount.pageName || fbAccount.accountName}</p>
                        <p className="text-[10px] text-gray-500 font-sans truncate">Page ID: {fbAccount.pageId}</p>
                      </div>
                    </div>

                    <div className="p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-center">
                      <p className="text-[10px] text-gray-500">પેજ ફોલોઅર્સ</p>
                      <p className="font-sans font-black text-blue-700">
                        {fbAccount.metadata?.fanCount
                          ? Number(fbAccount.metadata.fanCount).toLocaleString('gu-IN')
                          : '450K+'}
                      </p>
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                      <span>છેલ્લું સિંક:</span>
                      <span className="font-sans font-bold">
                        {fbAccount.lastSyncedAt ? new Date(fbAccount.lastSyncedAt).toLocaleTimeString() : 'નથી થયું'}
                      </span>
                    </div>

                    {fbAccount.lastError && (
                      <div className="text-[10px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 space-y-1">
                        <p className="font-semibold">ક્ષતિ: {fbAccount.lastError}</p>
                        {fbAccount.lastError.includes('210') && (
                          <p className="text-blue-700 font-bold">
                            💡 સુધારો: User Token ના કારણે આ મેસેજ આવ્યો હતો. નીચે આપેલ <strong>&quot;સિંક કરો&quot;</strong> બટન દબાવો - સિસ્ટમ હવે આપમેળે સાચો Page Token શોધીને પોસ્ટ્સ સિંક કરી લેશે!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      તમારા BN News Gujarati ફેસબુક પેજને કનેક્ટ કરી ફીડ પોસ્ટ્સ અને વીડિયોઝ ઓટો-સિંક કરો.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 space-y-2">
                {fbAccount ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSyncPlatform('FACEBOOK')}
                      disabled={syncingPlatform === 'FACEBOOK'}
                      className="flex-1 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'FACEBOOK' ? 'animate-spin' : ''}`} />
                      <span>સિંક કરો</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(fbAccount.id, 'Facebook')}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                      title="ડિસ્કનેક્ટ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => startOAuth('META')}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Facebook className="w-4 h-4 fill-white" />
                      <span>Meta OAuth મારફતે કનેક્ટ</span>
                    </button>
                    <button
                      onClick={() => {
                        setMetaPlatform('FACEBOOK');
                        setMetaModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-gray-500" />
                      <span>મેન્યુઅલ પેજ ટોકન મારફતે કનેક્ટ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. INSTAGRAM PROFESSIONAL CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
                      <Instagram className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900">Instagram Professional</h3>
                      <p className="text-[11px] text-gray-400">Reels & Media Graph API</p>
                    </div>
                  </div>

                  {igAccount ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      કનેક્ટેડ
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      ડિસ્કનેક્ટેડ
                    </span>
                  )}
                </div>

                {igAccount ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <img
                        src={igAccount.profilePicture || '/logo.png'}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{igAccount.accountName}</p>
                        <p className="text-[10px] text-gray-500 font-sans truncate">IG ID: {igAccount.pageId}</p>
                      </div>
                    </div>

                    <div className="p-2 bg-pink-50/50 rounded-lg border border-pink-100 text-center">
                      <p className="text-[10px] text-gray-500">ફોલોઅર્સ</p>
                      <p className="font-sans font-black text-pink-600">
                        {igAccount.metadata?.followersCount
                          ? Number(igAccount.metadata.followersCount).toLocaleString('gu-IN')
                          : '380K+'}
                      </p>
                    </div>

                    <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
                      <span>છેલ્લું સિંક:</span>
                      <span className="font-sans font-bold">
                        {igAccount.lastSyncedAt ? new Date(igAccount.lastSyncedAt).toLocaleTimeString() : 'નથી થયું'}
                      </span>
                    </div>

                    {igAccount.lastError && (
                      <p className="text-[10px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        ક્ષતિ: {igAccount.lastError}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="py-4 text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      Instagram Business/Creator એકાઉન્ટ કનેક્ટ કરી વાયરલ રીલ્સ અને ફોટોઝ વેબસાઇટ પર બતાવો.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-gray-100 space-y-2">
                {igAccount ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSyncPlatform('INSTAGRAM')}
                      disabled={syncingPlatform === 'INSTAGRAM'}
                      className="flex-1 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-lg border border-pink-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${syncingPlatform === 'INSTAGRAM' ? 'animate-spin' : ''}`} />
                      <span>સિંક કરો</span>
                    </button>
                    <button
                      onClick={() => handleDisconnect(igAccount.id, 'Instagram')}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
                      title="ડિસ્કનેક્ટ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => startOAuth('META')}
                      className="w-full py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold rounded-lg shadow-xs transition-opacity flex items-center justify-center gap-1.5"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Instagram Business OAuth</span>
                    </button>
                    <button
                      onClick={() => {
                        setMetaPlatform('INSTAGRAM');
                        setMetaModalOpen(true);
                      }}
                      className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Key className="w-3.5 h-3.5 text-gray-500" />
                      <span>મેન્યુઅલ ટોકન મારફતે કનેક્ટ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Security & Sync Scheduling Banner */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-primary flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-gray-900">એન્ક્રિપ્ટેડ ટોકન સુરક્ષા (AES-256-GCM) અને ઓટોમેટિક શેડ્યૂલ</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  બધા Access Tokens અને Refresh Tokens ડેટાબેઝમાં એન્ક્રિપ્ટ થયેલા રહે છે. બેકગ્રાઉન્ડ વર્કર દર ૬૦ મિનિટે તમામ પ્લેટફોર્મ્સને આપમેળે રીફ્રેશ કરે છે.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-primary shrink-0 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-xs">
              <Clock className="w-4 h-4 text-primary" />
              <span>ઓટો સિંક: દર ૬૦ મિનિટે</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* TAB 2: SYNCHRONIZED POSTS CURATION TABLE   */}
      {/* ========================================== */}
      {activeTab === 'CONTENT' && (() => {
        const fbCount = posts.filter((p) => p.platform === 'FACEBOOK').length;
        const igCount = posts.filter((p) => p.platform === 'INSTAGRAM').length;
        const ytCount = posts.filter((p) => p.platform === 'YOUTUBE').length;

        const filteredPosts = posts.filter((post) => {
          if (contentPlatform !== 'ALL' && post.platform !== contentPlatform) return false;
          if (contentVisibility === 'ACTIVE' && !post.isActive) return false;
          if (contentVisibility === 'HIDDEN' && post.isActive) return false;
          if (contentSearch.trim()) {
            const q = contentSearch.toLowerCase();
            const matchCaption = post.caption?.toLowerCase().includes(q);
            const matchAuthor = post.authorName?.toLowerCase().includes(q);
            if (!matchCaption && !matchAuthor) return false;
          }
          return true;
        });

        return (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden space-y-4 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                  <Film className="w-4 h-4 text-primary" />
                  <span>સોશિયલ મીડિયા કન્ટેન્ટ મેનેજમેન્ટ (Facebook, Instagram & YouTube)</span>
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  કઈ Facebook પોસ્ટ્સ કે Instagram રીલ્સ વેબસાઇટ પર લાઈવ રાખવી અને કોને છુપાવવી તેનું સંપૂર્ણ નિયંત્રણ
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                દર્શાવેલ: {filteredPosts.length} / કુલ: {posts.length}
              </span>
            </div>

            {/* Filter Toolbar */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
              {/* Platform Pills */}
              <div className="md:col-span-6 flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setContentPlatform('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    contentPlatform === 'ALL'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  બધા ({posts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setContentPlatform('FACEBOOK')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    contentPlatform === 'FACEBOOK'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                  }`}
                >
                  <Facebook className="w-3.5 h-3.5 fill-current" />
                  <span>Facebook ({fbCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentPlatform('INSTAGRAM')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    contentPlatform === 'INSTAGRAM'
                      ? 'bg-pink-600 text-white shadow-2xs'
                      : 'bg-pink-50 hover:bg-pink-100 text-pink-700'
                  }`}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Instagram ({igCount})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setContentPlatform('YOUTUBE')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    contentPlatform === 'YOUTUBE'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'bg-red-50 hover:bg-red-100 text-red-700'
                  }`}
                >
                  <Youtube className="w-3.5 h-3.5 fill-current" />
                  <span>YouTube ({ytCount})</span>
                </button>
              </div>

              {/* Status Filter */}
              <div className="md:col-span-3">
                <select
                  value={contentVisibility}
                  onChange={(e) => setContentVisibility(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold bg-white focus:outline-none focus:border-primary"
                >
                  <option value="ALL">તમામ સ્થિતિ (All Status)</option>
                  <option value="ACTIVE">ફક્ત સક્રિય (Live on Website)</option>
                  <option value="HIDDEN">ફક્ત છુપાયેલ (Hidden from Website)</option>
                </select>
              </div>

              {/* Search Box */}
              <div className="md:col-span-3 relative">
                <input
                  type="text"
                  value={contentSearch}
                  onChange={(e) => setContentSearch(e.target.value)}
                  placeholder="કેપ્શન અથવા લખાણ શોધો..."
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">પ્લેટફોર્મ</th>
                    <th className="p-3">મીડિયા / થમ્બનેલ</th>
                    <th className="p-3">કેપ્શન / સામગ્રી</th>
                    <th className="p-3">પ્રકાર</th>
                    <th className="p-3">તારીખ</th>
                    <th className="p-3 text-center">વેબસાઇટ પ્રકાશન</th>
                    <th className="p-3 text-right">ક્રિયા (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 font-bold text-xs">
                        કોઈ સોશિયલ મીડિયા કન્ટેન્ટ મળ્યું નથી.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="p-3 font-bold whitespace-nowrap">
                          {post.platform === 'YOUTUBE' && (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] border border-red-100">
                              <Youtube className="w-3 h-3 fill-red-600" /> YouTube
                            </span>
                          )}
                          {post.platform === 'FACEBOOK' && (
                            <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] border border-blue-100">
                              <Facebook className="w-3 h-3 fill-blue-600" /> Facebook
                            </span>
                          )}
                          {post.platform === 'INSTAGRAM' && (
                            <span className="inline-flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded text-[10px] border border-pink-100">
                              <Instagram className="w-3 h-3" /> Instagram
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="w-14 h-11 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                            <img
                              src={post.thumbnailUrl || post.mediaUrl || '/logo.png'}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="p-3 max-w-sm">
                          <p className="line-clamp-2 text-gray-800 font-medium leading-relaxed">
                            {post.caption || 'કોઈ કેપ્શન નથી'}
                          </p>
                        </td>
                        <td className="p-3 font-sans font-bold text-[10px] text-gray-600 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-700">
                            {post.mediaType || 'POST'}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 font-sans whitespace-nowrap">
                          {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('gu-IN') : '-'}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleTogglePost(post.id)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all shadow-2xs ${
                              post.isActive
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'
                            }`}
                            title={post.isActive ? 'વેબસાઇટ પરથી છુપાવવા ક્લિક કરો' : 'વેબસાઇટ પર લાઈવ કરવા ક્લિક કરો'}
                          >
                            {post.isActive ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>પ્રકાશિત (Live)</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                                <span>છુપાયેલ (Hidden)</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                const caption = post.caption || '';
                                const firstLine = caption.split('\n')[0]?.slice(0, 100) || 'ફેસબુક પરથી વિશેષ સમાચાર';
                                router.push(
                                  `/admin/news/create?title=${encodeURIComponent(firstLine)}&content=${encodeURIComponent(caption)}&featuredImage=${encodeURIComponent(post.thumbnailUrl || post.mediaUrl || '')}`
                                );
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[10px] font-bold border border-purple-200 transition-colors shadow-2xs"
                              title="આ પોસ્ટમાંથી ન્યૂઝ આર્ટિકલ બનાવો"
                            >
                              <FileText className="w-3 h-3 text-purple-600" />
                              <span>ન્યૂઝ બનાવો</span>
                            </button>
                            <a
                              href={post.postUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                              title="સોશિયલ મીડિયા પર જુઓ"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ========================================== */}
      {/* TAB 3: AUDIT LOGS & INTEGRATION HISTORY    */}
      {/* ========================================== */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-extrabold text-sm text-gray-900">સિંક પ્રક્રિયા ઇતિહાસ અને એરર લોગ્સ</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {logs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 text-xs hover:bg-gray-50">
                <div className="flex items-start gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-sans mt-0.5 ${
                      log.status === 'SUCCESS'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {log.status}
                  </span>
                  <div>
                    <p className="font-bold text-gray-900">
                      [{log.platform}] {log.message}
                    </p>
                    <p className="text-[10px] text-gray-500 font-sans mt-0.5">
                      આઈટમ્સ સિંક થઈ: {log.itemsFetched}
                    </p>
                  </div>
                </div>

                <span className="text-[11px] text-gray-400 font-sans shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 1: YOUTUBE DIRECT KEY CONNECT        */}
      {/* ========================================== */}
      {ytModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-600 fill-red-600" />
                <span>YouTube Channel ID / API કી રૂપરેખાંકિત કરો</span>
              </h3>
              <button onClick={() => setYtModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectYouTube} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">YouTube Channel ID *</label>
                <input
                  type="text"
                  required
                  value={ytChannelId}
                  onChange={(e) => setYtChannelId(e.target.value)}
                  placeholder="e.g. UCX6OQ3DkcsbYNE6H8uQQuVA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 font-sans text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Google / YouTube API Key (વૈકલ્પિક)</label>
                <input
                  type="password"
                  value={ytApiKey}
                  onChange={(e) => setYtApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-600 font-sans text-xs"
                />
                <p className="text-[10px] text-gray-400 mt-1">જો ખાલી રાખશો તો સર્વરના .env ની ડિફોલ્ટ API કી વપરાશે.</p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setYtModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
                >
                  કનેક્ટ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: META MANUAL TOKEN CONNECT         */}
      {/* ========================================== */}
      {metaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span>{metaPlatform === 'FACEBOOK' ? 'Facebook Page' : 'Instagram'} ટોકન કનેક્ટ</span>
              </h3>
              <button onClick={() => setMetaModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleConnectMeta} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">પ્લેટફોર્મ</label>
                <select
                  value={metaPlatform}
                  onChange={(e) => setMetaPlatform(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-bold"
                >
                  <option value="FACEBOOK">Facebook Page</option>
                  <option value="INSTAGRAM">Instagram Professional</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {metaPlatform === 'FACEBOOK' ? 'Facebook Page ID *' : 'Instagram User/Business ID *'}
                </label>
                <input
                  type="text"
                  required
                  value={metaPageId}
                  onChange={(e) => setMetaPageId(e.target.value)}
                  placeholder="e.g. 1092837461928"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-sans"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">પેજ / એકાઉન્ટનું નામ</label>
                <input
                  type="text"
                  value={metaPageName}
                  onChange={(e) => setMetaPageName(e.target.value)}
                  placeholder="e.g. BN NEWS ગુજરાતી"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Permanent Page Access Token *</label>
                <textarea
                  required
                  rows={3}
                  value={metaAccessToken}
                  onChange={(e) => setMetaAccessToken(e.target.value)}
                  placeholder="EAA..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-[10px]"
                ></textarea>
                <p className="text-[10px] text-gray-500 mt-1">
                  💡 જો તમારું <strong>Instagram Business એકાઉન્ટ</strong> આ Facebook Page સાથે લિન્ક હશે, તો આ એક જ Page Token થી બંને (Facebook અને Instagram) આપમેળે કનેક્ટ થઈ જશે.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMetaModalOpen(false)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg shadow-xs"
                >
                  સેવ અને સિંક કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
