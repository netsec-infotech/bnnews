'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { NewsArticle } from '../../../lib/types';
import api from '../../../lib/api';
import NewsCard from '../../../components/public/NewsCard';
import EmptyState from '../../../components/common/EmptyState';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params?.category as string;

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categoryName, setCategoryName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!categorySlug) return;
    setLoading(true);

    api
      .get(`/news?category=${categorySlug}&page=${page}&limit=12`)
      .then((res) => {
        if (res.data?.success) {
          setArticles(res.data.data || []);
          setTotalPages(res.data.meta?.totalPages || 1);
          if (res.data.data?.[0]?.category?.nameGu) {
            setCategoryName(res.data.data[0].category.nameGu);
          }
        }
      })
      .catch((err) => console.error('Category news error:', err))
      .finally(() => setLoading(false));
  }, [categorySlug, page]);

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-primary pb-3 flex items-center justify-between">
        <h1 className="font-gujarati text-2xl font-bold text-primary flex items-center gap-2">
          <span className="w-3 h-3 bg-secondary rounded-full"></span>
          <span>{categoryName || categorySlug} સમાચાર</span>
        </h1>
        <span className="text-xs text-neutral-muted font-gujarati">
          પૃષ્ઠ {page} / {totalPages}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title={`આ શ્રેણીમાં હાલ કોઈ સમાચાર નથી`}
          message="અમારી સંપાદકીય ટીમ ટૂંક સમયમાં નવા સમાચાર પ્રકાશિત કરશે."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} variant="standard" />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-8 font-gujarati">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                પાછળ
              </button>
              <span className="text-sm font-semibold px-3">
                {page} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-4 py-2 border rounded-md text-sm disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                આગળ
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
