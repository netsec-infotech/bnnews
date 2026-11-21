'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Shield } from 'lucide-react';
import { User, Role } from '../../../lib/types';
import api from '../../../lib/api';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('REPORTER');

  const loadUsers = () => {
    setLoading(true);
    api
      .get('/admin/users')
      .then((res) => {
        if (res.data?.success) setUsers(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', { name, email, password, role });
      setModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'વપરાશકર્તા બનાવી શકાયા નહીં');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ વપરાશકર્તાને કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાયા નહીં');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span>વપરાશકર્તાઓ અને ભૂમિકાઓ (Users & Roles)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            સુપર એડમિન, એડમિન, એડિટર અને રિપોર્ટર અધિકાર વ્યવસ્થાપન
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all shadow-sm w-fit"
        >
          <UserPlus className="w-4 h-4 text-secondary" />
          <span>નવા વપરાશકર્તા ઉમેરો</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">નામ</th>
              <th className="py-3 px-3">ઈમેલ</th>
              <th className="py-3 px-3">ભૂમિકા (Role)</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3">તારીખ</th>
              <th className="py-3 px-3 text-right">ક્રિયા</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/60">
                <td className="py-3 px-3 font-bold text-neutral-text flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center uppercase">
                    {u.name.charAt(0)}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="py-3 px-3 font-mono text-gray-600">{u.email}</td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.role === 'SUPER_ADMIN'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'ADMIN'
                        ? 'bg-blue-100 text-blue-800'
                        : u.role === 'EDITOR'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                    સક્રિય
                  </span>
                </td>
                <td className="py-3 px-3 text-gray-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString('gu-IN') : ''}
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-neutral-text border-b border-gray-200 pb-2">
              નવા વપરાશકર્તા ઉમેરો
            </h2>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">પૂરું નામ *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="નામ દાખલ કરો"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ઈમેલ સરનામું *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@bnnews.in"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">પાસવર્ડ *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ઓછામાં ઓછા ૬ અક્ષર"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ભૂમિકા (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-bold"
                >
                  <option value="REPORTER">REPORTER (સમાચાર બનાવી શકે, માત્ર ડ્રાફ્ટ)</option>
                  <option value="EDITOR">EDITOR (સમીક્ષા કરી શકે, મંજૂર કરી શકે)</option>
                  <option value="ADMIN">ADMIN (સમાચાર, કેટેગરી અને મીડિયા સંચાલન)</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN (સંપૂર્ણ સિસ્ટમ ઍક્સેસ)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-1.5 border rounded-lg text-gray-600"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark"
                >
                  ઉમેરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
