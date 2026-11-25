'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Target,
  Eye,
  Gem,
  Clock,
  Video,
  MapPin,
  Users,
  ShieldCheck,
  Smartphone,
  Radio,
  Tv,
  Globe,
  TrendingUp,
  Trophy,
  Film,
  HeartPulse,
  GraduationCap,
  Play,
  Flame,
} from 'lucide-react';
import api from '../../../lib/api';

export default function AboutUsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const map: Record<string, string> = {};
          res.data.data.forEach((s: any) => {
            map[s.key] = s.value;
          });
          setSettings(map);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const introDesc1 =
    settings.about_story ||
    'BN News Gujarati એ ગુજરાતનું એક વિશ્વસનીય અને ઝડપગતિથી વિકાસશીલ ડિજિટલ ન્યૂઝ પ્લેટફોર્મ છે, જે 24x7 ગુજરાત, ભારત અને વિશ્વભરના મહત્વપૂર્ણ સમાચાર, વિશ્લેષણ, ગ્રાઉન્ડ રિપોર્ટ અને લોકલ અપડેટ્સને ગુજરાતીમાં રજૂ કરે છે.';

  const introDesc2 =
    settings.about_tagline ||
    'અમારો ધ્યેય છે – સચોટ, નિષ્પક્ષ અને તાત્કાલિક માહિતી દરેક વાચક સુધી પહોંચાડવું, જેથી સમાજમાં જાગૃતિ, પારદર્શિતા અને જવાબદારી વધારો થાય.';

  const missionText =
    settings.about_mission ||
    'સચોટ, ઝડપી અને વિશ્વસનીય સમાચાર ગુજરાતની દરેક જનતા સુધી પહોંચાડવા. કોઈપણ પક્ષપાત વગર ગ્રાઉન્ડ લેવલની વાસ્તવિકતા અને લોકોના અવાજને મુખ્યધારા સુધી લાવવું, પત્રકારત્વની પવિત્રતા જાળવવી અને સમાજના છેવાડાના માનવી સુધી સાચી માહિતી પહોંચાડવી.';

  const visionText =
    settings.about_vision ||
    'ગુજરાતનું સૌથી વિશ્વસનીય અને લોકપ્રિય ડિજિટલ ન્યૂઝ નેટવર્ક બનવું. આધુનિક ટેકનોલોજી, મોબાઇલ ફર્સ્ટ વિડિયો-રીલ્સ અને પત્રકારત્વના ઉચ્ચ આદર્શો સાથે સતત ૨૪ કલાક અગ્રેસર રહીને વિશ્વભરના કરોડો ગુજરાતીઓને જોડવું.';

  const valuesText =
    settings.about_values ||
    'સત્યતા • નિષ્પક્ષતા • પારદર્શિતા • જનહિત • સામાજિક જવાબદારી • નૈતિક પત્રકારત્વ અને વાચકોનો અતૂટ વિશ્વાસ.';

  return (
    <div className="font-gujarati space-y-10 pb-16">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BANNER (EXACT TO REFERENCE SCREENSHOT)       */}
      {/* ========================================================= */}
      <section className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56 max-h-[220px] overflow-hidden bg-[#101738] shadow-sm border-b border-blue-950 m-0 p-0">
        <img
          src="/banners/about_banner.png"
          alt="અમારા વિશે - About Us - BN News Gujarati"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* ========================================================= */}
        {/* 2. ABOUT BN NEWS GUJARATI (HERO INTRODUCTION BOX)         */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-[#E4E7EF] p-6 md:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-5 h-1 bg-[#ED1C2E] rounded-full inline-block" />
                <span className="text-xs md:text-sm font-black text-[#202A72] tracking-wider uppercase">
                  BN NEWS ગુજરાતી
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#171B32] leading-tight">
                તમારા વિસ્તારની, તમારા ભાષામાં{' '}
                <span className="text-[#ED1C2E]">વિશ્વસનીય ખબર</span>
              </h1>

              <p className="text-xs sm:text-sm text-[#687085] leading-relaxed font-medium">
                {introDesc1}
              </p>

              <p className="text-xs sm:text-sm text-[#687085] leading-relaxed font-medium">
                {introDesc2}
              </p>
            </div>

            {/* Right: Studio Newsroom Visual with Red Corner Accents */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative p-2 rounded-2xl before:absolute before:top-0 before:right-0 before:w-10 before:h-10 before:border-t-4 before:border-r-4 before:border-[#ED1C2E] before:rounded-tr-2xl after:absolute after:bottom-0 after:left-0 after:w-10 after:h-10 after:border-b-4 after:border-l-4 after:border-[#ED1C2E] after:rounded-bl-2xl w-full max-w-md">
                <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-200 aspect-[16/11] bg-gray-950 group">
                  <img
                    src="/images/about/studio_newsroom.jpg"
                    alt="BN News Gujarati Studio Newsroom"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="w-12 h-12 rounded-full bg-white/95 text-[#ED1C2E] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-[#ED1C2E] ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 3. MISSION, VISION & VALUES (3 EXPANDED COLORFUL CARDS)   */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: અમારું મિશન (Red Theme) */}
          <div className="bg-[#FFF5F5] rounded-2xl border border-red-100 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-red-100 text-[#ED1C2E] flex items-center justify-center shrink-0">
                <Target className="w-5 h-5 text-[#ED1C2E]" />
              </div>
              <h2 className="text-base font-black text-[#ED1C2E]">અમારું મિશન</h2>
            </div>
            <p className="text-xs text-[#525B75] leading-relaxed font-medium">
              {missionText}
            </p>
          </div>

          {/* Card 2: અમારું વિઝન (Amber/Orange Theme) */}
          <div className="bg-[#FFF9F2] rounded-2xl border border-amber-100 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-[#F58220] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5 text-[#F58220]" />
              </div>
              <h2 className="text-base font-black text-[#F58220]">અમારું વિઝન</h2>
            </div>
            <p className="text-xs text-[#525B75] leading-relaxed font-medium">
              {visionText}
            </p>
          </div>

          {/* Card 3: અમારા મૂલ્યો (Blue Theme) */}
          <div className="bg-[#F0F4FF] rounded-2xl border border-blue-100 p-6 shadow-xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#202A72] flex items-center justify-center shrink-0">
                <Gem className="w-5 h-5 text-[#202A72]" />
              </div>
              <h2 className="text-base font-black text-[#202A72]">અમારા મૂલ્યો</h2>
            </div>
            <p className="text-xs text-[#525B75] leading-relaxed font-bold tracking-wide">
              {valuesText}
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 4. BN NEWS GUJARATI કેમ? & એક નજરમાં                      */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: BN News Gujarati કેમ? (6 Features Grid) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E4E7EF] p-6 md:p-8 shadow-xs flex flex-col justify-between space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ED1C2E] rounded-full inline-block" />
              <h2 className="text-lg md:text-xl font-bold text-[#171B32]">
                BN News Gujarati કેમ?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-[#ED1C2E] flex items-center justify-center shrink-0 mt-0.5">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">24x7 અપડેટ</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">દિવસ-રાત તાજા સમાચાર</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F58220] flex items-center justify-center shrink-0 mt-0.5">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">વિડિયો અને રીલ્સ</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">ઝડપી અને દ્રશ્યમાન સમાચાર</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#202A72] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">સ્થાનિકથી વૈશ્વિક</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">તમારા વિસ્તારથી વિશ્વ સુધી</p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">અનુભવી રિપોર્ટર્સ ટીમ</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">ગ્રાઉન્ડ પરની વાસ્તવિક ખબર</p>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">વિશ્વસનીયતા</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">તથ્ય આધારિત, ચકાસેલી માહિતી</p>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-gray-50/80 border border-gray-100">
                <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">ડિજિટલ પ્લેટફોર્મ</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">વેબ, મોબાઇલ અને સોશિયલ મીડિયા પર</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: BN News Gujarati એક નજરમાં (Dark Navy Stats Card) */}
          <div className="lg:col-span-5 bg-[#141C48] text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Radio className="w-6 h-6 text-accent-gold animate-pulse" />
                <h2 className="text-lg md:text-xl font-black text-white">
                  BN News Gujarati એક નજરમાં
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Stat 1 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                  <Radio className="w-5 h-5 text-accent-gold mx-auto" />
                  <div className="text-xl md:text-2xl font-black text-white">24x7</div>
                  <p className="text-[11px] text-gray-300 font-bold">સમાચાર કવરેજ</p>
                </div>

                {/* Stat 2 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                  <Users className="w-5 h-5 text-accent-gold mx-auto" />
                  <div className="text-xl md:text-2xl font-black text-white">50+</div>
                  <p className="text-[11px] text-gray-300 font-bold">રિપોર્ટર્સ નેટવર્ક</p>
                </div>

                {/* Stat 3 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                  <Play className="w-5 h-5 text-accent-gold mx-auto fill-accent-gold" />
                  <div className="text-xl md:text-2xl font-black text-white">1M+</div>
                  <p className="text-[11px] text-gray-300 font-bold">ડિજિટલ વ્યુઅર્સ</p>
                </div>

                {/* Stat 4 */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
                  <Globe className="w-5 h-5 text-accent-gold mx-auto" />
                  <div className="text-xl md:text-2xl font-black text-white">10+</div>
                  <p className="text-[11px] text-gray-300 font-bold">સમાચાર કેટેગરી</p>
                </div>
              </div>
            </div>

            {/* Decorative bottom bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#ED1C2E] via-[#F58220] to-[#FFD600] rounded-full mt-4" />
          </div>
        </section>

        {/* ========================================================= */}
        {/* 5. અમે શું કવર કરીએ છીએ? (WHAT WE COVER - CATEGORY TILES) */}
        {/* ========================================================= */}
        <section className="bg-white rounded-3xl border border-[#E4E7EF] p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-5 h-1 bg-[#ED1C2E] rounded-full inline-block" />
            <h2 className="text-xl md:text-2xl font-black text-[#171B32]">
              અમે શું કવર કરીએ છીએ?
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Studio Camera */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-[4/3] bg-gray-900 group">
                <img
                  src="/images/about/studio_camera.jpg"
                  alt="Broadcast Studio Camera"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Right 8 Category Cards */}
            <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Cat 1: ગુજરાત સમાચાર */}
              <Link
                href="/category/gujarat"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-orange-50/60 border border-orange-100 hover:border-orange-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-orange-100 text-[#F58220] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <MapPin className="w-5 h-5 text-[#F58220]" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  ગુજરાત સમાચાર
                </span>
              </Link>

              {/* Cat 2: ભારત સમાચાર */}
              <Link
                href="/category/india"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 text-[#202A72] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Radio className="w-5 h-5 text-[#202A72]" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  ભારત સમાચાર
                </span>
              </Link>

              {/* Cat 3: વિશ્વ સમાચાર */}
              <Link
                href="/category/world"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 hover:border-sky-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5 text-sky-600" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  વિશ્વ સમાચાર
                </span>
              </Link>

              {/* Cat 4: વ્યાપાર અને બજાર */}
              <Link
                href="/category/business"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 hover:border-purple-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-purple-700" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  વ્યાપાર અને બજાર
                </span>
              </Link>

              {/* Cat 5: રમતગમત */}
              <Link
                href="/category/sports"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 hover:border-amber-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 text-[#F58220] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-[#F58220]" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  રમતગમત
                </span>
              </Link>

              {/* Cat 6: મનોરંજન */}
              <Link
                href="/category/entertainment"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 hover:border-indigo-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Film className="w-5 h-5 text-indigo-700" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  મનોરંજન
                </span>
              </Link>

              {/* Cat 7: આરોગ્ય */}
              <Link
                href="/category/health"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 hover:border-rose-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 text-[#ED1C2E] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-5 h-5 text-[#ED1C2E]" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  આરોગ્ય
                </span>
              </Link>

              {/* Cat 8: શિક્ષણ */}
              <Link
                href="/category/education"
                className="flex flex-col items-center justify-center text-center p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 hover:border-teal-300 hover:shadow-xs transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <GraduationCap className="w-5 h-5 text-teal-700" />
                </div>
                <span className="text-xs font-bold text-gray-800 group-hover:text-primary">
                  શિક્ષણ
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
