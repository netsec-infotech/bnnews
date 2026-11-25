'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Newspaper,
  Calendar,
  Globe,
  Share2,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Clock,
  ArrowLeft,
  Award,
} from 'lucide-react';
import { Reporter, NewsArticle } from '../../../../lib/types';
import api from '../../../../lib/api';
import { getMediaUrl } from '../../../../lib/media';

export default function ReporterProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [reporter, setReporter] = useState<Reporter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    api
      .get(`/reporters/${slug}`)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          setReporter(res.data.data);
        } else {
          setError('રિપોર્ટર પ્રોફાઇલ મળી નથી.');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'પ્રોફાઇલ લોડ કરતી વખતે ભૂલ થઈ.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 animate-pulse space-y-6 font-gujarati">
        <div className="h-64 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
          <div className="h-48 bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !reporter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4 font-gujarati">
        <h2 className="text-2xl font-bold text-gray-800">{error || 'પ્રોફાઇલ અસ્તિત્વમાં નથી.'}</h2>
        <Link
          href="/reporters"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>તમામ રિપોર્ટર્સ જુઓ</span>
        </Link>
      </div>
    );
  }

  const social = (reporter.socialLinks || {}) as Record<string, string>;
  const articles = (reporter.news || []) as NewsArticle[];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-gujarati space-y-8">
      {/* Breadcrumb & Back */}
      <div>
        <Link
          href="/reporters"
          className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>અમારા પત્રકારો (All Reporters)</span>
        </Link>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          {/* Avatar */}
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-4 border-blue-50 shadow-md flex-shrink-0 bg-gray-100">
            {reporter.profileImage ? (
              <img
                src={getMediaUrl(reporter.profileImage)}
                alt={reporter.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 text-primary font-black text-4xl flex items-center justify-center">
                {reporter?.name ? reporter.name.charAt(0) : 'R'}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900">
                {reporter.name}
              </h1>
              {reporter.isFeatured && (
                <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  વિશેષ સંવાદદાતા
                </span>
              )}
            </div>

            <p className="text-sm md:text-base font-bold text-primary">
              {reporter.designation}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-gray-600">
              {reporter.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" />
                  <span>{reporter.location}</span>
                </span>
              )}

              {reporter.experience && (
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>અનુભવ: {reporter.experience}</span>
                </span>
              )}

              {reporter.languages && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>ભાષાઓ: {reporter.languages}</span>
                </span>
              )}
            </div>

            {reporter.biography && (
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed max-w-3xl pt-2">
                {reporter.biography}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center justify-center md:justify-start gap-2.5 pt-3">
              {social.facebook && (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-black hover:text-white transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {social.instagram && (
                <a
                  href={social.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-600 hover:text-white transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {social.youtube && (
                <a
                  href={social.youtube}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reporter's Articles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-primary pb-2">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" />
            <span>{reporter.name} દ્વારા પ્રકાશિત અહેવાલો ({articles.length})</span>
          </h2>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500 text-xs">
            આ પત્રકાર દ્વારા હજુ સુધી કોઈ અહેવાલ પ્રકાશિત થયેલ નથી.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {articles.map((art) => (
              <article
                key={art.id}
                className="bg-white rounded-xl border border-gray-200/90 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col group"
              >
                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                  {art.featuredImage ? (
                    <img
                      src={art.featuredImage}
                      alt={art.titleGu}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      BN NEWS
                    </div>
                  )}

                  {art.category && (
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                      {art.category.nameGu}
                    </span>
                  )}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <h3 className="font-bold text-xs md:text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                    <Link href={`/${art.category?.slug || 'gujarat'}/${art.slug}`}>
                      {art.titleGu}
                    </Link>
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
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
      </div>
    </div>
  );
}
