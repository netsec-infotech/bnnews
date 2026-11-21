'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Trash2, Edit, Award, MapPin, Search, Star } from 'lucide-react';
import { TeamMember, TeamDepartment } from '../../../lib/types';
import api from '../../../lib/api';

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<TeamDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const loadTeam = () => {
    setLoading(true);
    Promise.all([
      api.get('/admin/team/members').catch(() => ({ data: { data: [] } })),
      api.get('/admin/team/departments').catch(() => ({ data: { data: [] } })),
    ]).then(([memRes, deptRes]) => {
      if (memRes.data?.data) setMembers(memRes.data.data);
      if (deptRes.data?.data) setDepartments(deptRes.data.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTeam();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે આ ટીમ સભ્યને કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/team/members/${id}`);
      loadTeam();
    } catch {
      alert('કાઢી શકાયું નહીં.');
    }
  };

  const filtered = members.filter((m) => {
    if (deptFilter !== 'ALL' && m.departmentId !== deptFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.nameGu.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.designationGu.toLowerCase().includes(q) ||
        (m.district && m.district.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>અમારી ટીમ વ્યવસ્થાપન (Our Team CMS)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            સંપાદકીય મંડળ, ન્યૂઝ એન્કર્સ, રિપોર્ટર્સ અને જિલ્લા બ્યુરો ચીફનું સંચાલન
          </p>
        </div>

        <Link
          href="/admin/team/create"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-colors w-fit"
        >
          <Plus className="w-4 h-4 text-accent-gold" />
          <span>નવો ટીમ સભ્ય ઉમેરો</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setDeptFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              deptFilter === 'ALL'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            બધા સભ્યો ({members.length})
          </button>
          {departments.map((d) => (
            <button
              key={d.id}
              onClick={() => setDeptFilter(d.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                deptFilter === d.id
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {d.nameGu}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="સભ્યનું નામ અથવા જિલ્લો શોધો..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary bg-white shadow-2xs"
          />
        </div>
      </div>

      {/* Team Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">સભ્યનું નામ</th>
                <th className="py-3 px-4">હોદ્દો (Designation)</th>
                <th className="py-3 px-4">વિભાગ (Department)</th>
                <th className="py-3 px-4">જિલ્લો</th>
                <th className="py-3 px-4">અનુભવ</th>
                <th className="py-3 px-4">વિશેષ સભ્ય</th>
                <th className="py-3 px-4 text-right">ક્રિયા</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-3.5 px-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                      <img
                        src={m.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{m.nameGu}</h4>
                      <p className="text-[10px] text-gray-400">{m.name}</p>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-secondary">
                    {m.designationGu}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[10px]">
                      {m.department?.nameGu || 'વિભાગ'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-600">
                    {m.district || 'વડોદરા'}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                    {m.experienceYears} વર્ષ
                  </td>

                  <td className="py-3.5 px-4">
                    {m.isFeatured ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-bold text-[10px] bg-amber-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>લીડરશિપ</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[10px]">-</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="કાઢી નાખો"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
