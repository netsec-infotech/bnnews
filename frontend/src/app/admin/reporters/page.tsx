'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ExternalLink,
  MapPin,
  Mail,
  Phone,
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
} from 'lucide-react';
import api from '../../../lib/api';
import { Reporter } from '../../../lib/types';
import { getMediaUrl } from '../../../lib/media';

export default function AdminReportersPage() {
  const [reporters, setReporters] = useState<Reporter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReporters = () => {
    setLoading(true);
    const query = new URLSearchParams({
      page: page.toString(),
      limit: '15',
      status: statusFilter,
      search: search.trim(),
    });

    api
      .get(`/admin/reporters?${query.toString()}`)
      .then((res) => {
        if (res.data?.success) {
          setReporters(res.data.data);
          setTotalPages(res.data.meta?.totalPages || 1);
          setTotal(res.data.meta?.total || 0);
        }
      })
      .catch((err) => console.error('Failed to fetch reporters:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReporters();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReporters();
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const res = await api.patch(`/admin/reporters/${id}/status`);
      if (res.data?.success) {
        setReporters((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: res.data.data.status } : r))
        );
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'સ્ટેટસ બદલવામાં ક્ષતિ આવી.');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await api.delete(`/admin/reporters/${deleteId}`);
      if (res.data?.success) {
        setDeleteId(null);
        fetchReporters();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'રિપોર્ટર ડિલીટ કરવામાં ક્ષતિ આવી.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              ન્યૂઝ રિપોર્ટર સંચાલન (Reporter Management)
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            તમામ સ્થાનિક અને વિશેષ સંવાદદાતાઓની વિગતો, પ્રોફાઇલ અને લેખોનું સંચાલન
          </p>
        </div>

        <Link
          href="/admin/reporters/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>નવા રિપોર્ટર ઉમેરો</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="નામ, પદવી, જિલ્લો અથવા ઈમેલથી શોધો..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
          >
            શોધો
          </button>
        </form>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500 font-bold">સ્ટેટસ:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-primary"
          >
            <option value="ALL">તમામ રિપોર્ટર્સ</option>
            <option value="ACTIVE">સક્રિય (Active)</option>
            <option value="INACTIVE">નિષ્ક્રિય (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Reporters Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-xs text-gray-500 font-bold">રિપોર્ટર્સ લોડ થઈ રહ્યા છે...</p>
          </div>
        ) : reporters.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-gray-300 mx-auto" />
            <p className="text-sm font-bold text-gray-600">કોઈ રિપોર્ટર મળ્યા નથી</p>
            <Link
              href="/admin/reporters/create"
              className="text-xs font-bold text-primary hover:underline inline-block"
            >
              પ્રથમ રિપોર્ટર ઉમેરો →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">રિપોર્ટર</th>
                  <th className="py-3.5 px-4">પદવી & વિશેષતા</th>
                  <th className="py-3.5 px-4">સ્થળ & સંપર્ક</th>
                  <th className="py-3.5 px-4 text-center">લેખો (Articles)</th>
                  <th className="py-3.5 px-4 text-center">સ્ટેટસ</th>
                  <th className="py-3.5 px-4 text-right">ક્રિયાઓ (Actions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reporters.map((reporter) => (
                  <tr key={reporter.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Reporter Avatar + Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                          <img
                            src={getMediaUrl(reporter.profileImage) || '/logo.png'}
                            alt={reporter.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/logo.png';
                            }}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-gray-900 text-sm">{reporter.name}</span>
                            {reporter.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 text-[9px] font-bold">
                                મુખ્ય
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">/{reporter.slug}</span>
                        </div>
                      </div>
                    </td>

                    {/* Designation & Specialization */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-gray-800">{reporter.designation}</div>
                      {reporter.specialization && (
                        <div className="text-[11px] text-gray-500 mt-0.5">{reporter.specialization}</div>
                      )}
                    </td>

                    {/* Location & Contact */}
                    <td className="py-3.5 px-4 text-gray-600 space-y-0.5">
                      {reporter.location && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span>{reporter.location}</span>
                        </div>
                      )}
                      {reporter.email && (
                        <div className="flex items-center gap-1 text-[11px] font-mono text-gray-500">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span>{reporter.email}</span>
                        </div>
                      )}
                      {reporter.phone && (
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span>{reporter.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Articles Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs">
                        <FileText className="w-3 h-3" />
                        <span>{reporter._count?.news ?? 0}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(reporter.id, reporter.status)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                          reporter.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="સ્ટેટસ બદલવા ક્લિક કરો"
                      >
                        {reporter.status === 'ACTIVE' ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>સક્રિય</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>નિષ્ક્રિય</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Public Profile */}
                        <Link
                          href={`/reporter/${reporter.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-primary transition-colors"
                          title="પબ્લિક પ્રોફાઇલ જુઓ"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Edit Reporter */}
                        <Link
                          href={`/admin/reporters/${reporter.id}`}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-blue-600 transition-colors"
                          title="સંપાદિત કરો"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete Reporter */}
                        <button
                          onClick={() => setDeleteId(reporter.id)}
                          className="p-1.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="ડિલીટ કરો"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-gray-500">કુલ {total} માંથી પેજ {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-50"
              >
                અગાઉ
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-bold text-gray-700 disabled:opacity-50"
              >
                આગળ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-gray-900">રિપોર્ટર ડિલીટ કરવા માંગો છો?</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                આ ક્રિયાથી રિપોર્ટરની પ્રોફાઇલ કાયમ માટે હટી જશે. તેમના દ્વારા લખાયેલા લેખો ડિલીટ થશે નહીં.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50"
              >
                રદ કરો
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1"
              >
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>ડિલીટ કરો</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
