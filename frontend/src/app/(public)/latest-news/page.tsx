'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Flame, ChevronLeft, ChevronRight, Eye, User } from 'lucide-react';
import { NewsArticle } from '../../../lib/types';
import api from '../../../lib/api';
import AdSlot from '../../../components/common/AdSlot';

export default function LatestNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/news?page=${page}&limit=12`)
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setArticles(res.data.data);
          if (res.data.meta) {
            setTotalPages(res.data.meta.totalPages || 1);
            setTotalCount(res.data.meta.total || 0);
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-gujarati space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#202B78] to-[#151c52] rounded-2xl p-6 md:p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-red-600 rounded-lg text-white">
              <Flame className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black">
              તાજા સમાચાર (Latest News)
            </h1>
          </div>
          <p className="text-xs md:text-sm text-gray-200 mt-1">
            ગુજરાત, ભારત અને વિશ્વના પળે-પળના તાજા અને મહત્વપૂર્ણ સમાચારો
          </p>
        </div>

        <span className="text-xs bg-white/10 px-3 py-1.5 rounded-xl text-gray-200 self-start md:self-auto font-mono">
          કુલ સમાચાર: {totalCount}
        </span>
      </div>

      {/* Ad Slot */}
      <AdSlot placement="news_above_article" />

      {/* News Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse space-y-3">
              <div className="aspect-video bg-gray-200 rounded-lg" />
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500 text-xs">
          હાલમાં કોઈ તાજા સમાચાર ઉપલબ્ધ નથી.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img
                  src={art.featuredImage || '/images/bn-news-logo.png'}
                  alt={art.titleGu}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {art.category && (
                  <span className="absolute top-3 left-3 bg-primary text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                    {art.category.nameGu}
                  </span>
                )}
                {art.isBreaking && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase shadow-xs">
                    બ્રેકિંગ
                  </span>
                )}
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <h2 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    <Link href={`/${art.category?.slug || 'gujarat'}/${art.slug}`}>
                      {art.titleGu}
                    </Link>
                  </h2>

                  {art.descriptionGu && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {art.descriptionGu}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-secondary" />
                    <span>{new Date(art.createdAt).toLocaleDateString('gu-IN')}</span>
                  </span>

                  <Link
                    href={`/${art.category?.slug || 'gujarat'}/${art.slug}`}
                    className="text-primary font-bold hover:underline"
                  >
                    વાંચો &rarr;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-gray-700 px-3">
            પૃષ્ઠ {page} / {totalPages}
          </span>
          <button
            onClick={() => {
              setPage((p) => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-700 disabled:opacity-40 hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
