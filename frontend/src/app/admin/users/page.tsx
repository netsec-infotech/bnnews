'use client';

import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Trash2, Shield, Key, Edit2, X, CheckCircle, Lock } from 'lucide-react';
import { User, Role } from '../../../lib/types';
import api from '../../../lib/api';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Create User State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('REPORTER');

  // Edit / Password Update State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState<Role>('REPORTER');
  const [newPassword, setNewPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState<string | null>(null);

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

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditRole(u.role);
    setNewPassword('');
    setUpdateMsg(null);
    setEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUpdating(true);
    setUpdateMsg(null);

    try {
      const payload: any = {
        name: editName.trim(),
        role: editRole,
      };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }

      const res = await api.put(`/admin/users/${editingUser.id}`, payload);
      if (res.data?.success) {
        setUpdateMsg('વપરાશકર્તા અને પાસવર્ડ સફળતાપૂર્વક અપડેટ થયા!');
        loadUsers();
        setTimeout(() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }, 1200);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'વપરાશકર્તા અપડેટ કરવામાં ક્ષતિ આવી');
    } finally {
      setUpdating(false);
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
    <div className="space-y-6 font-gujarati text-neutral-text">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-text flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <span>વપરાશકર્તા અને પરવાનગીઓ (Users & Roles)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            એડમિન, સંપાદક અને સંવાદદાતાઓના એકાઉન્ટ્સ અને પાસવર્ડનું સંચાલન
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md transition-colors w-fit"
        >
          <UserPlus className="w-4 h-4 text-accent-gold" />
          <span>નવા વપરાશકર્તા ઉમેરો</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">નામ</th>
              <th className="py-3 px-3">ઈમેલ</th>
              <th className="py-3 px-3">ભૂમિકા (Role)</th>
              <th className="py-3 px-3">સ્થિતિ</th>
              <th className="py-3 px-3">તારીખ</th>
              <th className="py-3 px-3 text-right">સંપાદન / પાસવર્ડ</th>
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
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px]"
                      title="પાસવર્ડ અથવા ભૂમિકા બદલો"
                    >
                      <Key className="w-3.5 h-3.5" />
                      <span>પાસવર્ડ બદલો</span>
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                      title="કાઢી નાખો"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE USER MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-neutral-text border-b border-gray-200 pb-2 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              <span>નવા વપરાશકર્તા ઉમેરો</span>
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
                  placeholder="admin@bnnews.com"
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
                  placeholder="દા.ત. BNnews@123"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ભૂમિકા (Role) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs bg-white"
                >
                  <option value="REPORTER">સંવાદદાતા (Reporter)</option>
                  <option value="EDITOR">સંપાદક (Editor)</option>
                  <option value="ADMIN">વ્યવસ્થાપક (Admin)</option>
                  <option value="SUPER_ADMIN">મુખ્ય વ્યવસ્થાપક (Super Admin)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER & UPDATE PASSWORD MODAL */}
      {editModalOpen && editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    પાસવર્ડ અને વપરાશકર્તા સંપાદન
                  </h3>
                  <p className="text-[11px] text-gray-500 font-mono">{editingUser.email}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {updateMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{updateMsg}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">વપરાશકર્તા નામ</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ભૂમિકા (Role)</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as Role)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs bg-white"
                >
                  <option value="REPORTER">સંવાદદાતા (Reporter)</option>
                  <option value="EDITOR">સંપાદક (Editor)</option>
                  <option value="ADMIN">વ્યવસ્થાપક (Admin)</option>
                  <option value="SUPER_ADMIN">મુખ્ય વ્યવસ્થાપક (Super Admin)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <label className="block font-bold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span>નવો પાસવર્ડ દાખલ કરો (New Password)</span>
                </label>
                <p className="text-[10px] text-gray-400 mb-1.5">
                  જો પાસવર્ડ બદલવો ન હોય તો આ ખાનું ખાલી છોડો.
                </p>
                <input
                  type="text"
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="દા.ત. BNnews@123"
                  className="w-full px-3 py-2 border border-blue-200 rounded-lg focus:outline-none focus:border-primary text-xs font-mono bg-blue-50/30"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700 font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold shadow-sm transition-colors disabled:opacity-50"
                >
                  {updating ? 'અપડેટ થઈ રહ્યું છે...' : 'પાસવર્ડ સાચવો (Update Password)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
