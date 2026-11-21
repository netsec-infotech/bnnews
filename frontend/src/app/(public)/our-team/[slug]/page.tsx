'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Mail, Phone, Award, Facebook, Instagram, Linkedin, Youtube, ShieldCheck } from 'lucide-react';
import { TeamMember } from '../../../../lib/types';
import api from '../../../../lib/api';

export default function TeamMemberDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api
      .get(`/team/${slug}`)
      .then((res) => {
        if (res.data?.success) {
          setMember(res.data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4 font-gujarati">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 font-gujarati">
        <h2 className="text-xl font-bold text-gray-800">ટીમ સભ્ય મળ્યા નથી.</h2>
        <Link href="/our-team" className="inline-block mt-4 text-primary font-bold hover:underline">
          ટીમ લિસ્ટ પર પાછા જાઓ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-gujarati">
      <Link
        href="/our-team"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>તમામ ટીમ સભ્યો</span>
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden border border-gray-200/80 shadow-xs p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
        {/* Profile Photo */}
        <div className="w-full md:w-72 shrink-0 aspect-[4/5] rounded-2xl overflow-hidden shadow-md bg-gray-100 border-2 border-secondary/20">
          <img
            src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
            alt={member.nameGu}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Member Details */}
        <div className="space-y-4 flex-1">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-bold text-xs">
              {member.department?.nameGu || 'સંપાદકીય વિભાગ'}
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-2">
              {member.nameGu}
            </h1>
            <p className="text-sm font-bold text-primary mt-0.5">
              {member.designationGu} ({member.designation})
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-secondary shrink-0" />
              <span>વિસ્તાર: <strong>{member.district || 'ગુજરાત'}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-secondary shrink-0" />
              <span>અનુભવ: <strong>{member.experienceYears}+ વર્ષ</strong></span>
            </div>
          </div>

          {member.bioGu && (
            <div className="pt-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-1">
                પરિચય (Biography)
              </h3>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                {member.bioGu}
              </p>
            </div>
          )}

          {/* Languages */}
          {member.languages && member.languages.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-gray-700">ભાષાઓ:</span>
              <div className="flex flex-wrap gap-1">
                {member.languages.map((lang, idx) => (
                  <span key={idx} className="bg-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-700">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
