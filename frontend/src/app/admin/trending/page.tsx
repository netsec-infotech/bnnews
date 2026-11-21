'use client';

import React, { useEffect, useState } from 'react';
import { Flame, Trash2 } from 'lucide-react';
import { TrendingNewsItem, NewsArticle } from '../../../lib/types';
import api from '../../../lib/api';

export default function TrendingNewsAdminPage() {
  const [trendingList, setTrendingList] = useState<TrendingNewsItem[]>([]);
  const [publishedNews, setPublishedNews] = useState<NewsArticle[]>([]);
  const [selectedNewsId, setSelectedNewsId] = useState('');
  const [priority, setPriority] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/trending'),
      api.get('/admin/news?status=PUBLISHED&limit=30'),
    ])
      .then(([tRes, nRes]) => {
        if (tRes.data?.success) setTrendingList(tRes.data.data);
        if (nRes.data?.success) setPublishedNews(nRes.data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNewsId) return;

    try {
      await api.post('/admin/trending', {
        newsId: selectedNewsId,
        priority,
      });
      setSelectedNewsId('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ઉમેરી શકાયા નહીં');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/trending/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાયા નહીં');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
          <Flame className="w-5 h-5 text-secondary" />
          <span>ટ્રેન્ડિંગ ન્યૂઝ સંચાલન (Trending News Management)</span>
        </h1>
        <p className="text-xs text-neutral-muted mt-0.5">
          હોમપેજ પર ૧ થી ૧૦ ક્રમમાં દર્શાવવા માટે પ્રકાશિત સમાચાર પસંદ કરો
        </p>
      </div>

      <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
        <h3 className="font-bold text-primary">ટ્રેન્ડિંગમાં નવો સમાચાર ઉમેરો</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-8">
            <label className="block font-bold text-gray-700 mb-1">પ્રકાશિત સમાચાર પસંદ કરો *</label>
            <select
              required
              value={selectedNewsId}
              onChange={(e) => setSelectedNewsId(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
            >
              <option value="">સમાચાર પસંદ કરો...</option>
              {publishedNews.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.titleGu}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-gray-700 mb-1">પ્રાયોરિટી (ક્રમ)</label>
            <input
              type="number"
              min={1}
              max={100}
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={!selectedNewsId}
              className="w-full py-2 bg-secondary text-white font-bold rounded-lg hover:bg-secondary-hover disabled:opacity-40 transition-colors shadow-xs"
            >
              ઉમેરો
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">ક્રમ</th>
              <th className="py-3 px-3">હેડલાઇન</th>
              <th className="py-3 px-3">કેટેગરી</th>
              <th className="py-3 px-3 text-right">ક્રિયા</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {trendingList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/60">
                <td className="py-2.5 px-3 font-mono font-bold text-secondary">#{item.priority}</td>
                <td className="py-2.5 px-3 font-bold text-neutral-text">{item.news?.titleGu}</td>
                <td className="py-2.5 px-3">{item.news?.category?.nameGu}</td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
