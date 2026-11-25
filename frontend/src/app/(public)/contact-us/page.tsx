'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Phone,
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  Building,
  User,
  List,
  Edit3,
  CheckCircle,
  AlertCircle,
  Mic,
  Megaphone,
  Users,
  FileText,
  Facebook,
  Instagram,
  Youtube,
} from 'lucide-react';
import api from '../../../lib/api';

export default function ContactUsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/settings')
      .then((res) => {
        if (res.data?.success && Array.isArray(res.data.data)) {
          const map: Record<string, string> = {};
          res.data.data.forEach((s: any) => {
            map[s.key] = s.value;
          });
          setSettings(map);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const phoneVal = settings.contact_phone || '+91 90996 76267';
  const emailVal = settings.contact_email || 'editor@bnnewsgujarati.com';
  const whatsappVal = settings.contact_whatsapp || '+91 90996 76267';
  const hoursVal =
    settings.contact_working_hours || 'સોમવાર થી શનિવાર, સવારે 10:00 થી સાંજે 07:00';
  const addressVal =
    settings.contact_address || '2nd Floor, Office No 207/1, Akshar Plaza Complex Padra, Padra, Gujarat 391440';
  const mapsEmbedUrl =
    settings.contact_maps_url ||
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14777.625625477813!2d73.06941584348633!3d22.235955353597327!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395fc39396e053a1%3A0xe54955bce56feae4!2sPadra%2C%20Gujarat%20391440!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name.trim() || !phone.trim() || !email.trim() || !subject || !message.trim()) {
      setError('કૃપા કરીને તમામ જરૂરી માહિતી ભરો.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact/submit', {
        name,
        phone,
        email,
        subject,
        message,
        enquiryType: subject,
      });

      if (res.data?.success) {
        setSuccess(true);
        setName('');
        setPhone('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setError(res.data?.message || 'સંદેશ મોકલવામાં નિષ્ફળ.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'સંપર્ક સબમિટ કરતી વખતે ક્ષતિ આવી.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-gujarati space-y-8 pb-8">
      {/* ========================================================= */}
      {/* 1. TOP HEADER BANNER (EXACT TO REFERENCE SCREENSHOT)       */}
      {/* ========================================================= */}
      <section className="relative w-full h-36 sm:h-44 md:h-52 lg:h-56 max-h-[220px] overflow-hidden bg-[#101738] shadow-sm border-b border-blue-950 m-0 p-0">
        <img
          src="/banners/contact_banner.png"
          alt="અમારો સંપર્ક કરો - Contact Us - BN News Gujarati"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle dark overlay */}
        <div className="absolute inset-0 bg-black/25 pointer-events-none" />
      </section>

      {/* ========================================================= */}
      {/* 2. MAIN 3-COLUMN CONTACT SECTION (MATCHING SCREENSHOT)    */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ------------------------------------------------------- */}
          {/* COLUMN 1: સંપર્ક માહિતી (Left Card)                     */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-[#E4E7EF] p-5 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-black text-[#171B32]">સંપર્ક માહિતી</h2>
              <div className="w-10 h-0.5 bg-[#ED1C2E] mt-1.5" />
            </div>

            <div className="space-y-4">
              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 text-[#ED1C2E] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B32]">ફોન</h4>
                  <a
                    href={`tel:${phoneVal.replace(/\s+/g, '')}`}
                    className="text-xs text-[#687085] hover:text-[#202A72] font-semibold"
                  >
                    {phoneVal}
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 text-[#ED1C2E] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B32]">ઈમેલ</h4>
                  <a
                    href={`mailto:${emailVal}`}
                    className="text-xs text-[#687085] hover:text-[#202A72] font-semibold break-all"
                  >
                    {emailVal}
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 text-[#ED1C2E] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B32]">
                    વોટ્સએપ <span className="text-[10px] text-[#ED1C2E] font-normal">(સમાચાર મોકલો)</span>
                  </h4>
                  <a
                    href={`https://wa.me/${whatsappVal.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#687085] hover:text-emerald-600 font-semibold"
                  >
                    {whatsappVal}
                  </a>
                </div>
              </div>

              {/* Working Hours */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-red-50 text-[#ED1C2E] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171B32]">કાર્ય સમય</h4>
                  <p className="text-xs text-[#687085] leading-snug">{hoursVal}</p>
                </div>
              </div>
            </div>

            {/* Follow Us */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-0.5 bg-[#ED1C2E] inline-block" />
                <span className="text-xs font-bold text-[#171B32]">અમને ફોલો કરો</span>
                <span className="w-6 h-0.5 bg-[#ED1C2E] inline-block" />
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href="https://facebook.com/bnnewsgujarati"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://instagram.com/bnnewsgujarati"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-pink-600 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Instagram className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://youtube.com/@bnnewsgujarati2323"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Youtube className="w-3.5 h-3.5" />
                </a>
                <a
                  href="https://x.com/bnnewsgujarati"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center hover:scale-110 transition-transform text-[11px] font-bold"
                >
                  𝕏
                </a>
                <a
                  href="https://t.me/bnnewsgujarati"
                  target="_blank"
                  rel="noreferrer"
                  className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Send className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------- */}
          {/* COLUMN 2: અમને સંદેશ મોકલો (Center Contact Form)        */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E4E7EF] p-5 md:p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-50 text-[#ED1C2E] flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#171B32]">અમને સંદેશ મોકલો</h2>
                <p className="text-[11px] text-[#687085]">
                  તમારા સૂચન, પ્રતિસાદ, સમાચાર પ્રેસ રિલીઝ અથવા જાહેરાત માટે નીચેનું ફોર્મ ભરો.
                </p>
              </div>
            </div>

            {success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>તમારો સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે! અમે ટૂંક સમયમાં સંપર્ક કરીશું.</span>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="તમારું નામ *"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#202A72]"
                  />
                  <User className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                {/* Mobile Number */}
                <div className="relative">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="મોબાઈલ નંબર *"
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs focus:outline-none focus:border-[#202A72]"
                  />
                  <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Email Address */}
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ઈમેલ સરનામું *"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:border-[#202A72]"
                />
                <Mail className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>

              {/* Subject Dropdown */}
              <div className="relative">
                <select
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#202A72] bg-white text-gray-700"
                >
                  <option value="">વિષય પસંદ કરો *</option>
                  <option value="GENERAL">સામાન્ય પૂછપરછ (General Enquiry)</option>
                  <option value="NEWS_SUBMISSION">સમાચાર સબમિશન (News Submission)</option>
                  <option value="PRESS_RELEASE">પ્રેસ રિલીઝ (Press Release)</option>
                  <option value="ADVERTISEMENT">જાહેરાત (Advertisement)</option>
                  <option value="PARTNERSHIP">સહયોગ / ભાગીદારી (Partnership)</option>
                  <option value="FEEDBACK">પ્રતિસાદ (Feedback)</option>
                  <option value="OTHER">અન્ય (Other)</option>
                </select>
                <List className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* Message Details */}
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="તમારો સંદેશ લખો... *"
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl text-xs leading-relaxed focus:outline-none focus:border-[#202A72]"
                />
                <Edit3 className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-3.5" />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#ED1C2E] hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'સંદેશ મોકલી રહ્યું છે...' : 'સંદેશ મોકલો'}</span>
              </button>
            </form>
          </div>

          {/* ------------------------------------------------------- */}
          {/* COLUMN 3: અમારું કાર્યાલય (Right Card with Map & Studio)  */}
          {/* ------------------------------------------------------- */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E4E7EF] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-red-50 text-[#ED1C2E] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-black text-[#171B32]">અમારું કાર્યાલય</h2>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2.5 text-xs text-[#687085] bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              <Building className="w-4 h-4 text-[#202A72] shrink-0 mt-0.5" />
              <p className="leading-snug">
                <strong className="text-[#171B32] block font-bold">BN News Gujarati</strong>
                {addressVal}
              </p>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-xl overflow-hidden border border-gray-200 aspect-[16/10] bg-gray-100">
              <iframe
                src={mapsEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Office Map"
              />
            </div>

            {/* Studio Image */}
            <div className="relative rounded-xl overflow-hidden shadow-xs border border-gray-200 aspect-[16/9] bg-slate-900 group">
              <img
                src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80"
                alt="BN News Studio"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                <div className="bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-bold border border-white/20">
                  BN NEWS ગુજરાતી ન્યૂઝ સ્ટુડિયો
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM NAVY 4-ITEM FEATURE BAR (MATCHING SCREENSHOT)   */}
      {/* ========================================================= */}
      <section className="bg-[#101738] text-white py-6 px-4 border-t border-blue-900/50 mt-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-blue-900/60 text-xs">
          {/* Feature 1 */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0">
            <div className="w-10 h-10 rounded-full bg-blue-900/60 text-white flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">સમાચાર મોકલો</h4>
              <p className="text-[11px] text-gray-300">તમારા વિસ્તારના મહત્વના સમાચાર</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-full bg-blue-900/60 text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">જાહેરાત માટે સંપર્ક</h4>
              <p className="text-[11px] text-gray-300">વ્યવસાયની બ્રાન્ડિંગ અને જાહેરાત</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-full bg-blue-900/60 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">સહયોગ અને ભાગીદારી</h4>
              <p className="text-[11px] text-gray-300">મીડિયા સહયોગ, ઇવેન્ટ કવરેજ</p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-center gap-3 pt-3 sm:pt-0 lg:pl-6">
            <div className="w-10 h-10 rounded-full bg-blue-900/60 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-gray-200" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">પ્રેસ રિલીઝ</h4>
              <p className="text-[11px] text-gray-300">તમારા સંસ્થાના અપડેટ અમને મોકલો</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
