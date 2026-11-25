'use client';

import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Calendar,
  X,
  Loader2,
  FileText,
} from 'lucide-react';
import api from '../../../lib/api';
import { ContactEnquiry } from '../../../lib/types';

export default function AdminContactEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [enquiryTypeFilter, setEnquiryTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedEnquiry, setSelectedEnquiry] = useState<ContactEnquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchEnquiries = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      status: statusFilter,
      enquiryType: enquiryTypeFilter,
      search: search.trim(),
    });

    api
      .get(`/admin/contact-enquiries?${query.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setEnquiries(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
          setTotal(res.data.meta?.total || 0);
        }
      })
      .catch((err) => console.error('Failed to fetch enquiries:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEnquiries();
  }, [page, statusFilter, enquiryTypeFilter]);

  const handleOpenDetail = (item: ContactEnquiry) => {
    setSelectedEnquiry(item);
    setNotes(item.internalNotes || '');
    if (item.status === 'PENDING') {
      // Auto mark read on backend
      api.get(`/admin/contact-enquiries/${item.id}`).catch(() => {});
      setEnquiries((prev) =>
        prev.map((e) => (e.id === item.id ? { ...e, status: 'READ' } : e))
      );
    }
  };

  const handleSaveStatus = async (newStatus: string) => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const res = await api.put(`/admin/contact-enquiries/${selectedEnquiry.id}`, {
        status: newStatus,
        internalNotes: notes,
      });
      if (res.data?.success) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus as any, internalNotes: notes } : null));
        fetchEnquiries();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'અપડેટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ પૂછપરછ ડિલીટ કરવા માંગો છો?')) return;
    try {
      const res = await api.delete(`/admin/contact-enquiries/${id}`);
      if (res.data?.success) {
        if (selectedEnquiry?.id === id) setSelectedEnquiry(null);
        fetchEnquiries();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'ડિલીટ કરવામાં ક્ષતિ આવી.');
    }
  };

  const getEnquiryTypeBadge = (type: string) => {
    switch (type) {
      case 'NEWS_SUBMISSION':
        return <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">સમાચાર સબમિશન</span>;
      case 'ADVERTISEMENT':
        return <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">જાહેરાત પૂછપરછ</span>;
      case 'REPORTER_CAREER':
        return <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-bold text-[10px]">રિપોર્ટર જોડાઓ</span>;
      case 'PARTNERSHIP':
        return <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">ભાગીદારી</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-bold text-[10px]">સામાન્ય પૂછપરછ</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold text-[10px] flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> નવું</span>;
      case 'READ':
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px] flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> વાંચેલ</span>;
      case 'REPLIED':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> જવાબ અપાયેલ</span>;
      case 'ARCHIVED':
        return <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold text-[10px]">આર્કાઇવ</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              સંપર્ક અને પૂછપરછ સંચાલન (Contact Enquiries)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            વેબસાઇટ મુલાકાતીઓ, જાહેરાતકર્તાઓ અને ન્યૂઝ સબમિશનની તમામ પૂછપરછો
          </p>
        </div>

        <div className="px-3 py-1.5 rounded-xl bg-blue-50 text-primary font-bold text-xs border border-blue-100 flex items-center gap-2">
          <span>કુલ સંદેશાઓ:</span>
          <span className="font-mono text-sm">{total}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            fetchEnquiries();
          }}
          className="flex-1 flex gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="નામ, ઈમેલ, વિષય અથવા સંદેશાથી શોધો..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
          >
            શોધો
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={enquiryTypeFilter}
              onChange={(e) => {
                setEnquiryTypeFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white"
            >
              <option value="ALL">તમામ પ્રકાર</option>
              <option value="GENERAL">સામાન્ય પૂછપરછ</option>
              <option value="NEWS_SUBMISSION">સમાચાર સબમિશન</option>
              <option value="ADVERTISEMENT">જાહેરાત પૂછપરછ</option>
              <option value="REPORTER_CAREER">રિપોર્ટર જોડાઓ</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white"
          >
            <option value="ALL">તમામ સ્ટેટસ</option>
            <option value="PENDING">નવું (Pending)</option>
            <option value="READ">વાંચેલ (Read)</option>
            <option value="REPLIED">જવાબ અપાયેલ (Replied)</option>
            <option value="ARCHIVED">આર્કાઇવ (Archived)</option>
          </select>
        </div>
      </div>

      {/* Enquiries Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-gray-500 font-bold">પૂછપરછો લોડ થઈ રહી છે...</p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-600">કોઈ નવી પૂછપરછ નથી</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">મોકલનાર</th>
                  <th className="py-3.5 px-4">પ્રકાર & વિષય</th>
                  <th className="py-3.5 px-4">સંદેશો (પ્રીવ્યૂ)</th>
                  <th className="py-3.5 px-4 text-center">તારીખ</th>
                  <th className="py-3.5 px-4 text-center">સ્ટેટસ</th>
                  <th className="py-3.5 px-4 text-right">ક્રિયા</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enquiries.map((enq) => (
                  <tr
                    key={enq.id}
                    onClick={() => handleOpenDetail(enq)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{enq.name}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 font-mono">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{enq.email}</span>
                      </div>
                      {enq.phone && (
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{enq.phone}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div>{getEnquiryTypeBadge(enq.enquiryType)}</div>
                      <div className="font-bold text-gray-800 line-clamp-1">{enq.subject}</div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-gray-600 line-clamp-2 text-xs leading-relaxed">
                        {enq.message}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-center text-gray-500 text-[11px] whitespace-nowrap">
                      {new Date(enq.createdAt).toLocaleDateString('gu-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(enq.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(enq.id);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="ડિલીટ કરો"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">પેજ {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-bold disabled:opacity-50"
              >
                અગાઉ
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-bold disabled:opacity-50"
              >
                આગળ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                {getEnquiryTypeBadge(selectedEnquiry.enquiryType)}
                {getStatusBadge(selectedEnquiry.status)}
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-400 font-bold block mb-0.5">વિષય (Subject):</span>
                <h3 className="text-sm font-black text-gray-900">{selectedEnquiry.subject}</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-bold block">મોકલનાર:</span>
                  <span className="font-bold text-gray-800">{selectedEnquiry.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 font-bold block">ઈમેલ:</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="text-blue-600 font-mono underline">
                    {selectedEnquiry.email}
                  </a>
                </div>
                {selectedEnquiry.phone && (
                  <div>
                    <span className="text-gray-400 font-bold block">ફોન:</span>
                    <a href={`tel:${selectedEnquiry.phone}`} className="text-emerald-700 font-bold">
                      {selectedEnquiry.phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 font-bold block">તારીખ:</span>
                  <span className="text-gray-700">
                    {new Date(selectedEnquiry.createdAt).toLocaleString('gu-IN')}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-400 font-bold block mb-1">સંપૂર્ણ સંદેશો:</span>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedEnquiry.message}
                </div>
              </div>

              <div>
                <label className="text-gray-700 font-bold block mb-1">આંતરિક નોંધ (Internal Notes):</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="આ પૂછપરછ અંગે કરેલી કાર્યવાહી કે નોંધ અહીં લખો..."
                  rows={3}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleDelete(selectedEnquiry.id)}
                className="text-red-500 hover:text-red-700 text-xs font-bold"
              >
                ડિલીટ કરો
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveStatus('READ')}
                  disabled={updating}
                  className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold hover:bg-gray-50"
                >
                  વાંચેલ માર્ક કરો
                </button>
                <button
                  onClick={() => handleSaveStatus('REPLIED')}
                  disabled={updating}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs flex items-center gap-1"
                >
                  {updating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>જવાબ આપ્યો (Replied)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
