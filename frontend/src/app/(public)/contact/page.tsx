'use client';

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl p-6 md:p-10 border border-neutral-border shadow-xs font-gujarati space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">સંપર્ક કરો (Contact Us)</h1>
        <p className="text-sm text-neutral-muted mt-1">
          તમારા પ્રશ્નો, સૂચનો કે સમાચારની વિગતો શેર કરવા માટે નીચેના ફોર્મનો ઉપયોગ કરો.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-text">મુખ્ય કાર્યાલય</h4>
              <p className="text-sm text-neutral-muted mt-0.5">
                2nd Floor, Office No 207/1 ,Akshar Plaza Complex Padra, Padra, Gujarat 391440
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-text">ફોન હેલ્પલાઇન</h4>
              <p className="text-sm text-neutral-muted mt-0.5">
                <a href="tel:+919099676267" className="hover:text-primary font-bold">+91 90996 76267</a>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-neutral-text">સંપાદકીય ઈમેલ</h4>
              <p className="text-sm text-neutral-muted mt-0.5">editor@bnnews.in / contact@bnnews.in</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-6 text-center">
              <h3 className="font-bold text-lg mb-1">આભાર!</h3>
              <p className="text-sm">તમારો સંદેશ સફળતાપૂર્વક મોકલવામાં આવ્યો છે. અમારી ટીમ ટૂંક સમયમાં તમારો સંપર્ક કરશે.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">તમારું પૂરું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="નામ દાખલ કરો"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ઈમેલ સરનામું *</label>
                <input
                  type="email"
                  required
                  placeholder="ઈમેલ દાખલ કરો"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">વિષય / સમાચાર શીર્ષક</label>
                <input
                  type="text"
                  placeholder="વિષય દાખલ કરો"
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">સંદેશ / વિગત *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="તમારો સંદેશ અહીં લખો..."
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>સંદેશ મોકલો</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
