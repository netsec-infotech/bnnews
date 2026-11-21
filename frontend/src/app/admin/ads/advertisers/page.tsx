'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Plus, Trash2, Edit, Phone, Mail, Building, ArrowLeft, Search } from 'lucide-react';
import { Advertiser } from '../../../../lib/types';
import api from '../../../../lib/api';

export default function AdvertisersPage() {
  const [advertisers, setAdvertisers] = useState<Advertiser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Form
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');

  const loadAdvertisers = () => {
    setLoading(true);
    api
      .get('/admin/advertisers')
      .then((res) => {
        if (res.data?.success) setAdvertisers(res.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAdvertisers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/advertisers', {
        companyName,
        contactPerson,
        phone,
        email,
        gstNumber,
        address,
      });
      setModalOpen(false);
      setCompanyName('');
      setContactPerson('');
      setPhone('');
      setEmail('');
      setGstNumber('');
      setAddress('');
      loadAdvertisers();
    } catch {
      alert('જાહેરાતકર્તા ઉમેરવામાં નિષ્ફળતા.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('શું તમે આ જાહેરાતકર્તા અને તેમના તમામ કેમ્પેઇન કાઢી નાખવા માંગો છો?')) return;
    try {
      await api.delete(`/admin/advertisers/${id}`);
      loadAdvertisers();
    } catch {
      alert('કાઢી શકાયું નહીં.');
    }
  };

  const filtered = advertisers.filter(
    (a) =>
      a.companyName.toLowerCase().includes(search.toLowerCase()) ||
      a.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  return (
    <div className="space-y-6 font-gujarati text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/ads"
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-700" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              <span>જાહેરાતકર્તાઓ / ક્લાયન્ટ્સ (Advertisers)</span>
            </h1>
            <p className="text-xs text-gray-500">
              તમામ રજિસ્ટર્ડ કંપનીઓ, બ્રાન્ડ્સ અને સંપર્ક અધિકારીઓનું સંચાલન
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-md transition-colors w-fit"
        >
          <Plus className="w-4 h-4 text-accent-gold" />
          <span>નવો ક્લાયન્ટ ઉમેરો</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="કંપની, સંપર્ક વ્યક્તિ અથવા ફોન નંબર શોધો..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-primary bg-white shadow-2xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">કંપનીનું નામ</th>
                <th className="py-3 px-4">સંપર્ક વ્યક્તિ</th>
                <th className="py-3 px-4">સંપર્ક વિગતો</th>
                <th className="py-3 px-4">GST નંબર</th>
                <th className="py-3 px-4">કુલ કેમ્પેઇન</th>
                <th className="py-3 px-4 text-right">ક્રિયાઓ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length > 0 ? (
                filtered.map((adv) => (
                  <tr key={adv.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-gray-900 text-sm">
                      {adv.companyName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      {adv.contactPerson}
                    </td>
                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-gray-600 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{adv.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{adv.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">
                      {adv.gstNumber || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[11px]">
                        {adv._count?.campaigns || 0} કેમ્પેઇન
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDelete(adv.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    કોઈ જાહેરાતકર્તા મળ્યા નથી.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Advertiser Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
              નવો જાહેરાતકર્તા ઉમેરો (Add Advertiser)
            </h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">કંપની / બ્રાન્ડનું નામ *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="દા.ત. અદાણી વિલ્મર"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">સંપર્ક વ્યક્તિ *</label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="દા.ત. પ્રિયા દેસાઈ"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ફોન નંબર *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 00000"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ઈમેલ એડ્રેસ *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ads@company.in"
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">GSTIN નંબર</label>
                  <input
                    type="text"
                    value={gstNumber}
                    onChange={(e) => setGstNumber(e.target.value)}
                    placeholder="24AAAC..."
                    className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">સરનામું</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="એસ.જી. હાઇવે, અમદાવાદ"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold"
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
