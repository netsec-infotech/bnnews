'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  CloudSun,
  Facebook,
  Instagram,
  Youtube,
  Search,
  Play,
} from 'lucide-react';
import BrandLogo from '../common/BrandLogo';

export const Header: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState('બુધવાર, 12 નવેમ્બર 2026');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    try {
      setCurrentDate(now.toLocaleDateString('gu-IN', options));
    } catch {
      setCurrentDate('બુધવાર, 12 નવેમ્બર 2026');
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 py-3.5 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Brand Logo & Slogan */}
        <BrandLogo size="md" />

        {/* Right Column: Meta Bar (Top) & Search/Live TV (Bottom) */}
        <div className="flex flex-col items-center lg:items-end gap-3 w-full lg:w-auto">
          {/* Top Row: Date, Location, Weather, Social Icons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 md:gap-5 text-xs text-gray-700 font-gujarati">
            {/* Date */}
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{currentDate}</span>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-gray-500" />
              <span>વડોદરા, ગુજરાત</span>
            </div>

            {/* Weather */}
            <div className="flex items-center gap-1 font-medium text-amber-600">
              <CloudSun className="w-4 h-4 text-amber-500" />
              <span className="font-sans font-bold text-gray-800">28°C</span>
            </div>

            {/* Social Icons matching user profiles */}
            <div className="flex items-center gap-2">
              <a
                href="https://www.facebook.com/share/1DvY4dAr2u/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5 fill-white" />
              </a>
              <a
                href="https://www.instagram.com/bnnewsgujarati?rpxt=bWIycTZlb3lkbmYw"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://youtube.com/@bnnewsgujarati2323?si=9nlsu3gkoakzvzIG"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                title="YouTube"
              >
                <Youtube className="w-3.5 h-3.5 fill-white" />
              </a>
            </div>
          </div>

          {/* Bottom Row: Search Box & Red Live TV Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
            {/* Search Box */}
            <form onSubmit={handleSearch} className="flex items-stretch w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="સમાચાર શોધો..."
                className="w-full pl-3.5 pr-2 py-1.5 border border-r-0 border-gray-300 rounded-l-md text-xs font-gujarati focus:outline-none focus:border-primary bg-white text-gray-800"
              />
              <button
                type="submit"
                className="px-3.5 bg-primary hover:bg-primary-dark text-white rounded-r-md transition-colors flex items-center justify-center"
                title="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Red Live TV Button */}
            <Link
              href="/live-tv"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-breaking hover:bg-breaking-dark text-white font-sans font-bold text-xs tracking-wide shadow-sm transition-all whitespace-nowrap"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Live TV</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
