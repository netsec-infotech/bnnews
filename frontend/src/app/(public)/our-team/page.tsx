'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ChevronRight } from 'lucide-react';

const REAL_TEAM_MEMBERS = [
  { id: 1, image: '/images/team/Team-1.jpeg' },
  { id: 2, image: '/images/team/Team-2.jpeg' },
  { id: 3, image: '/images/team/Team-3.jpeg' },
  { id: 4, image: '/images/team/Team-4.jpeg' },
  { id: 5, image: '/images/team/Team-5.jpeg' },
];

export default function OurTeamPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 font-gujarati pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-gujarati text-gray-500">
        <Link href="/" className="hover:text-primary flex items-center gap-1 transition-colors">
          <Home className="w-3.5 h-3.5" />
          <span>મુખ્ય પૃષ્ઠ</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-bold text-gray-800">અમારી ટીમ</span>
      </nav>

      {/* High-Tech Newsroom Banner */}
      <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-slate-700/20 bg-[#0c1432]">
        <img
          src="/images/team/team-banner.jpg"
          alt="અમારી ટીમ - OUR TEAM - BN NEWS ગુજરાતી"
          className="w-full h-auto object-cover block"
        />
      </div>

      {/* Real Team Members High-Resolution Badges */}
      <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-xs border border-gray-100">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 justify-items-center max-w-6xl mx-auto">
          {REAL_TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-center transition-transform duration-300 hover:scale-105"
            >
              <img
                src={member.image}
                alt=""
                className="w-44 h-44 sm:w-52 sm:h-52 object-contain rounded-full shadow-lg hover:shadow-2xl transition-shadow duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
