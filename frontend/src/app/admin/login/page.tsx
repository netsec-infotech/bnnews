'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import BrandLogo from '../../../components/common/BrandLogo';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data?.success && res.data.token) {
        login(res.data.token, res.data.user);
        router.push('/admin');
      } else {
        setError(res.data?.message || 'લૉગિન નિષ્ફળ ગયું');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'ઈમેલ અથવા પાસવર્ડ અમાન્ય છે અથવા સર્વર કનેક્શનમાં ક્ષતિ છે.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-neutral-bg flex items-center justify-center p-4 font-gujarati">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border-t-4 border-secondary relative overflow-hidden">
        {/* Subtle decorative gold line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent-gold"></div>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <BrandLogo size="lg" className="mx-auto" />
          </div>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-primary font-bold uppercase tracking-wider bg-blue-50 py-1 px-3 rounded-full mx-auto w-fit border border-blue-200">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>સંપાદકીય સુરક્ષિત લૉગિન (Editorial CMS)</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              ઈમેલ સરનામું (Email Address)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bnnewsgujarati.com"
                className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              પાસવર્ડ (Password)
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary transition-colors font-sans"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 mt-6 text-sm"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <span>લૉગિન કરો (Sign In)</span>
                <ArrowRight className="w-4 h-4 text-accent-gold" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-3 border-t border-gray-100 text-center text-xs text-neutral-muted flex flex-col gap-1">
          <span className="font-bold text-neutral-text">BN NEWS GUJARATI</span>
          <span className="text-[10px] text-gray-400">સંપાદકીય સુરક્ષિત પ્રમાણીકરણ પ્રણાલી</span>
        </div>
      </div>
    </div>
  );
}
