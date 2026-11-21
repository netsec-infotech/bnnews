'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, CheckCircle, ArrowLeft, Image as ImageIcon, Tag, Globe, Sparkles } from 'lucide-react';
import { Category } from '../../../../lib/types';
import api from '../../../../lib/api';
import MediaUploadPicker from '../../../../components/common/MediaUploadPicker';

export default function CreateNewsPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Fields
  const [titleGu, setTitleGu] = useState('');
  const [title, setTitle] = useState('');
  const [descriptionGu, setDescriptionGu] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');

  useEffect(() => {
    api.get('/admin/categories').then((res) => {
      if (res.data?.success && res.data.data.length > 0) {
        setCategories(res.data.data);
        setCategoryId(res.data.data[0].id);
      }
    });
  }, []);

  const handleSave = async (status: 'DRAFT' | 'PUBLISHED') => {
    setError(null);
    setSuccess(null);

    if (!titleGu.trim()) {
      setError('ગુજરાતી હેડલાઇન લખવી આવશ્યક છે.');
      return;
    }
    if (!content.trim()) {
      setError('સમાચાર સામગ્રી લખવી આવશ્યક છે.');
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
        title: title || titleGu,
        descriptionGu,
        content,
        categoryId,
        featuredImage: featuredImage || null,
        tags,
        isBreaking,
        isTrending,
        isFeatured,
        seoTitle: seoTitle || titleGu,
        seoDescription: seoDescription || descriptionGu,
        status,
      });

      if (res.data?.success) {
        setSuccess(
          status === 'PUBLISHED'
            ? 'સમાચાર સફળતાપૂર્વક પ્રકાશિત કરવામાં આવ્યા!'
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

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-gujarati">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <button
            onClick={() => router.push('/admin/news')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>તમામ સમાચાર પર પાછા જાઓ</span>
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-neutral-text">
            નવા સમાચાર ઉમેરો (Manual News Creation)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('DRAFT')}
            className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>ડ્રાફ્ટ સાચવો (Save Draft)</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleSave('PUBLISHED')}
            className="px-5 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-4 h-4 text-secondary" />
            <span>પ્રકાશિત કરો (Publish Now)</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-bold">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-bold">
          {success}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 space-y-6">
        {/* Gujarati Headline */}
        <div>
          <label className="block text-xs font-bold text-neutral-text mb-1.5">
            ગુજરાતી હેડલાઇન (Gujarati Headline) *
          </label>
          <input
            type="text"
            required
            value={titleGu}
            onChange={(e) => setTitleGu(e.target.value)}
            placeholder="દા.ત. ગુજરાત સરકારની નવી યોજના જાહેર..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base font-bold text-neutral-text focus:outline-none focus:border-primary"
          />
        </div>

        {/* English Headline (Optional) */}
        <div>
          <label className="block text-xs font-bold text-neutral-muted mb-1.5">
            અંગ્રેજી હેડલાઇન (English Headline - વૈકલ્પિક)
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Gujarat Government announces new scheme..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-xs text-neutral-text focus:outline-none focus:border-primary"
          />
        </div>

        {/* Short Summary */}
        <div>
          <label className="block text-xs font-bold text-neutral-text mb-1.5">
            ટૂંકું વર્ણન (Short Description / Summary)
          </label>
          <textarea
            rows={2}
            value={descriptionGu}
            onChange={(e) => setDescriptionGu(e.target.value)}
            placeholder="સમાચારનો મુખ્ય સારાંશ અહીં લખો..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-primary"
          />
        </div>

        {/* Category & Featured Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-neutral-text mb-1.5">
              કેટેગરી (Category) *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameGu} ({cat.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <MediaUploadPicker
              label="ફીચર્ડ છબી (Featured Image)"
              value={featuredImage}
              onChange={setFeaturedImage}
              acceptType="image"
              helperText="સીધી ઇમેજ ફાઇલ અપલોડ કરો અથવા સંગ્રહિત લાઇબ્રેરીમાંથી પસંદ કરો."
            />
          </div>
        </div>

        {/* Full Rich Editorial Content */}
        <div>
          <label className="block text-xs font-bold text-neutral-text mb-1.5">
            સંપૂર્ણ સમાચાર સામગ્રી (Full Editorial Content HTML) *
          </label>
          <textarea
            rows={12}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="<p>સમાચારની વિગતવાર માહિતી અહીં લખો...</p>"
            className="w-full p-4 border border-gray-300 rounded-lg text-xs font-mono leading-relaxed focus:outline-none focus:border-primary"
          />
          <p className="text-[10px] text-gray-400 mt-1">HTML ટેગ્સ જેમ કે &lt;p&gt;, &lt;h3&gt;, &lt;b&gt;, &lt;ul&gt; સપોર્ટેડ છે.</p>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-neutral-text mb-1.5">
            ટેગ્સ (Tags - અલ્પવિરામથી અલગ કરો)
          </label>
          <div className="relative">
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ગુજરાત, રાજકારણ, મુખ્યમંત્રી, સમાચાર"
              className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
            />
            <Tag className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Toggles: Breaking, Trending, Featured */}
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={isBreaking}
              onChange={(e) => setIsBreaking(e.target.checked)}
              className="w-4 h-4 text-breaking rounded"
            />
            <span className="text-breaking">બ્રેકિંગ ન્યૂઝ ટિકર</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={isTrending}
              onChange={(e) => setIsTrending(e.target.checked)}
              className="w-4 h-4 text-secondary rounded"
            />
            <span className="text-secondary">ટ્રેન્ડિંગ લિસ્ટમાં દર્શાવો</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 text-primary rounded"
            />
            <span className="text-primary">હોમપેજ મુખ્ય ફીચર્ડ સ્ટોરી</span>
          </label>
        </div>

        {/* SEO Metadata */}
        <div className="pt-4 border-t border-gray-200 space-y-4">
          <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>SEO મેટાડેટા (SEO Settings)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="Google સર્ચ માટે ટાઇટલ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">SEO Description</label>
              <input
                type="text"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Google સર્ચ માટે વર્ણન..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
