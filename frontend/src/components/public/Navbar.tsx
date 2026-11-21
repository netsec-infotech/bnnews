'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronDown, Menu, X } from 'lucide-react';

export interface NavCategoryItem {
  name: string;
  slug: string;
  hasSubmenu?: boolean;
}

export const NAV_CATEGORIES: NavCategoryItem[] = [
  { name: 'ગુજરાત', slug: 'gujarat', hasSubmenu: true },
  { name: 'ભારત', slug: 'india' },
  { name: 'વિશ્વ', slug: 'world' },
  { name: 'રાજકારણ', slug: 'politics' },
  { name: 'વ્યાપાર', slug: 'business' },
  { name: 'ટેકનોલોજી', slug: 'technology' },
  { name: 'રમતગમત', slug: 'sports' },
  { name: 'મનોરંજન', slug: 'entertainment' },
  { name: 'આરોગ્ય', slug: 'health' },
  { name: 'શિક્ષણ', slug: 'education' },
  { name: 'અમારી ટીમ', slug: 'our-team' },
  { name: 'વીડિયો', slug: 'videos' },
  { name: 'રીલ્સ', slug: 'reels' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (slug?: string) => {
    if (!slug) return pathname === '/';
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  };

  return (
    <nav className="bg-[#202B78] text-white sticky top-0 z-40 shadow-md border-t border-blue-900/40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          {/* Left: Home Icon Button */}
          <div className="flex items-center space-x-1 md:space-x-1.5 font-gujarati text-xs md:text-sm font-bold">
            <Link
              href="/"
              className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                isActive()
                  ? 'bg-white text-[#202B78] shadow-sm font-black'
                  : 'text-gray-200 hover:text-white hover:bg-white/15'
              }`}
              title="મુખ્ય પૃષ્ઠ (Home)"
            >
              <Home className={`w-4 h-4 ${isActive() ? 'fill-[#202B78] text-[#202B78]' : 'fill-white'}`} />
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-1 font-gujarati text-[13px] font-bold">
              {NAV_CATEGORIES.map((cat) => {
                const active = isActive(cat.slug);
                return (
                  <Link
                    key={cat.slug}
                    href={`/${cat.slug}`}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                      active
                        ? 'bg-white text-[#202B78] font-black shadow-sm ring-1 ring-black/5'
                        : 'text-gray-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {cat.hasSubmenu && (
                      <ChevronDown
                        className={`w-3 h-3 ${active ? 'text-[#202B78]' : 'text-gray-300'}`}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Hamburger / Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg hover:bg-white/15 text-white transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#151d52] border-t border-blue-900 px-4 py-3 space-y-1 font-gujarati animate-fadeIn">
          {NAV_CATEGORIES.map((cat) => {
            const active = isActive(cat.slug);
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                  active ? 'bg-white text-[#202B78]' : 'text-gray-100 hover:bg-white/10'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-blue-900 mt-2 flex items-center justify-between">
            <Link
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="text-xs text-gray-300 hover:text-white"
            >
              સંપાદકીય લૉગિન (CMS Login)
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
