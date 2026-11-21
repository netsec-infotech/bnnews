'use client';

import React, { useEffect, useState } from 'react';
import { FolderTree, Plus, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Category } from '../../../lib/types';
import api from '../../../lib/api';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameGu, setFormNameGu] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formOrder, setFormOrder] = useState(0);
  const [formDesc, setFormDesc] = useState('');

  const loadCategories = () => {
    setLoading(true);
    api
      .get('/admin/categories')
      .then((res) => {
        if (res.data?.success) setCategories(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setFormName('');
    setFormNameGu('');
    setFormSlug('');
    setFormOrder(categories.length + 1);
    setFormDesc('');
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setFormName(c.name);
    setFormNameGu(c.nameGu);
    setFormSlug(c.slug);
    setFormOrder(c.order);
    setFormDesc(c.description || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/admin/categories/${editId}`, {
          name: formName,
          nameGu: formNameGu,
          slug: formSlug,
          order: formOrder,
          description: formDesc,
        });
      } else {
        await api.post('/admin/categories', {
          name: formName,
          nameGu: formNameGu,
          slug: formSlug,
          order: formOrder,
          description: formDesc,
        });
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'સાચવતી વખતે ભૂલ થઈ');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે ખરેખર આ કેટેગરી કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      loadCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'કાઢી શકાતી નથી');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 space-y-6 font-gujarati">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-text flex items-center gap-2">
            <FolderTree className="w-5 h-5 text-primary" />
            <span>કેટેગરી સંચાલન (Categories Management)</span>
          </h1>
          <p className="text-xs text-neutral-muted mt-0.5">
            સમાચાર શ્રેણીઓ, ક્રમ અને ડિફોલ્ટ ગુજરાતી વર્ગીકરણ
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary-dark transition-all shadow-sm w-fit"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>નવી કેટેગરી ઉમેરો</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-neutral-muted uppercase text-[10px] border-b border-gray-200">
            <tr>
              <th className="py-3 px-3">ક્રમ</th>
              <th className="py-3 px-3">ગુજરાતી નામ</th>
              <th className="py-3 px-3">અંગ્રેજી નામ</th>
              <th className="py-3 px-3">સ્લગ (URL)</th>
              <th className="py-3 px-3">કુલ સમાચાર</th>
              <th className="py-3 px-3 text-right">ક્રિયા</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/60">
                <td className="py-3 px-3 font-mono font-bold text-primary">{c.order}</td>
                <td className="py-3 px-3 font-bold text-neutral-text text-sm">{c.nameGu}</td>
                <td className="py-3 px-3 text-neutral-muted">{c.name}</td>
                <td className="py-3 px-3 font-mono text-gray-500">/{c.slug}</td>
                <td className="py-3 px-3 font-bold">{c._count?.news || 0}</td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                      title="સંપાદિત કરો"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
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

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-base font-bold text-neutral-text border-b border-gray-200 pb-2">
              {editId ? 'કેટેગરી સંપાદિત કરો' : 'નવી કેટેગરી ઉમેરો'}
            </h2>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">ગુજરાતી નામ *</label>
                <input
                  type="text"
                  required
                  value={formNameGu}
                  onChange={(e) => setFormNameGu(e.target.value)}
                  placeholder="દા.ત. ગુજરાત"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">અંગ્રેજી નામ *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="દા.ત. Gujarat"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">સ્લગ (URL) *</label>
                <input
                  type="text"
                  required
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="gujarat"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">ડિસ્પ્લે ક્રમ (Order)</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">વર્ણન</label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-primary text-xs"
                />
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
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
