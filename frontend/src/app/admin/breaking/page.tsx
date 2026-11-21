'use client';

import React, { useEffect, useState } from 'react';
import { Radio, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { BreakingNewsItem, NewsArticle } from '../../../lib/types';
import api from '../../../lib/api';

export default function BreakingNewsAdminPage() {
  const [breakingList, setBreakingList] = useState<BreakingNewsItem[]>([]);
  const [publishedNews, setPublishedNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedNewsId, setSelectedNewsId] = useState('');
  const [tickerText, setTickerText] = useState('');
  const [order, setOrder] = useState(0);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/breaking'),
      api.get('/admin/news?status=PUBLISHED&limit=30'),
    ])
      .then(([bRes, nRes]) => {
        if (bRes.data?.success) setBreakingList(bRes.data.data);
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
      await api.post('/admin/breaking', {
        newsId: selectedNewsId,
        tickerText: tickerText || undefined,
        order,
      });
      setSelectedNewsId('');
      setTickerText('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'ઉમેરી શકાયા નહીં');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/breaking/${id}`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાયા નહીં');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
          <Radio className="w-5 h-5 text-breaking" />
          <span>બ્રેકિંગ ન્યૂઝ ટિકર સંચાલન (Breaking News Management)</span>
        </h1>
        <p className="text-xs text-neutral-muted mt-0.5">
          માત્ર પ્રકાશિત થયેલા સમાચારોને જ બ્રેકિંગ ટિકરમાં ઉમેરી શકાય છે
        </p>
      </div>

      {/* Add Breaking News Form */}
      <form onSubmit={handleAdd} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3 text-xs">
        <h3 className="font-bold text-primary">બ્રેકિંગ ટિકરમાં નવો સમાચાર ઉમેરો</h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-5">
            <label className="block font-bold text-gray-700 mb-1">પ્રકાશિત સમાચાર પસંદ કરો *</label>
            <select
              required
              value={selectedNewsId}
              onChange={(e) => {
                setSelectedNewsId(e.target.value);
                const item = publishedNews.find((n) => n.id === e.target.value);
                if (item) setTickerText(item.titleGu);
              }}
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

          <div className="md:col-span-5">
            <label className="block font-bold text-gray-700 mb-1">ટિકર ટેક્સ્ટ (કસ્ટમ હેડલાઇન)</label>
            <input
              type="text"
              value={tickerText}
              onChange={(e) => setTickerText(e.target.value)}
              placeholder="ટિકરમાં દર્શાવવાનું લખાણ..."
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={!selectedNewsId}
              className="w-full py-2 bg-breaking text-white font-bold rounded-lg hover:bg-breaking-dark disabled:opacity-40 transition-colors shadow-xs"
            >
              ટિકરમાં ઉમેરો
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">ક્રમ</th>
              <th className="py-3 px-3">ટિકર હેડલાઇન</th>
              <th className="py-3 px-3">કેટેગરી</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3 text-right">ક્રિયા</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {breakingList.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/60">
                <td className="py-2.5 px-3 font-mono font-bold">{item.order}</td>
                <td className="py-2.5 px-3 font-bold text-neutral-text">
                  {item.tickerText || item.news?.titleGu}
                </td>
                <td className="py-2.5 px-3">{item.news?.category?.nameGu}</td>
                <td className="py-2.5 px-3">
                  <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded text-[10px]">
                    સક્રિય ટિકર
                  </span>
                </td>
                <td className="py-2.5 px-3 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                    title="ટિકરમાંથી દૂર કરો"
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
