'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Megaphone, CheckCircle2, TrendingUp, Users, Target, Phone, Mail, Send, Sparkles } from 'lucide-react';
import api from '../../../lib/api';

export default function AdvertiseWithUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    budget: '',
    placement: 'homepage_below_breaking',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/advertisers', {
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        notes: `બજેટ: ${formData.budget} | રસપ્રદ પ્લેસમેન્ટ: ${formData.placement} | વિગતો: ${formData.notes}`,
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 font-gujarati">
      {/* Hero Header */}
      <div className="bg-[#141b4d] text-white p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl border-b-4 border-secondary text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-white text-xs font-bold uppercase tracking-wider shadow-xs">
          <Sparkles className="w-4 h-4" />
          <span>ગુજરાતનું સૌથી ઝડપથી વિકસતું ડિજિટલ સમાચાર નેટવર્ક</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
          તમારા વ્યવસાયનો વિસ્તાર કરો BN NEWS ગુજરાતી સાથે
        </h1>

        <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">
          ગુજરાતના લાખો વાચકો અને દર્શકો સુધી પહોંચો. વેબસાઇટ બેનર્સ, ઇન-આર્ટિકલ જાહેરાતો, વાયરલ શોર્ટ્સ અને સ્પોન્સર્ડ કન્ટેન્ટ દ્વારા શ્રેષ્ઠ પરિણામ મેળવો.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-1">
          <p className="text-3xl font-black text-primary">૫ લાખ+</p>
          <p className="text-xs text-gray-600 font-bold">માસિક વાચકો</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-1">
          <p className="text-3xl font-black text-secondary">૧૨ લાખ+</p>
          <p className="text-xs text-gray-600 font-bold">માસિક પેજ વ્યૂઝ</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-1">
          <p className="text-3xl font-black text-[#E51F2A]">૨૪ કલાક</p>
          <p className="text-xs text-gray-600 font-bold">જીવંત પ્રસારણ સક્રિય</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-xs text-center space-y-1">
          <p className="text-3xl font-black text-emerald-600">૩૩ જિલ્લા</p>
          <p className="text-xs text-gray-600 font-bold">સમગ્ર ગુજરાતમાં કવરેજ</p>
        </div>
      </div>

      {/* Placements & Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-2xl border border-gray-200/80 shadow-xs">
          <h2 className="text-xl font-black text-gray-900 mb-2">
            જાહેરાત અંગે પૂછપરછ ફોર્મ (Inquiry Form)
          </h2>
          <p className="text-xs text-gray-500 mb-6">
            નીચેની વિગતો ભરો. અમારી માર્કેટિંગ ટીમ આપનો ૨૪ કલાકમાં સંપર્ક કરશે.
          </p>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-800">આપની પૂછપરછ સફળતાપૂર્વક નોંધાઈ ગઈ છે!</h3>
              <p className="text-xs text-emerald-700">અમારી એડવર્ટાઇઝિંગ ટીમ ટૂંક સમયમાં આપનો સંપર્ક કરશે.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">કંપની / બ્રાન્ડનું નામ *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                    placeholder="દા.ત. રિલાયન્સ ડિજિટલ"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">સંપર્ક કરનાર વ્યક્તિ *</label>
                  <input
                    type="text"
                    required
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                    placeholder="દા.ત. ભાવિન શાહ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">મોબાઇલ નંબર *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                    placeholder="+91 98250 00000"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">ઈમેલ એડ્રેસ *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">રસપ્રદ પ્લેસમેન્ટ</label>
                <select
                  value={formData.placement}
                  onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary bg-white"
                >
                  <option value="homepage_below_breaking">હોમપેજ મુખ્ય બેનર (ટોપ)</option>
                  <option value="news_right_sidebar">સમાચાર સાઇડબાર</option>
                  <option value="homepage_between_latest">ઇન-ફીડ સ્પોન્સર્ડ જાહેરાત</option>
                  <option value="popup_website_entry">સ્પેશિયલ એન્ટ્રી પોપઅપ</option>
                  <option value="live_tv_below_player">લાઈવ ટીવી સ્પોન્સરશિપ</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">વધારાની વિગતો / સંદેશ</label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                  placeholder="આપના કેમ્પેઇન અને સમયગાળા વિશે ટૂંકમાં જણાવો..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>પૂછપરછ મોકલો</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Contact & Rate Info (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#141b4d] text-white p-6 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-bold">સીધો માર્કેટિંગ સંપર્ક</h3>
            <div className="space-y-3 text-xs text-gray-200">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary shrink-0" />
                <span>+91 79 2658 0000 / +91 98250 12345</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary shrink-0" />
                <span>ads@bnnews.in / marketing@bnnews.in</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-gray-900">જાહેરાત પ્લેસમેન્ટ્સ લાભો</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>વાસ્તવિક ઇમ્પ્રેશન અને ક્લિક ટ્રેકિંગ</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ડેસ્કટોપ અને મોબાઇલ બંને પ્લેટફોર્મ પર અનુકૂળ</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>જીએસટી ઇન્વોઇસ અને ઝંઝટમુક્ત બિલિંગ</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
