'use client';

import React, { useEffect, useState } from 'react';
import {
  Rss,
  Plus,
  Play,
  CheckCircle,
  AlertCircle,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { RssSource, Category } from '../../../lib/types';
import api from '../../../lib/api';

export default function RssSourcesAdminPage() {
  const [sources, setSources] = useState<RssSource[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingSourceId, setFetchingSourceId] = useState<string | null>(null);
  const [fetchMessage, setFetchMessage] = useState<{ id: string; msg: string; success: boolean } | null>(null);

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formFeedUrl, setFormFeedUrl] = useState('');
  const [formWebsiteUrl, setFormWebsiteUrl] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formInterval, setFormInterval] = useState(30);
  const [formAttribution, setFormAttribution] = useState('');
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Test Feed Connection State
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadSources = () => {
    setLoading(true);
    api
      .get('/admin/rss-sources')
      .then((res) => {
        if (res.data?.success) setSources(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSources();
    api.get('/admin/categories').then((res) => {
      if (res.data?.success) setCategories(res.data.data);
    });
  }, []);

  const openAddModal = () => {
    setEditId(null);
    setFormName('');
    setFormFeedUrl('');
    setFormWebsiteUrl('');
    setFormCategoryId(categories[0]?.id || '');
    setFormInterval(30);
    setFormAttribution('');
    setFormStatus('ACTIVE');
    setTestResult(null);
    setModalOpen(true);
  };

  const openEditModal = (s: RssSource) => {
    setEditId(s.id);
    setFormName(s.name);
    setFormFeedUrl(s.feedUrl);
    setFormWebsiteUrl(s.websiteUrl || '');
    setFormCategoryId(s.defaultCategoryId || categories[0]?.id || '');
    setFormInterval(s.collectionInterval);
    setFormAttribution(s.attributionName || '');
    setFormStatus(s.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
    setTestResult(null);
    setModalOpen(true);
  };

  const handleTestConnection = async () => {
    if (!formFeedUrl) {
      alert('કૃપા કરીને ફીડ URL દાખલ કરો');
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await api.post('/admin/rss-sources/test', { feedUrl: formFeedUrl });
      if (res.data?.success) {
        setTestResult(`કનેક્શન સફળ! શીર્ષક: "${res.data.feedTitle}" (${res.data.totalItemsFound} સમાચાર મળ્યા)`);
      }
    } catch (err: any) {
      setTestResult(`ક્ષતિ: ${err.response?.data?.message || 'ફીડ પારસ થઈ શકી નથી.'}`);
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/rss-sources/${editId}`, {
          name: formName,
          feedUrl: formFeedUrl,
          websiteUrl: formWebsiteUrl || null,
          defaultCategoryId: formCategoryId || null,
          collectionInterval: formInterval,
          attributionName: formAttribution,
          status: formStatus,
        });
      } else {
        await api.post('/admin/rss-sources', {
          name: formName,
          feedUrl: formFeedUrl,
          websiteUrl: formWebsiteUrl || null,
          defaultCategoryId: formCategoryId || null,
          collectionInterval: formInterval,
          attributionName: formAttribution,
          status: formStatus,
        });
      }
      setModalOpen(false);
      loadSources();
    } catch (err: any) {
      alert(err.response?.data?.message || 'સાચવતી વખતે ભૂલ થઈ');
    }
  };

  const handleManualFetch = async (sourceId: string) => {
    setFetchingSourceId(sourceId);
    setFetchMessage(null);
    try {
      const res = await api.post(`/admin/rss-sources/${sourceId}/fetch`);
      setFetchMessage({
        id: sourceId,
        msg: res.data?.message || 'સફળતાપૂર્વક સમાચાર સંગ્રહિત થયા!',
        success: res.data?.success || false,
      });
      loadSources();
    } catch (err: any) {
      setFetchMessage({
        id: sourceId,
        msg: err.response?.data?.message || 'સંગ્રહ નિષ્ફળ',
        success: false,
      });
    } finally {
      setFetchingSourceId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ RSS સ્ત્રોત કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/rss-sources/${id}`);
      loadSources();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાતો નથી');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <Rss className="w-5 h-5 text-secondary" />
            <span>RSS સ્ત્રોત સંચાલન (RSS Feeds Automation)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            સ્વયંસંચાલિત RSS સમાચાર સંગ્રહ, અંતરાલ રૂપરેખાંકન અને તાત્કાલિક મેન્યુઅલ ફેચ
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all shadow-sm w-fit"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>નવો RSS સ્ત્રોત ઉમેરો</span>
        </button>
      </div>

      {/* Sources Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">સ્ત્રોત નામ</th>
              <th className="py-3 px-3">ડિફોલ્ટ કેટેગરી</th>
              <th className="py-3 px-3">અંતરાલ (મિનિટ)</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3">કુલ આયાત</th>
              <th className="py-3 px-3">છેલ્લો ફેચ સમય</th>
              <th className="py-3 px-3 text-right">ક્રિયા (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  લોડ થઈ રહ્યું છે...
                </td>
              </tr>
            ) : sources.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  કોઈ RSS સ્ત્રોત સેટઅપ નથી.
                </td>
              </tr>
            ) : (
              sources.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-bold text-neutral-text">{s.name}</p>
                    <a
                      href={s.feedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-gray-400 hover:text-primary flex items-center gap-1 mt-0.5 truncate max-w-xs"
                    >
                      <span>{s.feedUrl}</span>
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    </a>
                    {s.lastError && (
                      <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                        ક્ષતિ: {s.lastError}
                      </p>
                    )}
                  </td>

                  <td className="py-3 px-3 font-semibold text-gray-700">
                    {s.defaultCategory?.nameGu || 'ડિફોલ્ટ'}
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-primary">
                    {s.collectionInterval} મિનિટ
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        s.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : s.status === 'ERROR'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-bold text-neutral-text">
                    {s.totalArticlesCount} સમાચાર
                  </td>

                  <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                    {s.lastFetchTime
                      ? new Date(s.lastFetchTime).toLocaleTimeString('gu-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'ક્યારેય નહીં'}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* Fetch Now Button */}
                      <button
                        onClick={() => handleManualFetch(s.id)}
                        disabled={fetchingSourceId === s.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-white rounded text-[11px] font-semibold hover:bg-secondary-hover transition-colors shadow-xs disabled:opacity-50"
                        title="તાત્કાલિક RSS સંગ્રહ કરો"
                      >
                        {fetchingSourceId === s.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Zap className="w-3 h-3 fill-white" />
                        )}
                        <span>ફેચ નાવ</span>
                      </button>

                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                        title="સંપાદિત કરો"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="કાઢી નાખો"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {fetchMessage && fetchMessage.id === s.id && (
                      <p
                        className={`text-[10px] mt-1 ${
                          fetchMessage.success ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {fetchMessage.msg}
                      </p>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit RSS Source Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-neutral-text border-b border-gray-200 pb-3">
              {editId ? 'RSS સ્ત્રોત સંપાદિત કરો' : 'નવો RSS સ્ત્રોત ઉમેરો'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">સ્ત્રોત નામ (Source Name) *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="દા.ત. BBC Gujarati, TV9 Gujarati"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">RSS Feed URL *</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={formFeedUrl}
                    onChange={(e) => setFormFeedUrl(e.target.value)}
                    placeholder="https://.../feed.xml"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors whitespace-nowrap"
                  >
                    {testingConnection ? 'ચકાસી રહ્યું છે...' : 'કનેક્શન ટેસ્ટ'}
                  </button>
                </div>
                {testResult && (
                  <p className="text-[11px] mt-1 font-semibold text-primary">{testResult}</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">વેબસાઇટ લિંક (Website URL)</label>
                <input
                  type="url"
                  value={formWebsiteUrl}
                  onChange={(e) => setFormWebsiteUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ડિફોલ્ટ કેટેગરી *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameGu}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">કલેક્શન અંતરાલ (મિનિટ)</label>
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={formInterval}
                    onChange={(e) => setFormInterval(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">એટ્રિબ્યુશન નામ</label>
                  <input
                    type="text"
                    value={formAttribution}
                    onChange={(e) => setFormAttribution(e.target.value)}
                    placeholder="દા.ત. TV9, BBC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">સ્થિતિ</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary text-xs"
                  >
                    <option value="ACTIVE">સક્રિય (ACTIVE)</option>
                    <option value="INACTIVE">નિષ્ક્રિય (INACTIVE)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark"
                >
                  સાચવો (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
