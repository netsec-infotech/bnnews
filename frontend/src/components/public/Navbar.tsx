'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ChevronDown, Menu, X, Video, Film, Users, PhoneCall, Newspaper } from 'lucide-react';
import api from '../../lib/api';

export interface DynamicCategoryItem {
  id: string;
  name: string;
  nameGu: string;
  slug: string;
  isSubmenu?: boolean;
  openInNewTab?: boolean;
  children?: DynamicCategoryItem[];
}

export const NAV_CATEGORIES = [
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
  { name: 'રિપોર્ટર્સ', slug: 'reporters' },
  { name: 'અમારી ટીમ', slug: 'our-team' },
  { name: 'વીડિયો', slug: 'video-news' },
  { name: 'રીલ્સ', slug: 'reels' },
];

const DEFAULT_CATEGORIES: DynamicCategoryItem[] = [
  { id: '1', name: 'Gujarat', nameGu: 'ગુજરાત', slug: 'gujarat', isSubmenu: false },
  { id: '2', name: 'India', nameGu: 'ભારત', slug: 'india' },
  { id: '3', name: 'World', nameGu: 'વિશ્વ', slug: 'world' },
  { id: '4', name: 'Politics', nameGu: 'રાજકારણ', slug: 'politics' },
  { id: '5', name: 'Business', nameGu: 'વ્યાપાર', slug: 'business' },
  { id: '6', name: 'Technology', nameGu: 'ટેકનોલોજી', slug: 'technology' },
  { id: '7', name: 'Sports', nameGu: 'રમતગમત', slug: 'sports' },
  { id: '8', name: 'Entertainment', nameGu: 'મનોરંજન', slug: 'entertainment' },
  { id: '9', name: 'Health', nameGu: 'આરોગ્ય', slug: 'health' },
  { id: '10', name: 'Education', nameGu: 'શિક્ષણ', slug: 'education' },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<DynamicCategoryItem[]>(DEFAULT_CATEGORIES);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    // Fetch dynamic categories tree from backend
    api
      .get('/navigation')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {
        // Fallback to default categories
      });
  }, []);

  const isActive = (slug?: string) => {
    if (!slug) return pathname === '/';
    return pathname === `/${slug}` || pathname.startsWith(`/${slug}/`);
  };

  return (
    <nav className="bg-[#202B78] text-white sticky top-0 z-40 shadow-md border-t border-blue-900/40 font-gujarati">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-11">
          {/* Left: Home & Main Nav */}
          <div className="flex items-center space-x-1 md:space-x-1.5 text-xs md:text-sm font-bold">
            {/* Home Icon */}
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
            <div className="hidden lg:flex items-center space-x-0.5 text-[13px] font-bold">
              {categories.slice(0, 8).map((cat) => {
                const active = isActive(cat.slug);
                const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;

                return (
                  <div
                    key={cat.id || cat.slug}
                    className="relative group"
                    onMouseEnter={() => hasChildren && setActiveDropdown(cat.id)}
                    onMouseLeave={() => hasChildren && setActiveDropdown(null)}
                  >
                    <Link
                      href={`/${cat.slug}`}
                      target={cat.openInNewTab ? '_blank' : '_self'}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                        active
                          ? 'bg-white text-[#202B78] font-black shadow-sm ring-1 ring-black/5'
                          : 'text-gray-100 hover:text-white hover:bg-white/15'
                      }`}
                    >
                      <span>{cat.nameGu || cat.name}</span>
                      {hasChildren && (
                        <ChevronDown
                          className={`w-3 h-3 transition-transform group-hover:rotate-180 ${
                            active ? 'text-[#202B78]' : 'text-gray-300'
                          }`}
                        />
                      )}
                    </Link>

                    {/* Submenu Dropdown */}
                    {hasChildren && (
                      <div className="absolute left-0 top-full hidden group-hover:block pt-1 z-50 min-w-[180px] animate-fadeIn">
                        <div className="bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                          {cat.children!.map((sub) => (
                            <Link
                              key={sub.id || sub.slug}
                              href={`/${sub.slug}`}
                              target={sub.openInNewTab ? '_blank' : '_self'}
                              className={`block px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-primary transition-colors ${
                                isActive(sub.slug) ? 'bg-blue-50 text-primary font-bold' : ''
                              }`}
                            >
                              {sub.nameGu || sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Extra Categories Dropdown (if more than 8 categories) */}
              {categories.length > 8 && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-gray-100 hover:text-white hover:bg-white/15 transition-all text-[13px] font-bold"
                  >
                    <span>વધુ</span>
                    <ChevronDown className="w-3 h-3 text-gray-300 transition-transform group-hover:rotate-180" />
                  </button>

                  <div className="absolute left-0 top-full hidden group-hover:block pt-1 z-50 min-w-[170px] animate-fadeIn">
                    <div className="bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-1.5 overflow-hidden">
                      {categories.slice(8).map((cat) => (
                        <Link
                          key={cat.id || cat.slug}
                          href={`/${cat.slug}`}
                          className="block px-3.5 py-2 text-xs font-semibold hover:bg-blue-50 hover:text-primary transition-colors"
                        >
                          {cat.nameGu || cat.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Public Links */}
              <Link
                href="/video-news"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive('video-news')
                    ? 'bg-white text-[#202B78] font-black shadow-sm'
                    : 'text-gray-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <Video className="w-3.5 h-3.5 text-secondary" />
                <span>વીડિયો</span>
              </Link>

              <Link
                href="/reels"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive('reels')
                    ? 'bg-white text-[#202B78] font-black shadow-sm'
                    : 'text-gray-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <Film className="w-3.5 h-3.5 text-pink-400" />
                <span>રીલ્સ</span>
              </Link>

              <Link
                href="/reporters"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive('reporters') || isActive('reporter')
                    ? 'bg-white text-[#202B78] font-black shadow-sm'
                    : 'text-gray-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-yellow-300" />
                <span>રિપોર્ટર્સ</span>
              </Link>

              <Link
                href="/e-paper"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive('e-paper')
                    ? 'bg-white text-[#202B78] font-black shadow-sm'
                    : 'text-gray-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5 text-amber-300" />
                <span>ઈ-પેપર</span>
              </Link>

              <Link
                href="/contact-us"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all duration-200 whitespace-nowrap ${
                  isActive('contact-us') || isActive('contact')
                    ? 'bg-white text-[#202B78] font-black shadow-sm'
                    : 'text-gray-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>સંપર્ક</span>
              </Link>
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
        <div className="lg:hidden bg-[#151d52] border-t border-blue-900 px-4 py-3 space-y-1 text-xs animate-fadeIn max-h-[80vh] overflow-y-auto">
          {categories.map((cat) => {
            const active = isActive(cat.slug);
            const hasChildren = Array.isArray(cat.children) && cat.children.length > 0;

            return (
              <div key={cat.id || cat.slug}>
                <Link
                  href={`/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg font-bold transition-all ${
                    active ? 'bg-white text-[#202B78]' : 'text-gray-100 hover:bg-white/10'
                  }`}
                >
                  {cat.nameGu || cat.name}
                </Link>

                {/* Subcategories indented */}
                {hasChildren && (
                  <div className="pl-4 space-y-1 py-1 border-l border-blue-800 ml-3">
                    {cat.children!.map((sub) => (
                      <Link
                        key={sub.id || sub.slug}
                        href={`/${sub.slug}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-2.5 py-1.5 text-[11px] text-gray-300 hover:text-white font-medium"
                      >
                        • {sub.nameGu || sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          <div className="pt-2 border-t border-blue-800 space-y-1">
            <Link
              href="/video-news"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-gray-100 hover:bg-white/10"
            >
              <Video className="w-4 h-4 text-secondary" />
              <span>વિડિયો સમાચાર (Video News)</span>
            </Link>

            <Link
              href="/reels"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-gray-100 hover:bg-white/10"
            >
              <Film className="w-4 h-4 text-pink-400" />
              <span>શોર્ટ રીલ્સ (Short Reels)</span>
            </Link>

            <Link
              href="/reporters"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-gray-100 hover:bg-white/10"
            >
              <Users className="w-4 h-4 text-yellow-300" />
              <span>અમારા રિપોર્ટર્સ (Our Reporters)</span>
            </Link>

            <Link
              href="/e-paper"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-gray-100 hover:bg-white/10"
            >
              <Newspaper className="w-4 h-4 text-amber-300" />
              <span>ઈ-પેપર (E-Paper)</span>
            </Link>

            <Link
              href="/about-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-semibold text-gray-300 hover:text-white"
            >
              અમારા વિશે (About Us)
            </Link>

            <Link
              href="/contact-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg font-semibold text-gray-300 hover:text-white"
            >
              સંપર્ક કરો (Contact Us)
            </Link>
          </div>

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
