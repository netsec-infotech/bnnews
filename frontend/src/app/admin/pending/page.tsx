'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Clock,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  Save,
  ArrowLeft,
  Eye,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { NewsArticle, Category } from '../../../lib/types';
import api from '../../../lib/api';
import MediaUploadPicker from '../../../components/common/MediaUploadPicker';
import { useAuth } from '../../../context/AuthContext';

function PendingNewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hasRole } = useAuth();
  const reviewIdParam = searchParams?.get('review');

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Bulk Selection & Pagination States
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 15;

  // Selected article for side-by-side review
  const [reviewArticle, setReviewArticle] = useState<NewsArticle | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form edit states for review article
  const [formHeadlineGu, setFormHeadlineGu] = useState('');
  const [formSummaryGu, setFormSummaryGu] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);

  // Fetch categories
  useEffect(() => {
    api.get('/admin/categories').then((res) => {
      if (res.data?.success) setCategories(res.data.data);
    });
  }, []);

  // Fetch news list with pagination
  const loadArticles = (targetPage = page) => {
    setLoading(true);
    const query = new URLSearchParams({
      status: filterStatus,
      search: searchQuery,
      page: targetPage.toString(),
      limit: pageSize.toString(),
    });

    api
      .get(`/admin/news?${query.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setArticles(res.data.data || []);
          setTotalPages(res.data.meta?.totalPages || 1);
          setTotalCount(res.data.meta?.total || 0);
          setSelectedIds([]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setPage(1);
    loadArticles(1);
  }, [filterStatus]);

  useEffect(() => {
    loadArticles(page);
  }, [page]);

  const allCurrentSelected = articles.length > 0 && articles.every((a) => selectedIds.includes(a.id));
  const toggleSelectAll = () => {
    if (allCurrentSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(articles.map((a) => a.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`શું તમે ખરેખર પસંદ કરેલા ${selectedIds.length} સમાચાર કાયમ માટે કાઢી નાખવા માંગો છો?`)) return;

    setBulkDeleting(true);
    try {
      const res = await api.post('/admin/news/bulk-delete', { ids: selectedIds });
      if (res.data?.success) {
        alert(res.data.message || `${selectedIds.length} સમાચાર કાઢી નાખવામાં આવ્યા`);
        setSelectedIds([]);
        loadArticles(page);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી નાખતી વખતે ભૂલ થઈ');
    } finally {
      setBulkDeleting(false);
    }
  };

  // Load article for side-by-side review if parameter provided
  useEffect(() => {
    if (reviewIdParam) {
      openReviewModal(reviewIdParam);
    }
  }, [reviewIdParam]);

  const openReviewModal = async (id: string) => {
    setReviewLoading(true);
    setActionSuccess(null);
    setActionError(null);
    try {
      const res = await api.get(`/admin/news/${id}`);
      if (res.data?.success) {
        const art = res.data.data;
        setReviewArticle(art);
        setFormHeadlineGu(art.titleGu || art.title || '');
        setFormSummaryGu(art.descriptionGu || art.description || '');
        setFormContent(art.content || '');
        setFormCategoryId(art.categoryId || '');
        setFormFeaturedImage(art.featuredImage || '');
        setFormSeoTitle(art.seoTitle || art.titleGu || '');
        setFormSeoDesc(art.seoDescription || art.descriptionGu || '');
        setFormIsBreaking(art.isBreaking || false);
        setFormIsTrending(art.isTrending || false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  const closeReview = () => {
    setReviewArticle(null);
    router.push('/admin/pending');
    loadArticles();
  };

  // Actions
  const handleSaveDraft = async () => {
    if (!reviewArticle) return;
    setSaveLoading(true);
    setActionError(null);
    try {
      await api.put(`/admin/news/${reviewArticle.id}`, {
        titleGu: formHeadlineGu,
        descriptionGu: formSummaryGu,
        content: formContent,
        categoryId: formCategoryId,
        featuredImage: formFeaturedImage,
        seoTitle: formSeoTitle,
        seoDescription: formSeoDesc,
        isBreaking: formIsBreaking,
        isTrending: formIsTrending,
      });
      setActionSuccess('સમાચાર ડ્રાફ્ટ તરીકે સાચવવામાં આવ્યા.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'સાચવતી વખતે ભૂલ થઈ.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleApproveAndPublish = async () => {
    if (!reviewArticle) return;
    setSaveLoading(true);
    setActionError(null);
    try {
      // 1. Update latest edits
      await api.put(`/admin/news/${reviewArticle.id}`, {
        titleGu: formHeadlineGu,
        descriptionGu: formSummaryGu,
        content: formContent,
        categoryId: formCategoryId,
        featuredImage: formFeaturedImage,
        seoTitle: formSeoTitle,
        seoDescription: formSeoDesc,
        isBreaking: formIsBreaking,
        isTrending: formIsTrending,
      });

      // 2. Publish with server-side authorization check
      const pubRes = await api.post(`/admin/news/${reviewArticle.id}/publish`);
      if (pubRes.data?.success) {
        setActionSuccess('સમાચાર સફળતાપૂર્વક મંજૂર કરી વેબસાઇટ પર પ્રકાશિત કરવામાં આવ્યા!');
        setTimeout(() => closeReview(), 1500);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'પ્રકાશન સમયે ભૂલ થઈ.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReject = async (id?: string) => {
    const targetId = id || reviewArticle?.id;
    if (!targetId) return;

    if (!confirm('શું તમે ખરેખર આ સમાચારને નકારવા (REJECT) માંગો છો?')) return;

    try {
      await api.post(`/admin/news/${targetId}/reject`, { reason: 'સંપાદકીય સમીક્ષામાં અયોગ્ય' });
      if (reviewArticle) {
        closeReview();
      } else {
        loadArticles();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'ભૂલ થઈ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ સમાચાર કાયમ માટે કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/news/${id}`);
      loadArticles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાતા નથી');
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* If Two-Column News Review Editor is Open */}
      {reviewArticle ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-5 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
            <button
              onClick={closeReview}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>પેન્ડિંગ લિસ્ટ પર પાછા જાઓ</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={saveLoading}
                onClick={handleSaveDraft}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>સેવ ડ્રાફ્ટ (Save Draft)</span>
              </button>

              <button
                type="button"
                onClick={() => handleReject()}
                className="px-3.5 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-100 flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>નકારો (Reject)</span>
              </button>

              <button
                type="button"
                disabled={saveLoading}
                onClick={handleApproveAndPublish}
                className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>મંજૂર કરી પ્રકાશિત કરો (Approve & Publish)</span>
              </button>
            </div>
          </div>

          {actionSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 font-bold">
              <Check className="w-4 h-4" />
              <span>{actionSuccess}</span>
            </div>
          )}

          {actionError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg font-bold">
              {actionError}
            </div>
          )}

          {/* TWO-COLUMN EDITING INTERFACE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Original RSS Content */}
            <div className="lg:col-span-5 bg-gray-50/80 rounded-xl p-5 border border-gray-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                <span className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                  <span>મૂળ RSS આયાત સામગ્રી (Original Content)</span>
                </span>
                {reviewArticle.sourceItem?.sourceUrl && (
                  <a
                    href={reviewArticle.sourceItem.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>મૂળ લિંક</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase">મૂળ હેડલાઇન (Original Title)</label>
                <p className="text-sm font-bold text-neutral-text mt-1 bg-white p-3 rounded-lg border border-gray-200">
                  {reviewArticle.sourceItem?.title || reviewArticle.title}
                </p>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase">મૂળ વર્ણન (Original Description)</label>
                <p className="text-xs text-gray-700 mt-1 bg-white p-3 rounded-lg border border-gray-200 leading-relaxed max-h-48 overflow-y-auto">
                  {reviewArticle.sourceItem?.description || reviewArticle.description || 'કોઈ વર્ણન નથી.'}
                </p>
              </div>

              {reviewArticle.sourceItem?.rawImageUrl && (
                <div>
                  <label className="text-[11px] font-bold text-gray-500 uppercase">મૂળ છબી (Original Image Preview)</label>
                  <div className="mt-1 aspect-video rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <img
                      src={reviewArticle.sourceItem.rawImageUrl}
                      alt="Original Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className="text-[11px] text-gray-500 space-y-1 pt-2 border-t border-gray-200">
                <p>સ્ત્રોત નામ: <strong className="text-gray-700">{reviewArticle.source?.attributionName || reviewArticle.source?.name || 'RSS'}</strong></p>
                <p>આયાત તારીખ: <strong className="text-gray-700">{new Date(reviewArticle.createdAt).toLocaleString('gu-IN')}</strong></p>
              </div>
            </div>

            {/* RIGHT COLUMN: BN News Gujarati Editorial Content */}
            <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-primary/20 shadow-xs space-y-4">
              <div className="pb-2 border-b border-primary/20">
                <span className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 bg-secondary rounded-full"></span>
                  <span>BN News સંપાદકીય કન્ટેન્ટ (Editorial Review)</span>
                </span>
              </div>

              {/* Gujarati Headline */}
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">
                  સંપાદિત ગુજરાતી હેડલાઇન (Gujarati Headline) *
                </label>
                <input
                  type="text"
                  required
                  value={formHeadlineGu}
                  onChange={(e) => setFormHeadlineGu(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm font-bold text-neutral-text focus:outline-none focus:border-primary"
                  placeholder="ગુજરાતી શીર્ષક લખો..."
                />
              </div>

              {/* Gujarati Summary */}
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">
                  ટૂંકું વર્ણન (Gujarati Summary)
                </label>
                <textarea
                  rows={2}
                  value={formSummaryGu}
                  onChange={(e) => setFormSummaryGu(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-primary"
                  placeholder="સમાચારનો સારાંશ..."
                />
              </div>

              {/* Category & Featured Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-text mb-1">કેટેગરી (Category) *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameGu} ({c.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <MediaUploadPicker
                    label="ફીચર્ડ છબી (Featured Image)"
                    value={formFeaturedImage}
                    onChange={setFormFeaturedImage}
                    acceptType="image"
                    helperText="મૂળ છબી બદલવા માટે નવી અપલોડ કરો અથવા પસંદ કરો."
                  />
                </div>
              </div>

              {/* Full Editorial Content */}
              <div>
                <label className="block text-xs font-bold text-neutral-text mb-1">
                  સંપૂર્ણ સંપાદકીય સામગ્રી (Full Editorial Content HTML) *
                </label>
                <textarea
                  rows={8}
                  required
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-mono leading-relaxed focus:outline-none focus:border-primary"
                  placeholder="સમાચાર વિગતવાર..."
                />
              </div>

              {/* Toggles: Breaking & Trending */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={formIsBreaking}
                    onChange={(e) => setFormIsBreaking(e.target.checked)}
                    className="w-4 h-4 text-breaking rounded"
                  />
                  <span className="text-breaking">બ્રેકિંગ ન્યૂઝ ટિકરમાં દર્શાવો</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={formIsTrending}
                    onChange={(e) => setFormIsTrending(e.target.checked)}
                    className="w-4 h-4 text-secondary rounded"
                  />
                  <span className="text-secondary">ટ્રેન્ડિંગ ન્યૂઝમાં ઉમેરો</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PENDING NEWS TABLE VIEW */
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-5">
          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                <span>સમાચાર સમીક્ષા અને મંજૂરી (Editorial Review)</span>
              </h1>
              <p className="text-xs text-neutral-muted mt-0.5">
                નિયમ: RSS દ્વારા આવેલ સમાચાર હંમેશા PENDING રહે છે. સંપાદકની સમીક્ષા અને મંજૂરી પછી જ પ્રકાશિત થાય છે.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'PENDING', 'DRAFT', 'PUBLISHED', 'REJECTED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === st
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {st === 'ALL' && 'તમામ'}
                  {st === 'PENDING' && 'પેન્ડિંગ (Pending)'}
                  {st === 'DRAFT' && 'ડ્રાફ્ટ'}
                  {st === 'PUBLISHED' && 'પ્રકાશિત'}
                  {st === 'REJECTED' && 'નકારેલ'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadArticles();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="હેડલાઇન અથવા સ્ત્રોત શોધો..."
                className="w-full pl-9 pr-3.5 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-primary"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              શોધો
            </button>
          </form>

          {/* Bulk Selection Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-xs font-bold text-red-900">
                  {selectedIds.length} સમાચાર પસંદ કરેલા છે
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{bulkDeleting ? 'કાઢી રહ્યા છીએ...' : `પસંદ કરેલા કાઢી નાખો (${selectedIds.length})`}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-xs font-medium transition-all"
                >
                  પસંદગી રદ કરો
                </button>
              </div>
            </div>
          )}

          {/* News Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allCurrentSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                      title={allCurrentSelected ? 'તમામ પસંદગી રદ કરો' : 'બધા પસંદ કરો'}
                    />
                  </th>
                  <th className="py-3 px-3">ફોટો</th>
                  <th className="py-3 px-3">હેડલાઇન</th>
                  <th className="py-3 px-3">સ્ત્રોત</th>
                  <th className="py-3 px-3">કેટેગરી</th>
                  <th className="py-3 px-3">સ્થિતિ</th>
                  <th className="py-3 px-3">તારીખ</th>
                  <th className="py-3 px-3 text-right">ક્રિયા (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      સમાચાર લોડ થઈ રહ્યા છે...
                    </td>
                  </tr>
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-400">
                      કોઈ સમાચાર મળ્યા નથી.
                    </td>
                  </tr>
                ) : (
                  articles.map((article) => {
                    const isSelected = selectedIds.includes(article.id);
                    return (
                      <tr
                        key={article.id}
                        className={`hover:bg-gray-50/60 transition-colors ${
                          isSelected ? 'bg-blue-50/60' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(article.id)}
                            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer accent-primary"
                          />
                        </td>

                        <td className="py-2.5 px-3">
                          <div className="w-14 h-10 rounded bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            {article.featuredImage ? (
                              <img
                                src={article.featuredImage}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">
                                No Img
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3 max-w-sm">
                          <p className="font-bold text-neutral-text line-clamp-1">{article.titleGu}</p>
                          {article.title && article.title !== article.titleGu && (
                            <p className="text-[10px] text-gray-400 truncate">{article.title}</p>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-neutral-muted">
                          {article.source?.attributionName || article.source?.name || 'મેન્યુઅલ'}
                        </td>

                        <td className="py-2.5 px-3">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                            {article.category?.nameGu || 'કેટેગરી'}
                          </span>
                        </td>

                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              article.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : article.status === 'PENDING'
                                ? 'bg-orange-100 text-orange-800 animate-pulse'
                                : article.status === 'REJECTED'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {article.status}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">
                          {new Date(article.createdAt).toLocaleDateString('gu-IN')}
                        </td>

                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openReviewModal(article.id)}
                              className="px-2.5 py-1 bg-primary text-white rounded text-[11px] font-semibold hover:bg-primary-dark transition-colors"
                              title="સમીક્ષા અને મંજૂરી"
                            >
                              સમીક્ષા
                            </button>

                            {hasRole('SUPER_ADMIN', 'ADMIN') && (
                              <button
                                onClick={() => handleDelete(article.id)}
                                className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                                title="કાઢી નાખો"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <p>
                કુલ <span className="font-bold text-gray-900">{totalCount}</span> સમાચાર (પાનું{' '}
                <span className="font-bold text-gray-900">{page}</span> / {totalPages})
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>અગાઉનું</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                  .map((p, idx, arr) => (
                    <React.Fragment key={p}>
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">...</span>}
                      <button
                        type="button"
                        onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg font-bold transition-all ${
                          page === p
                            ? 'bg-primary text-white shadow-xs'
                            : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                >
                  <span>આગળનું</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function PendingNewsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-gujarati text-neutral-muted">લોડ થઈ રહ્યું છે...</div>}>
      <PendingNewsContent />
    </Suspense>
  );
}
