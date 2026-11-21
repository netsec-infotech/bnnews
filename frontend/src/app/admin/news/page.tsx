'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, CheckCircle2, Clock, Globe } from 'lucide-react';
import { NewsArticle, Category } from '../../../lib/types';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AllNewsAdminPage() {
  const { hasRole } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    api.get('/admin/categories').then((res) => {
      if (res.data?.success) setCategories(res.data.data);
    });
  }, []);

  const loadNews = () => {
    setLoading(true);
    const query = new URLSearchParams({
      status: statusFilter,
      ...(categoryFilter && { categoryId: categoryFilter }),
      ...(search && { search }),
      page: String(page),
      limit: '20',
    });

    api
      .get(`/admin/news?${query.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setArticles(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNews();
  }, [statusFilter, categoryFilter, page]);

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ સમાચાર કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/news/${id}`);
      loadNews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાતા નથી');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text">
            તમામ સમાચાર સંચાલન (All News Management)
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            મેન્યુઅલ અને RSS દ્વારા સંચાલિત તમામ સમાચારોની યાદી
          </p>
        </div>

        <Link
          href="/admin/news/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all shadow-sm w-fit"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>નવા સમાચાર ઉમેરો</span>
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
          >
            <option value="ALL">તમામ સ્થિતિ (All Status)</option>
            <option value="PUBLISHED">પ્રકાશિત (Published)</option>
            <option value="PENDING">પેન્ડિંગ (Pending)</option>
            <option value="DRAFT">ડ્રાફ્ટ (Draft)</option>
            <option value="REJECTED">નકારેલ (Rejected)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
          >
            <option value="">તમામ કેટેગરી</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameGu}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            loadNews();
          }}
          className="sm:col-span-6 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="હેડલાઇન શોધો..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
          >
            શોધો
          </button>
        </form>
      </div>

      {/* News Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">છબી</th>
              <th className="py-3 px-3">હેડલાઇન</th>
              <th className="py-3 px-3">કેટેગરી</th>
              <th className="py-3 px-3">સ્ત્રોત / લેખક</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3">તારીખ</th>
              <th className="py-3 px-3 text-right">ક્રિયા</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  લોડ થઈ રહ્યું છે...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-400">
                  કોઈ સમાચાર મળ્યા નથી.
                </td>
              </tr>
            ) : (
              articles.map((art) => (
                <tr key={art.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-2.5 px-3">
                    <div className="w-12 h-9 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                      {art.featuredImage ? (
                        <img src={art.featuredImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-[9px]">
                          None
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 max-w-sm">
                    <p className="font-bold text-neutral-text line-clamp-1">{art.titleGu}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {art.isBreaking && (
                        <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1 rounded">
                          બ્રેકિંગ
                        </span>
                      )}
                      {art.isTrending && (
                        <span className="text-[9px] bg-orange-100 text-orange-700 font-bold px-1 rounded">
                          ટ્રેન્ડિંગ
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-gray-700">
                    {art.category?.nameGu || 'કેટેગરી'}
                  </td>

                  <td className="py-2.5 px-3 text-neutral-muted">
                    {art.source?.attributionName || art.author?.name || 'BN News'}
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        art.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : art.status === 'PENDING'
                          ? 'bg-orange-100 text-orange-800'
                          : art.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">
                    {new Date(art.createdAt).toLocaleDateString('gu-IN')}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {art.status === 'PUBLISHED' && (
                        <Link
                          href={`/${art.category?.slug || 'gujarat'}/${art.slug}`}
                          target="_blank"
                          className="p-1 text-gray-500 hover:text-primary rounded hover:bg-gray-100"
                          title="લાઇવ જુઓ"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </Link>
                      )}

                      <Link
                        href={`/admin/pending?review=${art.id}`}
                        className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                        title="સંપાદિત કરો / સમીક્ષા"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Link>

                      {hasRole('SUPER_ADMIN', 'ADMIN') && (
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                          title="કાઢી નાખો"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-xs">
          <span>પૃષ્ઠ {page} / {totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              પાછળ
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-40"
            >
              આગળ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
