'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { NewsArticle } from '../../../lib/types';
import api from '../../../lib/api';
import NewsCard from '../../../components/public/NewsCard';
import EmptyState from '../../../components/common/EmptyState';

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('q') || '';

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setArticles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    api
      .get(`/news?search=${encodeURIComponent(query.trim())}&limit=20`)
      .then((res) => {
        if (res.data?.success) {
          setArticles(res.data.data || []);
        }
      })
      .catch((err) => console.error('Search error:', err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-primary pb-3 flex items-center justify-between font-gujarati">
        <h1 className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
          <Search className="w-5 h-5 text-secondary" />
          <span>શોધ પરિણામો: &ldquo;{query}&rdquo;</span>
        </h1>
        <span className="text-xs text-neutral-muted">
          {articles.length} સમાચાર મળ્યા
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <EmptyState
          title={`"${query}" માટે કોઈ સમાચાર મળ્યા નથી`}
          message="કૃપા કરીને અન્ય કીવર્ડ સાથે પ્રયાસ કરો."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} variant="standard" />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-gujarati text-neutral-muted">શોધ પરિણામો લોડ થઈ રહ્યા છે...</div>}>
      <SearchContent />
    </Suspense>
  );
}
