'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  CheckCircle,
  Eye,
  FilePlus,
  Sparkles,
  Send,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Film,
  FolderOpen,
  Calendar,
  Clock,
  RotateCcw,
  Check,
  AlertCircle,
  Wand2,
  Globe,
  Tag,
  FileText,
  List,
} from 'lucide-react';
import { Category, Reporter } from '../../../../lib/types';
import api from '../../../../lib/api';
import RichNewsEditor from '../../../../components/admin/RichNewsEditor';
import MediaUploadPicker from '../../../../components/common/MediaUploadPicker';

export default function CreateNewsPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [titleGu, setTitleGu] = useState('');
  const [summaryGu, setSummaryGu] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [reporterId, setReporterId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [contentType, setContentType] = useState<'ARTICLE' | 'VIDEO' | 'REEL'>('ARTICLE');
  const [videoUrl, setVideoUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [publishDate, setPublishDate] = useState(new Date().toISOString().split('T')[0]);
  const [publishTime, setPublishTime] = useState(new Date().toTimeString().split(' ')[0].substring(0, 5));

  // Toggles
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTrending, setIsTrending] = useState(false);

  // Gemini AI Assistant States (Matching Image 3)
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState(false);
  const [suggestedHeadlines, setSuggestedHeadlines] = useState<string[]>([]);

  useEffect(() => {
    // Load Categories
    api.get('/admin/categories').then((res) => {
      if (res.data?.success && res.data.data.length > 0) {
        setCategories(res.data.data);
        setCategoryId(res.data.data[0].id);
      }
    });

    // Load Reporters
    api.get('/admin/reporters').then((res) => {
      if (res.data?.success && Array.isArray(res.data.data)) {
        setReporters(res.data.data);
      }
    });
  }, []);

  // Filter subcategories for selected category
  const selectedCatObj = categories.find((c) => c.id === categoryId);
  const subCategories = selectedCatObj?.children || [];

  // Gemini Action: Generate complete article
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('કાચી માહિતી અથવા સમાચાર મુદ્દા દાખલ કરો.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post('/admin/ai/generate', {
        rawContent: aiPrompt,
        language: 'gu',
        category: selectedCatObj?.nameGu,
      });

      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        if (d.headline) setTitleGu(d.headline);
        if (d.summary) setSummaryGu(d.summary);
        if (d.body) setContent(d.body);
        if (d.tags && Array.isArray(d.tags)) setTagsInput(d.tags.join(', '));
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 2500);
      }
    } catch (err: any) {
      setAiError(err.response?.data?.message || 'AI લેખ બનાવતી વખતે ભૂલ થઈ.');
    } finally {
      setAiLoading(false);
    }
  };

  // Gemini Action: Rewrite sentence/content
  const handleAiRewrite = async () => {
    const textToRewrite = content || aiPrompt;
    if (!textToRewrite.trim()) {
      setAiError('સુધારવા માટે લખાણ હોવું જરૂરી છે.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post('/admin/ai/rewrite', {
        content: textToRewrite,
        language: 'gu',
      });
      if (res.data?.success && res.data.data) {
        const text = res.data.data.rewrittenContent || res.data.data.body || res.data.data.content;
        if (text) setContent(text);
        if (res.data.data.headline) setTitleGu(res.data.data.headline);
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 2500);
      }
    } catch (err: any) {
      setAiError(err.response?.data?.message || 'AI પુનર્લેખન નિષ્ફળ.');
    } finally {
      setAiLoading(false);
    }
  };

  // Gemini Action: Translate to Gujarati
  const handleAiTranslate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('અનુવાદ કરવા માટે ટેક્સ્ટ દાખલ કરો.');
      return;
    }
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await api.post('/admin/ai/translate', {
        content: aiPrompt,
        toLanguage: 'gu',
      });
      if (res.data?.success && res.data.data?.content) {
        setContent(res.data.data.content);
        if (res.data.data.title && !titleGu) setTitleGu(res.data.data.title);
        setAiSuccess(true);
        setTimeout(() => setAiSuccess(false), 2500);
      }
    } catch (err: any) {
      setAiError(err.response?.data?.message || 'અનુવાદ નિષ્ફળ.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save or Publish
  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    setError(null);
    setSuccess(null);

    if (!titleGu.trim()) {
      setError('મુખ્ય ગુજરાતી હેડલાઇન લખવી આવશ્યક છે.');
      return;
    }
    if (!content.trim() || content.replace(/<[^>]+>/g, '').trim().length < 10) {
      setError('સમાચાર સામગ્રી ઓછામાં ઓછી ૧૦ અક્ષરોની હોવી જોઈએ.');
      return;
    }
    if (!categoryId) {
      setError('કેટેગરી પસંદ કરો.');
      return;
    }

    setLoading(true);
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await api.post('/admin/news', {
        titleGu,
        title: titleGu,
        descriptionGu: summaryGu,
        content,
        categoryId,
        subCategoryId: subCategoryId || null,
        reporterId: reporterId || null,
        contentType,
        videoUrl: (contentType === 'VIDEO' || contentType === 'REEL') ? videoUrl : null,
        featuredImage: featuredImage || null,
        tags,
        isBreaking,
        isTrending,
        isFeatured,
        seoTitle: titleGu.substring(0, 70),
        seoDescription: summaryGu.substring(0, 160),
        status,
      });

      if (res.data?.success) {
        setSuccess(
          status === 'PUBLISHED'
            ? 'સમાચાર સફળતાપૂર્વક મંજૂર કરી વેબસાઇટ પર પ્રકાશિત કરવામાં આવ્યા!'
            : 'સમાચાર ડ્રાફ્ટ તરીકે સાચવવામાં આવ્યા.'
        );
        setTimeout(() => router.push('/admin/news'), 1200);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'સાચવતી વખતે ભૂલ થઈ.');
    } finally {
      setLoading(false);
    }
  };

  // Google SEO Preview Slug
  const previewSlug = titleGu
    ? titleGu
        .toLowerCase()
        .replace(/[^a-z0-9\u0A80-\u0AFF]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 50)
    : 'samachar-title';

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-gujarati pb-16">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BAR (EXACT MATCHING IMAGE 3 REFERENCE)       */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F58220] flex items-center justify-center shrink-0 border border-orange-100">
            <FilePlus className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-gray-900">
              નવો સમાચાર ઉમેરો
            </h1>
            <div className="flex items-center gap-3 text-[11px] text-gray-400 font-medium">
              <span>ગુજરાતી, રાષ્ટ્રીય, આંતરરાષ્ટ્રીય અને સ્થાનિક સમાચાર પ્રકાશિત કરો</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auto Save: {publishTime}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('DRAFT')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Save className="w-3.5 h-3.5 text-gray-500" />
            <span>ડ્રાફ્ટ સાચવો</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (titleGu) window.open(`/${selectedCatObj?.slug || 'gujarat'}/${previewSlug}`, '_blank');
              else alert('પહેલા હેડલાઇન લખો.');
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 border border-gray-300 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            <span>પ્રીવ્યૂ જુઓ</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('PUBLISHED')}
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#ED1C2E] hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>સમાચાર પ્રકાશિત કરો</span>
          </button>
        </div>
      </div>

      {/* Alert Notifications */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. TWO-COLUMN LAYOUT (MAIN 8 COLS + SIDEBAR 4 COLS)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* --------------------------------------------------------- */}
        {/* LEFT COLUMN: HEADLINE, SUMMARY, RICH EDITOR & MEDIA TABS  */}
        {/* --------------------------------------------------------- */}
        <div className="lg:col-span-8 space-y-5">
          {/* Gujarati Headline Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#F58220] text-white flex items-center justify-center text-[10px] font-black">
                  T
                </span>
                <span>મુખ્ય ગુજરાતી હેડલાઇન (Gujarati Headline) *</span>
              </label>
              <span className="text-[11px] text-gray-400 font-mono">
                {titleGu.length}/150
              </span>
            </div>
            <input
              type="text"
              maxLength={150}
              value={titleGu}
              onChange={(e) => setTitleGu(e.target.value)}
              placeholder="અહીં સમાચારની મુખ્ય શીર્ષક લખો..."
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-[#202A72]"
            />
          </div>

          {/* Short Summary Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F58220]" />
                <span>સમાચાર સંક્ષેપ / સારાંશ (Summary) *</span>
              </label>
              <span className="text-[11px] text-gray-400 font-mono">
                {summaryGu.length}/300
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={300}
              value={summaryGu}
              onChange={(e) => setSummaryGu(e.target.value)}
              placeholder="અહીં સમાચારનો ટૂંકો સારાંશ લખો (૨-૩ વાક્ય)..."
              className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-xs text-gray-700 leading-relaxed focus:outline-none focus:border-[#202A72]"
            />
          </div>

          {/* CRITICAL: Rich News Editor with Inline Media Insertion */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
            <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <List className="w-4 h-4 text-[#F58220]" />
              <span>સમાચારનું વિગતવાર વર્ણન (Gujarati Description) *</span>
            </label>

            <RichNewsEditor
              value={content}
              onChange={setContent}
              placeholder="અહીં સમાચારની સંપૂર્ણ વિગતવાર માહિતી લખો... પેરાગ્રાફ વચ્ચે છબી કે વિડિયો ઉમેરવા ઉપરના ટૂલબારનો ઉપયોગ કરો."
            />
          </div>

          {/* Media Section: Images / Video / Reel */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setContentType('ARTICLE')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    contentType === 'ARTICLE'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>છબીઓ (Images)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentType('VIDEO')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    contentType === 'VIDEO'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <VideoIcon className="w-3.5 h-3.5" />
                  <span>વિડિયો (Video)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setContentType('REEL')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    contentType === 'REEL'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>રીલ (Short Video)</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/media"
                  target="_blank"
                  className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-primary" />
                  <span>મીડિયા લાઇબ્રેરી</span>
                </Link>
              </div>
            </div>

            {/* If video/reel, show Video URL input */}
            {(contentType === 'VIDEO' || contentType === 'REEL') && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">વિડિયો URL (YouTube / MP4):</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#202A72]"
                />
              </div>
            )}

            {/* Featured Image Picker */}
            <MediaUploadPicker
              label="મુખ્ય છબી (Featured Image) *"
              value={featuredImage}
              onChange={setFeaturedImage}
              folder="news"
            />
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* RIGHT COLUMN: AI ASSISTANT, METADATA & SEO PREVIEW        */}
        {/* --------------------------------------------------------- */}
        <div className="lg:col-span-4 space-y-5">
          {/* AI Writing Assistant Card (Purple Theme Matching Image 3) */}
          <div className="bg-gradient-to-br from-[#7C3AED]/10 via-[#6D28D9]/5 to-white border border-[#8B5CF6]/30 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">
                  AI લેખન સહાયક (AI Writing Assistant)
                </h3>
                <p className="text-[10px] text-gray-500">
                  Gemini AI સાથે વધુ સારી અને ઝડપી સમાચાર તૈયાર કરો
                </p>
              </div>
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiGenerate}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 text-[#7C3AED] rounded-lg text-[11px] font-bold hover:bg-purple-50 transition-colors shadow-2xs"
              >
                <span>✎ લેખ તૈયાર કરો</span>
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiRewrite}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 text-[#7C3AED] rounded-lg text-[11px] font-bold hover:bg-purple-50 transition-colors shadow-2xs"
              >
                <span>↺ વાક્ય સુધારો</span>
              </button>
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiTranslate}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-purple-200 text-[#7C3AED] rounded-lg text-[11px] font-bold hover:bg-purple-50 transition-colors shadow-2xs"
              >
                <span>文A ગુજરાતીમાં અનુવાદ</span>
              </button>
            </div>

            {/* Prompt input */}
            <div className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAiGenerate();
                  }
                }}
                placeholder="વિષય અથવા મુખ્ય મુદ્દા લખો..."
                className="w-full pl-3 pr-8 py-2 border border-purple-200 rounded-xl text-xs focus:outline-none focus:border-[#7C3AED] bg-white"
              />
              <button
                type="button"
                disabled={aiLoading}
                onClick={handleAiGenerate}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-[#7C3AED] hover:bg-purple-100 rounded-lg transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            {aiSuccess && (
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> AI લખાણ સફળતાપૂર્વક લાગુ થયું!
              </p>
            )}
            {aiError && (
              <p className="text-[11px] text-red-600">{aiError}</p>
            )}
          </div>

          {/* Article Metadata Card (Matching Image 3) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 border-b pb-2">
              <Tag className="w-3.5 h-3.5 text-[#F58220]" />
              <span>સમાચાર વિગતો (Article Metadata)</span>
            </h3>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  સમાચાર કેટેગરી *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#202A72] bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameGu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  ઉપ-કેટેગરી
                </label>
                <select
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  className="w-full px-2.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#202A72] bg-white"
                >
                  <option value="">કોઈ નહીં</option>
                  {subCategories.map((sc) => (
                    <option key={sc.id} value={sc.id}>
                      {sc.nameGu}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reporter Selection */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                રિપોર્ટર / લેખક *
              </label>
              <select
                value={reporterId}
                onChange={(e) => setReporterId(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#202A72] bg-white"
              >
                <option value="">સત્તાવાર બ્યુરો (BN News Bureau)</option>
                {reporters.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.designation})
                  </option>
                ))}
              </select>
            </div>

            {/* Publication Date & Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  પ્રકાશન તારીખ *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#202A72]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  પ્રકાશન સમય *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#202A72]"
                  />
                </div>
              </div>
            </div>

            {/* Toggles (Matching Image 3) */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-bold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-[#F58220] rounded"
                />
                <span className="text-gray-800">મુખ્ય સમાચાર (Featured)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="w-4 h-4 text-[#ED1C2E] rounded"
                />
                <span className="text-gray-800">બ્રેકિંગ સમાચાર</span>
              </label>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                ટેગ્સ (અલ્પવિરામથી અલગ કરો)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="ગુજરાત, રાજકારણ, ચૂંટણી"
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#202A72]"
              />
            </div>
          </div>

          {/* SEO Preview Card (Matching Image 3) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5 border-b pb-2">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>SEO પ્રિવ્યૂ (Google Search Result)</span>
            </h3>

            <div className="space-y-0.5 text-xs">
              <p className="text-blue-700 font-medium hover:underline cursor-pointer line-clamp-1">
                {titleGu || 'અહીં મુખ્ય ગુજરાતી હેડલાઇન દર્શાશે...'}
              </p>
              <p className="text-[11px] text-emerald-700 font-mono truncate">
                https://bnnewsgujarati.com/news/{previewSlug}
              </p>
              <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                {summaryGu || 'અહીં સમાચારનો ટૂંકો સારાંશ (meta description) દર્શાશે...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
