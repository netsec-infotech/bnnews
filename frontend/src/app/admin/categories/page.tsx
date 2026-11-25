'use client';

import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Layers,
  Compass,
  Check,
  X,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { Category } from '../../../lib/types';
import api from '../../../lib/api';

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    nameGu: '',
    slug: '',
    order: 0,
    description: '',
    parentId: '',
    showInNavbar: true,
    showOnHome: true,
    isSubmenu: false,
    openInNewTab: false,
  });

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
    setForm({
      name: '',
      nameGu: '',
      slug: '',
      order: categories.length + 1,
      description: '',
      parentId: '',
      showInNavbar: true,
      showOnHome: true,
      isSubmenu: false,
      openInNewTab: false,
    });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditId(c.id);
    setForm({
      name: c.name,
      nameGu: c.nameGu,
      slug: c.slug,
      order: c.order,
      description: c.description || '',
      parentId: c.parentId || '',
      showInNavbar: c.showInNavbar ?? true,
      showOnHome: c.showOnHome ?? true,
      isSubmenu: Boolean(c.parentId || c.isSubmenu),
      openInNewTab: c.openInNewTab ?? false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name.trim(),
        nameGu: form.nameGu.trim(),
        slug: form.slug.trim(),
        order: Number(form.order) || 0,
        description: form.description.trim() || null,
        parentId: form.parentId ? form.parentId : null,
        showInNavbar: Boolean(form.showInNavbar),
        showOnHome: Boolean(form.showOnHome),
        isSubmenu: Boolean(form.parentId || form.isSubmenu),
        openInNewTab: Boolean(form.openInNewTab),
      };

      if (editId) {
        await api.put(`/admin/categories/${editId}`, payload);
      } else {
        await api.post('/admin/categories', payload);
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

  // Potential parent categories (exclude self if editing)
  const availableParents = categories.filter((c) => !c.parentId && (!editId || c.id !== editId));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6 font-gujarati">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
              ડાયનેમિક કેટેગરી & નેવિગેશન સંચાલન
            </h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            મુખ્ય નેવબાર મેનૂ, પેટા-મેનૂ (Submenus), ડિસ્પ્લે ક્રમ અને શ્રેણીઓનું સંપૂર્ણ નિયંત્રણ
          </p>
        </div>

        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-hover transition-all shadow-xs w-fit"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>નવી કેટેગરી ઉમેરો</span>
        </button>
      </div>

      {/* Categories Table with Hierarchy */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-gray-500 font-bold">કેટેગરી લોડ થઈ રહી છે...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 uppercase text-[10px] font-bold tracking-wider border-b border-gray-200">
                <th className="py-3 px-3">ક્રમ</th>
                <th className="py-3 px-3">ગુજરાતી નામ</th>
                <th className="py-3 px-3">અંગ્રેજી નામ</th>
                <th className="py-3 px-3">સ્લગ (URL)</th>
                <th className="py-3 px-3">પેરન્ટ કેટેગરી</th>
                <th className="py-3 px-3 text-center">નેવબાર</th>
                <th className="py-3 px-3 text-center">કુલ સમાચાર</th>
                <th className="py-3 px-3 text-right">ક્રિયાઓ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-primary">{c.order}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      {c.parentId && <span className="text-gray-300">↳</span>}
                      <span className={`font-bold text-gray-900 ${c.parentId ? 'text-xs text-gray-700' : 'text-sm'}`}>
                        {c.nameGu}
                      </span>
                      {c.children && c.children.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[9px] font-bold">
                          {c.children.length} પેટા-મેનૂ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-medium">{c.name}</td>
                  <td className="py-3 px-3 font-mono text-gray-400 text-[11px]">/{c.slug}</td>
                  <td className="py-3 px-3">
                    {c.parent ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[10px]">
                        <Layers className="w-3 h-3" />
                        {c.parent.nameGu}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-[11px]">— મુખ્ય કેટેગરી —</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {c.showInNavbar ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                        <Check className="w-3 h-3" /> હા
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
                        <X className="w-3 h-3" /> ના
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-gray-800">
                    {c._count?.news || 0}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50 transition-colors"
                        title="સંપાદિત કરો"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Compass className="w-5 h-5 text-primary" />
              <span>{editId ? 'કેટેગરી સંપાદિત કરો' : 'નવી કેટેગરી ઉમેરો'}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ગુજરાતી નામ *</label>
                  <input
                    type="text"
                    required
                    value={form.nameGu}
                    onChange={(e) => setForm({ ...form, nameGu: e.target.value })}
                    placeholder="દા.ત. ગુજરાત"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">અંગ્રેજી નામ *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="દા.ત. Gujarat"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">સ્લગ (URL Path) *</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="gujarat"
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">ડિસ્પ્લે ક્રમ (Order)</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs font-mono"
                  />
                </div>
              </div>

              {/* Hierarchy: Parent Category */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  પેરન્ટ કેટેગરી (Parent Menu / Hierarchy)
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary text-xs"
                >
                  <option value="">— મુખ્ય મેનૂ (કોઈ પેરન્ટ નથી) —</option>
                  {availableParents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameGu} ({p.name})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-1">
                  જો પેરન્ટ કેટેગરી પસંદ કરશો, તો આ તેની નીચે ડ્રોપડાઉન સબ-મેનૂ (Submenu) તરીકે દેખાશે.
                </p>
              </div>

              {/* Navigation Options */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2.5">
                <span className="font-bold text-gray-800 block text-[11px]">નેવિગેશન સેટિંગ્સ:</span>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showInNavbar"
                    checked={form.showInNavbar}
                    onChange={(e) => setForm({ ...form, showInNavbar: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="showInNavbar" className="text-gray-700 font-bold cursor-pointer">
                    મુખ્ય નેવબારમાં દર્શાવો (Show in Main Navbar)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOnHome"
                    checked={form.showOnHome}
                    onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="showOnHome" className="text-gray-700 font-bold cursor-pointer">
                    હોમપેજ પર સમાચાર સેક્શન દર્શાવો (Show on Homepage)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="openInNewTab"
                    checked={form.openInNewTab}
                    onChange={(e) => setForm({ ...form, openInNewTab: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                  />
                  <label htmlFor="openInNewTab" className="text-gray-700 font-bold cursor-pointer">
                    નવા ટેબમાં લિંક ખોલો (Open in New Tab)
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">વર્ણન (Description)</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="કેટેગરીનું ટૂંકું વર્ણન..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover shadow-xs"
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
