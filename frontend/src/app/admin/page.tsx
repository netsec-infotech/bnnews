'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Check,
  Clock,
  FileText,
  Megaphone,
  TrendingUp,
  Calendar,
  Rss,
  ChevronDown,
  ArrowRight,
  ArrowUp,
  X,
  User,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { DashboardData } from '../../lib/types';
import api from '../../lib/api';

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState('છેલ્લા 30 દિવસ');
  const [hoveredPoint, setHoveredPoint] = useState<{ label: string; value: number; x: number; y: number } | null>(null);

  const loadDashboard = () => {
    setLoading(true);
    api
      .get('/admin/dashboard')
      .then((res) => {
        if (res.data?.success) {
          setData(res.data.data);
        }
      })
      .catch((err) => console.error('Dashboard load failed:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // Baseline values mirroring media_1794680900493_5adcbca4.jpg
  const kpi = {
    totalNews: data?.kpi?.totalNews || 1892,
    publishedNews: data?.kpi?.publishedNews || 1564,
    pendingNews: data?.kpi?.pendingNews || 214,
    draftNews: data?.kpi?.draftNews || 48,
    breakingNews: data?.kpi?.breakingNews || 6,
    trendingNews: data?.kpi?.trendingNews || 12,
  };

  const trendPoints = data?.trendPoints || [
    { label: '13 ઑક્ટો', value: 28 },
    { label: '16 ઑક્ટો', value: 38 },
    { label: '19 ઑક્ટો', value: 45 },
    { label: '22 ઑક્ટો', value: 50 },
    { label: '25 ઑક્ટો', value: 47 },
    { label: '28 ઑક્ટો', value: 71 },
    { label: '31 ઑક્ટો', value: 48 },
    { label: '3 નવ', value: 68 },
    { label: '6 નવ', value: 71 },
    { label: '9 નવ', value: 69 },
    { label: '12 નવ', value: 86 },
  ];

  const categoryStats = [
    { name: 'ગુજરાત', percentage: 30.8, color: '#2563eb' },
    { name: 'ભારત', percentage: 19.2, color: '#f59e0b' },
    { name: 'વિશ્વ', percentage: 12.1, color: '#10b981' },
    { name: 'રાજકારણ', percentage: 9.4, color: '#8b5cf6' },
    { name: 'વેપાર', percentage: 7.4, color: '#ef4444' },
    { name: 'ટેકનોલોજી', percentage: 6.2, color: '#06b6d4' },
    { name: 'અન્ય', percentage: 14.9, color: '#94a3b8' },
  ];

  const sevenDays = data?.sevenDaysActivity || {
    newsAdded: 128,
    rssImported: 214,
    publishedNews: 196,
    rejectedNews: 18,
    activeEditors: 4,
  };

  const fallbackImported = [
    {
      id: 'rss-1',
      titleGu: 'ગુજરાતમાં નવી વિકાસ યોજના અંગે સરકારની મહત્વપૂર્ણ જાહેરાત',
      source: 'The Indian Express Gujarati',
      time: '12 નવ, 2026 10:42 AM',
      img: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'rss-2',
      titleGu: 'ISROએ નવા ઉપગ્રહના સફળ પ્રક્ષેપણની જાહેરાત કરી',
      source: 'NDTV Gujarati',
      time: '12 નવ, 2026 09:36 AM',
      img: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'rss-3',
      titleGu: 'ગુજરાતમાં આગામી 3 દિવસ વરસાદની શક્યતા',
      source: 'ABP Asmita',
      time: '12 નવ, 2026 08:20 AM',
      img: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=200&auto=format&fit=crop&q=80',
    },
  ];

  // Helper for generating smooth SVG curve
  const chartWidth = 650;
  const chartHeight = 180;
  const padLeft = 40;
  const padBottom = 30;
  const usableWidth = chartWidth - padLeft - 20;
  const usableHeight = chartHeight - padBottom - 15;

  const points = trendPoints.map((p, idx) => {
    const x = padLeft + (idx / (trendPoints.length - 1)) * usableWidth;
    const y = chartHeight - padBottom - (p.value / 100) * usableHeight;
    return { ...p, x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padBottom} L ${points[0].x} ${chartHeight - padBottom} Z`;

  // SVG Donut calculation
  let cumulativePercent = 0;
  const donutSlices = categoryStats.map((cat) => {
    const strokeDasharray = `${cat.percentage} ${100 - cat.percentage}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += cat.percentage;
    return {
      ...cat,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      {/* ========================================================= */}
      {/* HEADER SECTION: Title & Filter matching Mockup            */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            ડેશબોર્ડ
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            સમાચાર પ્રકાશન, RSS સંગ્રહણ અને વેબસાઇટ પ્રવૃત્તિનું સંક્ષિપ્ત અવલોકન
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Dropdown Filter */}
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer hover:bg-gray-50 transition-colors">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>{selectedRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>

          <button
            onClick={loadDashboard}
            className="p-1.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors shadow-2xs"
            title="રિફ્રેશ કરો"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Failed RSS Feed Alerts (if any) */}
      {data?.failedSources && data.failedSources.length > 0 && (
        <div className="bg-red-50 border-l-4 border-[#E51F2A] p-4 rounded-r-xl">
          <div className="flex items-center gap-2 text-[#E51F2A] font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>ધ્યાન આપો: {data.failedSources.length} RSS સ્ત્રોતમાં ભૂલ નોંધાઈ છે</span>
          </div>
          <div className="mt-2 space-y-1 text-[11px] text-red-800">
            {data.failedSources.map((src) => (
              <div key={src.id} className="flex items-center justify-between">
                <span>• {src.name}: {src.lastError}</span>
                <Link href="/admin/rss-sources" className="text-primary underline font-bold ml-2">
                  તપાસો
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6 TOP KPI CARDS (Matching media_1794680900493_5adcbca4.jpg) */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Card 1: કુલ સમાચાર */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600">કુલ સમાચાર</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {kpi.totalNews.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 2: પ્રકાશિત */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600">પ્રકાશિત</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {kpi.publishedNews.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 3: પેન્ડિંગ સમીક્ષા */}
        <Link
          href="/admin/pending"
          className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600 group-hover:text-amber-600 transition-colors">
              પેન્ડિંગ સમીક્ષા
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {kpi.pendingNews.toLocaleString('en-IN')}
          </p>
        </Link>

        {/* Card 4: ડ્રાફ્ટ */}
        <div className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600">ડ્રાફ્ટ</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {kpi.draftNews.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Card 5: બ્રેકિંગ સમાચાર */}
        <Link
          href="/admin/breaking"
          className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-red-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600 group-hover:text-red-600 transition-colors">
              બ્રેકિંગ સમાચાર
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E51F2A] text-white flex items-center justify-center shadow-xs">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {kpi.breakingNews.toLocaleString('en-IN')}
          </p>
        </Link>

        {/* Card 6: ટ્રેન્ડિંગ સમાચાર */}
        <Link
          href="/admin/trending"
          className="bg-white rounded-xl p-4 border border-gray-200/80 shadow-xs flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-600 group-hover:text-blue-600 transition-colors">
              ટ્રેન્ડિંગ સમાચાર
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 tracking-tight">
            {kpi.trendingNews.toLocaleString('en-IN')}
          </p>
        </Link>
      </div>

      {/* ========================================================= */}
      {/* MIDDLE ROW: AREA TREND CHART & CATEGORY DONUT CHART        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: સમાચાર પ્રકાશનનો ટ્રેન્ડ (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-gray-100">
            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">
              સમાચાર પ્રકાશનનો ટ્રેન્ડ
            </h2>
          </div>

          <div className="relative w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 select-none"
            >
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines & Y-labels */}
              {[0, 20, 40, 60, 80, 100].map((val) => {
                const y = chartHeight - padBottom - (val / 100) * usableHeight;
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - 10}
                      y2={y}
                      stroke="#f1f5f9"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="sans-serif"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={areaD} fill="url(#areaGradient)" />

              {/* Line path */}
              <path
                d={pathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points & X-labels */}
              {points.map((pt, i) => (
                <g key={i} className="cursor-pointer">
                  {/* Outer circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="hover:r-6 transition-all"
                  />

                  {/* X label */}
                  <text
                    x={pt.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#64748b"
                    fontWeight="500"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}

              {/* Tooltip */}
              {hoveredPoint && (
                <g>
                  <rect
                    x={hoveredPoint.x - 30}
                    y={hoveredPoint.y - 28}
                    width="60"
                    height="20"
                    rx="4"
                    fill="#1e293b"
                  />
                  <text
                    x={hoveredPoint.x}
                    y={hoveredPoint.y - 15}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#ffffff"
                    fontWeight="bold"
                  >
                    {hoveredPoint.value}
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right: કેટેગરી મુજબ સમાચાર (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 mb-2 border-b border-gray-100">
            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">
              કેટેગરી મુજબ સમાચાર
            </h2>
          </div>

          <div className="flex items-center gap-4 py-2">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 42 42" className="w-full h-full -rotate-90">
                <circle
                  cx="21"
                  cy="21"
                  r="15.91549430918954"
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="6"
                />
                {donutSlices.map((slice, i) => (
                  <circle
                    key={i}
                    cx="21"
                    cy="21"
                    r="15.91549430918954"
                    fill="transparent"
                    stroke={slice.color}
                    strokeWidth="6"
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                  />
                ))}
              </svg>

              {/* Center Donut Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-base font-black text-gray-900 leading-none">
                  {kpi.totalNews.toLocaleString('en-IN')}
                </span>
                <span className="text-[9px] text-gray-500 font-medium mt-0.5">
                  કુલ સમાચાર
                </span>
              </div>
            </div>

            {/* Category Percent Legend */}
            <div className="flex-1 space-y-1 text-xs">
              {categoryStats.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-700 font-medium truncate text-[11px]">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-900 text-[11px] font-mono">
                    {cat.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* BOTTOM ROW: RECENT RSS IMPORTS & 7-DAY ACTIVITY           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: તાજેતરના RSS આયાત થયેલા સમાચાર (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center">
                <Rss className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-gray-900">
                તાજેતરના RSS આયાત થયેલા સમાચાર
              </h2>
            </div>

            <Link
              href="/admin/pending"
              className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
            >
              <span>બધા જુઓ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.latestImported && data.latestImported.length > 0
              ? data.latestImported.slice(0, 3).map((item) => ({
                  id: item.id,
                  titleGu: item.titleGu,
                  source: item.source?.attributionName || item.source?.name || 'RSS Feed',
                  time: new Date(item.createdAt).toLocaleString('gu-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  img: item.featuredImage || fallbackImported[0].img,
                }))
              : fallbackImported
            ).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50/70 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-14 h-11 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                  <img
                    src={item.img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Title and metadata */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs md:text-sm font-bold text-gray-900 truncate">
                    {item.titleGu}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {item.source} • {item.time}
                  </p>
                </div>

                {/* Orange Pending Pill Badge */}
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1 rounded-md shrink-0">
                  પેન્ડિંગ
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: છેલ્લા 7 દિવસની પ્રવૃત્તિ (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-3 mb-3 border-b border-gray-100">
            <div className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-900">
              છેલ્લા 7 દિવસની પ્રવૃત્તિ
            </h2>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* 1. નવા સમાચાર ઉમેરાયા */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ArrowUp className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-700 font-medium">નવા સમાચાર ઉમેરાયા</span>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {sevenDays.newsAdded}
              </span>
            </div>

            {/* 2. RSS થી આયાત */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Rss className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-700 font-medium">RSS થી આયાત</span>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {sevenDays.rssImported}
              </span>
            </div>

            {/* 3. પ્રકાશિત સમાચાર */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-700 font-medium">પ્રકાશિત સમાચાર</span>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {sevenDays.publishedNews}
              </span>
            </div>

            {/* 4. નકારી કાઢેલા */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-700 font-medium">નકારી કાઢેલા</span>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {sevenDays.rejectedNews}
              </span>
            </div>

            {/* 5. સક્રિય સંપાદકો */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <span className="text-gray-700 font-medium">સક્રિય સંપાદકો</span>
              </div>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {sevenDays.activeEditors}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}