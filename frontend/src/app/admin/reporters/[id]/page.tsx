'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, User, Briefcase, Globe, Loader2, Eye } from 'lucide-react';
import api from '../../../../lib/api';
import MediaUploadPicker from '../../../../components/common/MediaUploadPicker';

export default function EditReporterPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    designation: '',
    profileImage: '',
    biography: '',
    location: '',
    email: '',
    phone: '',
    experience: '',
    languages: '',
    specialization: '',
    facebook: '',
    instagram: '',
    youtube: '',
    twitter: '',
    status: 'ACTIVE',
    isFeatured: false,
    joiningDate: '',
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/admin/reporters/${id}`)
      .then((res) => {
        if (res.data?.success && res.data.data) {
          const r = res.data.data;
          setForm({
            name: r.name || '',
            slug: r.slug || '',
            designation: r.designation || '',
            profileImage: r.profileImage || '',
            biography: r.biography || '',
            location: r.location || '',
            email: r.email || '',
            phone: r.phone || '',
            experience: r.experience || '',
            languages: Array.isArray(r.languages) ? r.languages.join(', ') : '',
            specialization: r.specialization || '',
            facebook: r.socialLinks?.facebook || '',
            instagram: r.socialLinks?.instagram || '',
            youtube: r.socialLinks?.youtube || '',
            twitter: r.socialLinks?.twitter || '',
            status: r.status || 'ACTIVE',
            isFeatured: Boolean(r.isFeatured),
            joiningDate: r.joiningDate ? new Date(r.joiningDate).toISOString().split('T')[0] : '',
          });
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'રિપોર્ટર મેળવવામાં નિષ્ફળતા.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('રિપોર્ટરનું પૂરું નામ દાખલ કરવું જરૂરી છે.');
      return;
    }

    setSubmitting(true);
    try {
      const languagesArray = form.languages
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        designation: form.designation.trim(),
        profileImage: form.profileImage || null,
        biography: form.biography.trim() || null,
        location: form.location.trim() || 'ગુજરાત',
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        experience: form.experience.trim() || null,
        languages: languagesArray.length > 0 ? languagesArray : ['ગુજરાતી'],
        specialization: form.specialization.trim() || null,
        status: form.status,
        isFeatured: form.isFeatured,
        joiningDate: form.joiningDate ? new Date(form.joiningDate) : undefined,
        socialLinks: {
          facebook: form.facebook.trim() || undefined,
          instagram: form.instagram.trim() || undefined,
          youtube: form.youtube.trim() || undefined,
          twitter: form.twitter.trim() || undefined,
        },
      };

      const res = await api.put(`/admin/reporters/${id}`, payload);
      if (res.data?.success) {
        router.push('/admin/reporters');
      } else {
        setError(res.data?.message || 'અપડેટ કરવામાં નિષ્ફળતા.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'રિપોર્ટર અપડેટ કરતી વખતે ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 font-gujarati">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs text-gray-500 font-bold">રિપોર્ટર વિગતો લોડ થઈ રહી છે...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-gujarati pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-xs border border-gray-100">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/reporters"
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              રિપોર્ટર સંપાદન (Edit Reporter)
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              /{form.slug} ની પ્રોફાઇલ અને માહિતી અપડેટ કરો
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {form.slug && (
            <Link
              href={`/reporter/${form.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-bold text-gray-700"
            >
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>પબ્લિક પ્રોફાઇલ</span>
            </Link>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ફેરફારો સાચવો</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
          <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <span>મૂળભૂત માહિતી (Basic Information)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                રિપોર્ટરનું પૂરું નામ (Full Name) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                પદવી (Designation) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                required
                value={form.designation}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                વિસ્તાર / જિલ્લો (Location) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                required
                value={form.location}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">સ્ટેટસ (Status)</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-primary"
              >
                <option value="ACTIVE">સક્રિય (Active)</option>
                <option value="INACTIVE">નિષ્ક્રિય (Inactive)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <MediaUploadPicker
              label="પ્રોફાઇલ ફોટો (Profile Image)"
              value={form.profileImage}
              onChange={(url) => setForm((prev) => ({ ...prev, profileImage: url }))}
              acceptType="image"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ટૂંકી જીવનરેખા / પરિચય (Short Biography) <span className="text-red-500">*</span>
            </label>
            <textarea
              name="biography"
              rows={4}
              required
              value={form.biography}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              checked={form.isFeatured}
              onChange={handleChange}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-gray-800 cursor-pointer">
              મુખ્ય રિપોર્ટર તરીકે દર્શાવો (Featured Reporter)
            </label>
          </div>
        </div>

        {/* Card 2: Contact & Professional */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
          <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" />
            <span>વ્યવસાયિક અને સંપર્ક વિગતો</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ઈમેલ (Email)</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">મોબાઇલ / ફોન (Phone)</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">અનુભવ (Experience)</label>
              <input
                type="text"
                name="experience"
                value={form.experience}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">ભાષાઓ (Languages)</label>
              <input
                type="text"
                name="languages"
                value={form.languages}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">વિશેષતા / બીટ (Specialization)</label>
              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Social Links */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-gray-100 space-y-5">
          <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span>સોશિયલ મીડિયા પ્રોફાઇલ્સ</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Facebook URL</label>
              <input
                type="url"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Instagram URL</label>
              <input
                type="url"
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">X / Twitter URL</label>
              <input
                type="url"
                name="twitter"
                value={form.twitter}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">YouTube URL</label>
              <input
                type="url"
                name="youtube"
                value={form.youtube}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-xs border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/reporters"
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50"
          >
            રદ કરો
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>ફેરફારો સાચવો</span>
          </button>
        </div>
      </form>
    </div>
  );
}
