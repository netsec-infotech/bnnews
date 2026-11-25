'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MapPin, Newspaper, ChevronRight, User } from 'lucide-react';
import { Reporter } from '../../../lib/types';
import api from '../../../lib/api';
import { getMediaUrl } from '../../../lib/media';

export default function ReportersDirectoryPage() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    api
      .get('/reporters')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          setReporters(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="font-gujarati space-y-8 pb-16">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BANNER (FULL WIDTH WITH BLACK OPACITY)       */}
      {/* ========================================================= */}
      <section className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56 max-h-[220px] overflow-hidden bg-[#101738] shadow-sm border-b border-blue-950 m-0 p-0">
        <img
          src="/banners/reporters_banner.png"
          alt="અમારા રિપોર્ટરો - Our Reporters - BN News Gujarati"
          className="w-full h-full object-cover object-center"
        />
        {/* Black opacity overlay */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </section>

      {/* ========================================================= */}
      {/* 2. REPORTERS DIRECTORY GRID CONTAINER                     */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse space-y-4">
                <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : reporters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            કોઈ રિપોર્ટર માહિતી ઉપલબ્ધ નથી.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {reporters.map((rep) => {
              const articleCount = rep._count?.news || 0;
              const hasImgError = Boolean(imageErrors[rep.id]);
              const mediaSrc = getMediaUrl(rep.profileImage);

              return (
                <div
                  key={rep.id}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 p-5 flex flex-col items-center text-center relative group overflow-hidden"
                >
                  {/* Top Corner Badge for Featured */}
                  {rep.isFeatured && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      વિશેષ
                    </span>
                  )}

                  {/* Profile Avatar */}
                  <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-all p-1 bg-gray-50 shadow-inner flex items-center justify-center">
                    {mediaSrc && !hasImgError ? (
                      <img
                        src={mediaSrc}
                        alt={rep.name}
                        onError={() => setImageErrors((prev) => ({ ...prev, [rep.id]: true }))}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-primary font-bold shadow-inner">
                        <User className="w-10 h-10 text-primary/60" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <h3 className="font-bold text-base text-gray-900 group-hover:text-primary transition-colors">
                    {rep.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">
                    {rep.designation}
                  </p>

                  {rep.location && (
                    <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1.5">
                      <MapPin className="w-3 h-3 text-red-500" />
                      <span>{rep.location}</span>
                    </p>
                  )}

                  {rep.biography && (
                    <p className="text-xs text-gray-600 mt-3 line-clamp-2 leading-relaxed">
                      {rep.biography}
                    </p>
                  )}

                  {/* Article count pill */}
                  <div className="mt-4 pt-3 border-t border-gray-100 w-full flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Newspaper className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-bold text-gray-800">{articleCount}</span> સમાચાર
                    </span>

                    <Link
                      href={`/reporter/${rep.slug}`}
                      className="inline-flex items-center gap-1 text-primary font-bold hover:underline text-xs"
                    >
                      <span>પ્રોફાઇલ</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
