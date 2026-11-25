'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Calendar,
  MapPin,
  Download,
  ZoomIn,
  Share2,
  Clock,
  BookOpen,
  Bell,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const EDITIONS = [
  { id: 'vadodara', name: 'વડોદરા આવૃત્તિ', label: 'Vadodara Edition', badge: 'મુખ્ય આવૃત્તિ' },
  { id: 'ahmedabad', name: 'અમદાવાદ આવૃત્તિ', label: 'Ahmedabad Edition' },
  { id: 'surat', name: 'સુરત આવૃત્તિ', label: 'Surat Edition' },
  { id: 'rajkot', name: 'રાજકોટ આવૃત્તિ', label: 'Rajkot Edition' },
  { id: 'gandhinagar', name: 'ગાંધીનગર આવૃત્તિ', label: 'Gandhinagar Edition' },
];

export default function EPaperPage() {
  const [selectedEdition, setSelectedEdition] = useState('vadodara');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);

  const activeEdition = EDITIONS.find((e) => e.id === selectedEdition) || EDITIONS[0];

  const formattedDate = new Date(selectedDate).toLocaleDateString('gu-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="font-gujarati space-y-8 pb-16">
      {/* ========================================================= */}
      {/* 1. FULL-WIDTH HEADER BANNER (0 LEFT/RIGHT MARGIN)         */}
      {/* ========================================================= */}
      <section className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56 max-h-[220px] overflow-hidden bg-gradient-to-r from-[#101738] via-[#202A72] to-[#171F50] shadow-sm border-b border-blue-950 m-0 p-0 flex items-center">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, #F58220 0%, transparent 45%), radial-gradient(circle at 80% 30%, #ED1C2E 0%, transparent 40%)',
          }}
        />
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />

        <div className="relative z-10 max-w-7xl w-full mx-auto px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-blue-200 font-medium">
              <Link href="/" className="hover:text-white transition-colors">
                હોમ
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-accent-gold font-bold">ઈ-પેપર (E-Paper)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight flex items-center gap-3">
              <span className="w-1.5 h-8 bg-[#ED1C2E] rounded-full inline-block" />
              <span>BN News ગુજરાતી — ઈ-પેપર (E-Paper)</span>
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl">
              દરરોજ સવારે ડિજિટલ અખબાર સીધું તમારા મોબાઈલ અને કોમ્પ્યુટર પર વાંચો
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2.5 bg-white/10 backdrop-blur-xs border border-white/20 px-4 py-2.5 rounded-2xl">
            <Newspaper className="w-6 h-6 text-accent-gold" />
            <div className="text-xs">
              <p className="font-bold text-white">ડિજિટલ અખબાર</p>
              <p className="text-blue-200 text-[11px]">{formattedDate}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN E-PAPER BODY (WITH LEFT & RIGHT SPACING)          */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Controls Bar: Edition Selector & Date Picker */}
        <div className="bg-white rounded-2xl border border-gray-200/90 p-4 sm:p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mr-1">
              <MapPin className="w-4 h-4 text-[#ED1C2E]" />
              <span>આવૃત્તિ પસંદ કરો:</span>
            </span>
            {EDITIONS.map((ed) => {
              const active = selectedEdition === ed.id;
              return (
                <button
                  key={ed.id}
                  type="button"
                  onClick={() => setSelectedEdition(ed.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'bg-[#202A72] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200/80'
                  }`}
                >
                  <span>{ed.name}</span>
                  {ed.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        active ? 'bg-[#ED1C2E] text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      મુખ્ય
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2.5 self-start lg:self-auto">
            <label className="text-xs font-bold text-gray-600 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#202A72]" />
              <span>તારીખ:</span>
            </label>
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-800 bg-gray-50 focus:outline-none focus:border-[#202A72] font-sans"
            />
          </div>
        </div>

        {/* E-Paper Interactive Viewer / Coming Soon Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Newspaper Preview Frame (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200/90 shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {activeEdition.name} ({activeEdition.label})
                </span>
                <span className="text-[11px] text-gray-500 hidden sm:inline">
                  • {formattedDate}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 text-[11px] font-bold cursor-not-allowed"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>ઝૂમ</span>
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-400 text-[11px] font-bold cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF ડાઉનલોડ</span>
                </button>
              </div>
            </div>

            {/* Newspaper Sheet Placeholder */}
            <div className="p-6 sm:p-10 bg-gradient-to-b from-gray-100/80 to-gray-50 flex flex-col items-center justify-center min-h-[460px] text-center space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-white shadow-md border border-gray-200 p-2 flex items-center justify-center">
                <img src="/logo.png" alt="BN News Gujarati" className="w-full h-full object-contain" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>ટૂંક સમયમાં શરૂ થઈ રહ્યું છે (Coming Soon)</span>
              </div>

              <div className="max-w-lg space-y-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#171B32]">
                  BN News ગુજરાતી ડિજિટલ ઈ-પેપર
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  અમે અમારું દૈનિક ડિજિટલ અખબાર (E-Paper) અહીં પ્રકાશિત કરવા જઈ રહ્યા છીએ.
                  ટૂંક સમયમાં તમે અહીંથી <strong>{activeEdition.name}</strong> નું સંપૂર્ણ અખબાર પેજ-બાય-પેજ વાંચી શકશો અને PDF ડાઉનલોડ કરી શકશો.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/latest-news"
                  className="inline-flex items-center gap-2 bg-[#202A72] hover:bg-[#171F50] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>તાજા સમાચાર વાંચો</span>
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-[#202A72] border border-gray-300 font-bold text-xs px-5 py-2.5 rounded-xl shadow-2xs transition-colors"
                >
                  <Bell className="w-4 h-4 text-[#ED1C2E]" />
                  <span>જાહેરાત / સબસ્ક્રિપ્શન માટે સંપર્ક</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Features & Info Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white rounded-2xl border border-gray-200/90 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-gray-100">
                <FileText className="w-5 h-5 text-[#ED1C2E]" />
                <h3 className="text-sm font-black text-gray-900">ઈ-પેપરની વિશેષતાઓ</h3>
              </div>

              <ul className="space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#202A72] shrink-0 mt-0.5" />
                  <span>દરરોજ સવારે ૬:૦૦ વાગ્યે નવી દૈનિક આવૃત્તિ અપલોડ થશે.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ZoomIn className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                  <span>હાઈ-રિઝોલ્યુશન પેજ ઝૂમ અને આર્ટીકલ ક્લિપિંગ સુવિધા.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Download className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                  <span>ઓફલાઇન વાંચન માટે સંપૂર્ણ PDF ડાઉનલોડ વિકલ્પ.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Share2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                  <span>વોટ્સએપ અને ફેસબુક પર સીધી કટિંગ શેર કરવાની સુવિધા.</span>
                </li>
              </ul>
            </div>

            {/* Archive Info Box */}
            <div className="bg-gradient-to-br from-[#202A72] to-[#171F50] text-white rounded-2xl p-5 shadow-md space-y-3">
              <h3 className="text-sm font-black flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-accent-gold" />
                <span>પ્રિન્ટ અને ડિજિટલ જાહેરાત</span>
              </h3>
              <p className="text-xs text-blue-100 leading-relaxed">
                BN News ગુજરાતી ઈ-પેપર અને ડિજિટલ પોર્ટલ પર તમારા વ્યવસાયની જાહેરાત આપવા માટે અમારી ટીમનો સંપર્ક કરો.
              </p>
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-1.5 bg-[#ED1C2E] hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors"
              >
                <span>સંપર્ક કરો</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
