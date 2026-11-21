'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BreakingNewsItem } from '../../lib/types';
import api from '../../lib/api';

export const BreakingNewsTicker: React.FC = () => {
  const [breakingItems, setBreakingItems] = useState<BreakingNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fallback sample items matching the screenshot if database is empty initially
  const defaultItems = [
    { id: '1', title: 'રાજ્ય સરકાર દ્વારા ઈલેક્ટ્રિક વાહન માટે નવી સબસિડી યોજના જાહેર', slug: '#' },
    { id: '2', title: 'ISRO સફળતાપૂર્વક નવા ઉપગ્રહનું પ્રક્ષેપણ કર્યું', slug: '#' },
    { id: '3', title: 'ગુજરાતમાં આગામી 3 દિવસ વરસાદની શક્યતા, અનેક જિલ્લામાં એલર્ટ', slug: '#' },
  ];

  useEffect(() => {
    api
      .get('/breaking-news')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setBreakingItems(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load breaking news:', err))
      .finally(() => setLoading(false));
  }, []);

  const displayList = breakingItems.length > 0
    ? breakingItems.map((b) => ({
        id: b.id,
        title: b.tickerText || b.news?.titleGu,
        slug: `/${b.news?.category?.slug || 'gujarat'}/${b.news?.slug}`,
      }))
    : defaultItems;

  return (
    <div className="bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-3">
        {/* Left: Slanted Red Breaking News Badge */}
        <div className="relative shrink-0">
          <div className="bg-breaking text-white font-gujarati font-extrabold text-xs md:text-sm px-4 py-1.5 rounded-l-md shadow-xs skew-x-[-12deg] inline-block">
            <span className="skew-x-[12deg] inline-block tracking-wide">
              બ્રેકિંગ સમાચાર
            </span>
          </div>
        </div>

        {/* Dynamic Scrolling Headlines */}
        <div className="relative flex-1 overflow-hidden py-1">
          <div className="animate-ticker flex items-center space-x-8 font-gujarati text-xs md:text-[13px] font-bold text-neutral-text hover:text-primary">
            {displayList.map((item, idx) => (
              <Link
                key={item.id || idx}
                href={item.slug}
                className="inline-flex items-center gap-2 hover:text-breaking transition-colors shrink-0"
              >
                <span className="w-2 h-2 rounded-full bg-breaking shrink-0"></span>
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Arrow Controls */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <button
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
            title="Next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;
