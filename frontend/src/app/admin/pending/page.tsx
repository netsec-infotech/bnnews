'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  Sparkles,
  Wand2,
  User,
  Calendar,
  AlertCircle,
  Tag,
  Film,
  Video as VideoIcon,
  FileText,
  RotateCcw,
  Send,
  X,
} from 'lucide-react';
import { NewsArticle, Category, Reporter } from '../../../lib/types';
import api from '../../../lib/api';
import RichNewsEditor from '../../../components/admin/RichNewsEditor';
import MediaUploadPicker from '../../../components/common/MediaUploadPicker';
import { useAuth } from '../../../context/AuthContext';

function PendingNewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { hasRole } = useAuth();
  const reviewIdParam = searchParams?.get('review');

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('PENDING');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterReporter, setFilterReporter] = useState<string>('');
  const [filterContentType, setFilterContentType] = useState<string>('');
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
  const [formSubCategoryId, setFormSubCategoryId] = useState('');
  const [formReporterId, setFormReporterId] = useState('');
  const [formFeaturedImage, setFormFeaturedImage] = useState('');
  const [formContentType, setFormContentType] = useState<'ARTICLE' | 'VIDEO' | 'REEL'>('ARTICLE');
  const [formVideoUrl, setVideoUrl] = useState('');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDesc, setFormSeoDesc] = useState('');
  const [formIsBreaking, setFormIsBreaking] = useState(false);
  const [formIsTrending, setFormIsTrending] = useState(false);
  const [formIsFeatured, setFormIsFeatured] = useState(false);

  // Reject Modal State
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Gemini AI Recreate State
  const [aiRecreating, setAiRecreating] = useState(false);
  const [aiLanguage, setAiLanguage] = useState<'gu' | 'hi' | 'en'>('gu');

  // Load Categories & Reporters
  useEffect(() => {
    api.get('/admin/categories').then((res) => {
      if (res.data?.success) setCategories(res.data.data);
    });
    api.get('/admin/reporters').then((res) => {
      if (res.data?.success && Array.isArray(res.data.data)) setReporters(res.data.data);
    });
  }, []);

  // Fetch news list with filters & pagination
  const loadArticles = (targetPage = page) => {
    setLoading(true);
    const query = new URLSearchParams({
      status: filterStatus,
      search: searchQuery,
      ...(filterCategory && { categoryId: filterCategory }),
      ...(filterReporter && { reporterId: filterReporter }),
      ...(filterContentType && { contentType: filterContentType }),
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
  }, [filterStatus, filterCategory, filterReporter, filterContentType]);

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

  // Open Article for Review
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
        setFormSubCategoryId(art.subCategoryId || '');
        setFormReporterId(art.reporterId || '');
        setFormFeaturedImage(art.featuredImage || '');
        setFormContentType((art.contentType as any) || 'ARTICLE');
        setVideoUrl(art.videoUrl || '');
        setFormSeoTitle(art.seoTitle || art.titleGu || '');
        setFormSeoDesc(art.seoDescription || art.descriptionGu || '');
        setFormIsBreaking(art.isBreaking || false);
        setFormIsTrending(art.isTrending || false);
        setFormIsFeatured(art.isFeatured || false);
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

  // AI Recreate News Action (CRITICAL REQUIREMENT)
  const handleAiRecreate = async () => {
    if (!reviewArticle) return;
    setAiRecreating(true);
    setActionError(null);
    try {
      const sourceText =
        reviewArticle.originalContent ||
        reviewArticle.content ||
        reviewArticle.originalDescriptionGu ||
        reviewArticle.descriptionGu ||
        reviewArticle.titleGu;

      const res = await api.post('/admin/ai/recreate', {
        rawContent: sourceText,
        language: aiLanguage,
        category: categories.find((c) => c.id === formCategoryId)?.nameGu,
        articleId: reviewArticle.id,
      });

      if (res.data?.success && res.data.data) {
        const d = res.data.data;
        if (d.headline) setFormHeadlineGu(d.headline);
        if (d.summary) setFormSummaryGu(d.summary);
        if (d.body) setFormContent(d.body);
        if (d.seoTitle) setFormSeoTitle(d.seoTitle);
        if (d.seoDescription) setFormSeoDesc(d.seoDescription);
        setActionSuccess('AI દ્વારા સમાચાર સફળતાપૂર્વક પુનઃતૈયાર કરવામાં આવ્યા! સમીક્ષા કરીને સાચવો.');
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'AI પુનઃનિર્માણ દરમિયાન ક્ષતિ આવી.');
    } finally {
      setAiRecreating(false);
    }
  };

  // Save Draft
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
        subCategoryId: formSubCategoryId || null,
        reporterId: formReporterId || null,
        contentType: formContentType,
        videoUrl: formVideoUrl || null,
        featuredImage: formFeaturedImage,
        seoTitle: formSeoTitle,
        seoDescription: formSeoDesc,
        isBreaking: formIsBreaking,
        isTrending: formIsTrending,
        isFeatured: formIsFeatured,
      });
      setActionSuccess('સમાચાર ડ્રાફ્ટ તરીકે સાચવવામાં આવ્યા.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'સાચવતી વખતે ભૂલ થઈ.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Approve & Publish
  const handleApproveAndPublish = async () => {
    if (!reviewArticle) return;
    if (!formHeadlineGu.trim()) {
      setActionError('પ્રકાશન માટે માન્ય ગુજરાતી હેડલાઇન લખવી આવશ્યક છે.');
      return;
    }
    setSaveLoading(true);
    setActionError(null);
    try {
      // 1. Save latest updates
      await api.put(`/admin/news/${reviewArticle.id}`, {
        titleGu: formHeadlineGu,
        descriptionGu: formSummaryGu,
        content: formContent,
        categoryId: formCategoryId,
        subCategoryId: formSubCategoryId || null,
        reporterId: formReporterId || null,
        contentType: formContentType,
        videoUrl: formVideoUrl || null,
        featuredImage: formFeaturedImage,
        seoTitle: formSeoTitle,
        seoDescription: formSeoDesc,
        isBreaking: formIsBreaking,
        isTrending: formIsTrending,
        isFeatured: formIsFeatured,
      });

      // 2. Publish
      const res = await api.post(`/admin/news/${reviewArticle.id}/publish`);
      if (res.data?.success) {
        setActionSuccess('સમાચાર સફળતાપૂર્વક મંજૂર કરી વેબસાઇટ પર પ્રકાશિત કરવામાં આવ્યા!');
        setTimeout(() => closeReview(), 1200);
      }
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'પ્રકાશિત કરતી વખતે ભૂલ થઈ.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Reject Article (Requires Reason)
  const handleRejectArticle = async () => {
    if (!reviewArticle) return;
    if (!rejectReason.trim()) {
      alert('કૃપા કરીને સમાચાર નકારવાનું યોગ્ય કારણ જણાવો.');
      return;
    }
    setRejecting(true);
    try {
      const res = await api.post(`/admin/news/${reviewArticle.id}/reject`, {
        reason: rejectReason.trim(),
      });
      if (res.data?.success) {
        setShowRejectModal(false);
        setRejectReason('');
        setActionSuccess('સમાચાર નકારવામાં આવ્યા.');
        setTimeout(() => closeReview(), 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'નકારતી વખતે ભૂલ થઈ.');
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 md:p-6 space-y-6 font-gujarati">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#F58220]" />
            <span>સમાચાર સમીક્ષા અને મંજૂરી (Pending News & Approvals)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            સંવાદદાતાઓ અને RSS સ્ત્રોતો દ્વારા સબમિટ કરાયેલ સમાચારોની તથ્ય ચકાસણી, AI પુનર્લેખન અને પ્રકાશન
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && hasRole('SUPER_ADMIN', 'ADMIN') && (
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>પસંદ કરેલા ({selectedIds.length}) કાઢી નાખો</span>
            </button>
          )}

          <Link
            href="/admin/news/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#202A72] text-white rounded-xl text-xs font-bold hover:bg-blue-900 transition-all shadow-xs"
          >
            <span>+ નવો સમાચાર ઉમેરો</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#202A72] bg-white"
          >
            <option value="PENDING">પેન્ડિંગ સમીક્ષા (Pending)</option>
            <option value="DRAFT">ડ્રાફ્ટ (Draft)</option>
            <option value="PUBLISHED">પ્રકાશિત (Published)</option>
            <option value="REJECTED">નકારેલ (Rejected)</option>
            <option value="ALL">તમામ સ્થિતિ (All Status)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#202A72] bg-white"
          >
            <option value="">તમામ કેટેગરી</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameGu}
              </option>
            ))}
          </select>
        </div>

        {/* Reporter Filter */}
        <div className="sm:col-span-3">
          <select
            value={filterReporter}
            onChange={(e) => setFilterReporter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-xl font-semibold focus:outline-none focus:border-[#202A72] bg-white"
          >
            <option value="">તમામ રિપોર્ટર્સ / સ્ત્રોત</option>
            {reporters.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            loadArticles(1);
          }}
          className="sm:col-span-3 flex gap-1.5"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="હેડલાઇન શોધો..."
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-[#202A72]"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#202A72] text-white font-bold rounded-xl hover:bg-blue-900 transition-colors"
          >
            શોધો
          </button>
        </form>
      </div>

      {/* Pending Articles Table */}
      <div className="overflow-x-auto border border-gray-100 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={allCurrentSelected}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-[#202A72]"
                />
              </th>
              <th className="py-3 px-3">છબી</th>
              <th className="py-3 px-3">હેડલાઇન</th>
              <th className="py-3 px-3">કેટેગરી</th>
              <th className="py-3 px-3">રિપોર્ટર / સ્ત્રોત</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3">તારીખ</th>
              <th className="py-3 px-3 text-right">ક્રિયાઓ (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td colSpan={8} className="py-4 px-3">
                    <div className="h-4 bg-gray-100 rounded w-full" />
                  </td>
                </tr>
              ))
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400 text-xs">
                  કોઈ પેન્ડિંગ સમાચાર મળ્યા નથી.
                </td>
              </tr>
            ) : (
              articles.map((art) => (
                <tr key={art.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(art.id)}
                      onChange={() => toggleSelectOne(art.id)}
                      className="rounded border-gray-300 text-[#202A72]"
                    />
                  </td>

                  <td className="py-2.5 px-3">
                    <div className="w-12 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0 border">
                      {art.featuredImage ? (
                        <img src={art.featuredImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 font-bold">
                          BN
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="py-2.5 px-3 max-w-sm">
                    <p className="font-bold text-gray-900 line-clamp-1">{art.titleGu || art.title}</p>
                    {art.descriptionGu && (
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{art.descriptionGu}</p>
                    )}
                  </td>

                  <td className="py-2.5 px-3 font-semibold text-gray-700">
                    {art.category?.nameGu || 'સામાન્ય'}
                  </td>

                  <td className="py-2.5 px-3 text-gray-600">
                    {art.reporter?.name || art.source?.attributionName || art.author?.name || 'સત્તાવાર બ્યુરો'}
                  </td>

                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        art.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : art.status === 'PENDING'
                          ? 'bg-amber-100 text-amber-800'
                          : art.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {art.status}
                    </span>
                  </td>

                  <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">
                    {new Date(art.createdAt).toLocaleDateString('gu-IN')}
                  </td>

                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openReviewModal(art.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-primary hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                        title="સમીક્ષા અને સંપાદન"
                      >
                        <Edit className="w-3 h-3" />
                        <span>સમીક્ષા</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs">
          <span className="text-gray-500">
            કુલ {totalCount} સમાચારોમાંથી પૃષ્ઠ {page} / {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-bold text-gray-700">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2-COLUMN SIDE-BY-SIDE EDITORIAL REVIEW MODAL              */}
      {/* ========================================================= */}
      {reviewArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-7xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden font-gujarati animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-orange-100 text-[#F58220]">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    સમાચાર સંપાદકીય સમીક્ષા (Side-by-Side Review)
                  </h2>
                  <p className="text-xs text-gray-500">
                    મૂળ સબમિશન સાથે સરખામણી કરો, AI દ્વારા પુનઃનિર્માણ કરો અને મંજૂરી આપો
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeReview}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Notifications */}
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3 bg-red-50 border-b border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Modal Body: Two Columns */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* --------------------------------------------------- */}
              {/* LEFT COLUMN: ORIGINAL SUBMITTED CONTENT (PRESERVED) */}
              {/* --------------------------------------------------- */}
              <div className="lg:col-span-5 bg-gray-50/80 rounded-2xl border border-gray-200 p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <h3 className="text-xs font-black text-gray-800 uppercase tracking-wider">
                    ૧. મૂળ સબમિટ કરેલ સામગ્રી (Original Content)
                  </h3>
                  <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-bold">
                    અપરિવર્તનીય (Read-Only)
                  </span>
                </div>

                {/* Original Headline */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">મૂળ હેડલાઇન:</label>
                  <p className="text-sm font-bold text-gray-900 bg-white p-3 rounded-xl border border-gray-200 leading-snug">
                    {reviewArticle.originalTitleGu || reviewArticle.titleGu || reviewArticle.title}
                  </p>
                </div>

                {/* Original Media Preview */}
                {(reviewArticle.featuredImage || reviewArticle.sourceItem?.rawImageUrl) && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">મૂળ છબી / મીડિયા:</label>
                    <div className="aspect-video rounded-xl overflow-hidden border bg-black">
                      <img
                        src={reviewArticle.featuredImage || reviewArticle.sourceItem?.rawImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Original Summary */}
                {(reviewArticle.originalDescriptionGu || reviewArticle.descriptionGu) && (
                  <div>
                    <label className="text-[11px] font-bold text-gray-500 block mb-1">મૂળ સારાંશ / સંક્ષેપ:</label>
                    <p className="text-xs text-gray-700 bg-white p-3 rounded-xl border border-gray-200 leading-relaxed">
                      {reviewArticle.originalDescriptionGu || reviewArticle.descriptionGu}
                    </p>
                  </div>
                )}

                {/* Original Content Body */}
                <div>
                  <label className="text-[11px] font-bold text-gray-500 block mb-1">સંપૂર્ણ મૂળ સામગ્રી:</label>
                  <div
                    className="text-xs text-gray-700 bg-white p-3.5 rounded-xl border border-gray-200 leading-relaxed space-y-2 max-h-60 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: reviewArticle.originalContent || reviewArticle.content || 'કોઈ સામગ્રી નથી',
                    }}
                  />
                </div>

                {/* Metadata details */}
                <div className="text-[11px] text-gray-500 pt-2 border-t space-y-1">
                  <p>
                    <strong>સ્ત્રોત / સંવાદદાતા:</strong>{' '}
                    {reviewArticle.reporter?.name || reviewArticle.source?.attributionName || 'સત્તાવાર બ્યુરો'}
                  </p>
                  <p>
                    <strong>સબમિશન તારીખ:</strong>{' '}
                    {new Date(reviewArticle.createdAt).toLocaleString('gu-IN')}
                  </p>
                  {reviewArticle.rejectionReason && (
                    <p className="text-red-600 font-semibold">
                      <strong>અગાઉ નકારવાનું કારણ:</strong> {reviewArticle.rejectionReason}
                    </p>
                  )}
                </div>
              </div>

              {/* --------------------------------------------------- */}
              {/* RIGHT COLUMN: EDITORIAL CONTENT & GEMINI AI BUTTON  */}
              {/* --------------------------------------------------- */}
              <div className="lg:col-span-7 space-y-5">
                {/* AI Assistant Banner (CRITICAL: Recreate News with AI) */}
                <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-white border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#7C3AED] text-white flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950">
                        Google Gemini AI સહાયક (AI News Recreator)
                      </h4>
                      <p className="text-[10px] text-purple-700">
                        મૂળ સમાચારના તથ્યો જાળવીને સંપૂર્ણ ગુજરાતી પત્રકારત્વ શૈલીમાં પુનઃનિર્માણ કરો
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={aiLanguage}
                      onChange={(e) => setAiLanguage(e.target.value as any)}
                      className="px-2 py-1 text-[11px] border border-purple-200 rounded-lg bg-white"
                    >
                      <option value="gu">ગુજરાતી</option>
                      <option value="hi">હિન્દી</option>
                      <option value="en">English</option>
                    </select>

                    <button
                      type="button"
                      disabled={aiRecreating}
                      onClick={handleAiRecreate}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#7C3AED] hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors whitespace-nowrap disabled:opacity-50"
                    >
                      {aiRecreating ? <Wand2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>AI થી સમાચાર ફરી તૈયાર કરો</span>
                    </button>
                  </div>
                </div>

                {/* Edited Headline */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-800">
                      સંપાદકીય હેડલાઇન (Gujarati Headline) *
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{formHeadlineGu.length}/150</span>
                  </div>
                  <input
                    type="text"
                    maxLength={150}
                    value={formHeadlineGu}
                    onChange={(e) => setFormHeadlineGu(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-bold focus:outline-none focus:border-[#202A72]"
                  />
                </div>

                {/* Edited Summary */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-gray-800">
                      સંપાદકીય સારાંશ (Summary) *
                    </label>
                    <span className="text-[10px] text-gray-400 font-mono">{formSummaryGu.length}/300</span>
                  </div>
                  <textarea
                    rows={2}
                    maxLength={300}
                    value={formSummaryGu}
                    onChange={(e) => setFormSummaryGu(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-[#202A72]"
                  />
                </div>

                {/* Rich Editor for Content with Inline Media Insertion */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    સંપૂર્ણ સમાચાર વર્ણન (Full Editorial Content) *
                  </label>
                  <RichNewsEditor value={formContent} onChange={setFormContent} />
                </div>

                {/* Category & Reporter Selectors */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">કેટેગરી *</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#202A72] bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameGu}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">સંવાદદાતા / રિપોર્ટર</label>
                    <select
                      value={formReporterId}
                      onChange={(e) => setFormReporterId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#202A72] bg-white"
                    >
                      <option value="">સત્તાવાર બ્યુરો (BN News Bureau)</option>
                      {reporters.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Featured Image Picker */}
                <div>
                  <MediaUploadPicker
                    label="મુખ્ય છબી (Featured Image)"
                    value={formFeaturedImage}
                    onChange={setFormFeaturedImage}
                    folder="news"
                  />
                </div>

                {/* Display Toggles */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap items-center gap-4 text-xs font-bold">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsFeatured}
                      onChange={(e) => setFormIsFeatured(e.target.checked)}
                      className="w-4 h-4 text-[#F58220] rounded"
                    />
                    <span className="text-gray-800">મુખ્ય સમાચાર (Featured)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsBreaking}
                      onChange={(e) => setFormIsBreaking(e.target.checked)}
                      className="w-4 h-4 text-[#ED1C2E] rounded"
                    />
                    <span className="text-gray-800">બ્રેકિંગ સમાચાર</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 rounded-xl text-xs font-bold transition-colors"
              >
                સમાચાર નકારો (Reject)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={handleSaveDraft}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  {saveLoading ? 'સાચવી રહ્યું છે...' : 'ડ્રાફ્ટ સાચવો'}
                </button>

                <button
                  type="button"
                  disabled={saveLoading}
                  onClick={handleApproveAndPublish}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>મંજૂર કરી પ્રકાશિત કરો (Approve & Publish)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* REJECT MODAL (MANDATORY REASON REQUIREMENT)                 */}
      {/* ----------------------------------------------------------- */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-sm text-red-700 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>સમાચાર નકારવાનું કારણ (Rejection Reason) *</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              સમાચાર નકારવા માટે યોગ્ય સંપાદકીય કારણ જણાવવું ફરજિયાત છે, જેથી રિપોર્ટર અથવા ઓડિટ લોગમાં સાચી વિગત સંગ્રહિત રહે.
            </p>

            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="દા.ત. અપૂર્ણ તથ્યો, અસ્પષ્ટ વિગતો અથવા પુષ્ટિ વગરના દાવાઓ..."
              className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-red-500"
            />

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                રદ કરો
              </button>
              <button
                type="button"
                disabled={!rejectReason.trim() || rejecting}
                onClick={handleRejectArticle}
                className="px-4 py-1.5 text-xs bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {rejecting ? 'નકારી રહ્યું છે...' : 'નકારવાની પુષ્ટિ કરો'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PendingNewsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-gray-400 font-gujarati animate-pulse">
          પેન્ડિંગ સમાચાર લોડ થઈ રહ્યા છે...
        </div>
      }
    >
      <PendingNewsContent />
    </Suspense>
  );
}
