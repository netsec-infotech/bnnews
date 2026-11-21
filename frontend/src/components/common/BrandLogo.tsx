'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'white';
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'light',
  showTagline = true,
}) => {
  return (
    <Link href="/" className={`inline-flex items-center gap-3.5 group select-none shrink-0 ${className}`}>
      {/* Strictly constrained Circular Logo */}
      <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-full overflow-hidden shadow-sm bg-white border-2 border-gray-100 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="BN NEWS ગુજરાતી"
          className="w-full h-full object-contain p-0.5"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.jpg';
          }}
        />
      </div>

      {/* Brand Text formatted exactly as shown in screenshot */}
      <div className="flex flex-col justify-center">
        {/* Row 1: BN (Red) + NEWS (Navy) + ગુજરાતી (Navy Badge with White text) */}
        <div className="flex items-center gap-2 leading-none">
          <span className="font-sans font-black text-2xl md:text-3xl tracking-tight text-breaking">
            BN
          </span>
          <span className={`font-sans font-black text-2xl md:text-3xl tracking-tight ${variant === 'white' ? 'text-white' : 'text-primary'}`}>
            NEWS
          </span>
          <span className="bg-primary text-white font-gujarati font-extrabold text-sm md:text-base px-2.5 py-1 rounded-md shadow-xs">
            ગુજરાતી
          </span>
        </div>

        {showTagline && (
          <div className="flex items-center gap-2 mt-1.5">
            <span className="inline-flex items-center gap-1 bg-breaking text-white text-[10px] md:text-[11px] font-sans font-bold italic px-2 py-0.5 rounded-full shadow-xs">
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>LIVE 24 x 7</span>
            </span>
            <span
              className={`text-xs font-gujarati font-semibold truncate ${
                variant === 'white' ? 'text-gray-200' : 'text-gray-600'
              }`}
            >
              તમારા વિસ્તારની, તમારા ભાષામાં...
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default BrandLogo;
