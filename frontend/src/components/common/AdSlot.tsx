'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { SlotAdData } from '../../lib/types';
import api from '../../lib/api';

interface AdSlotProps {
  placement: string;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const [ad, setAd] = useState<SlotAdData | null>(null);
  const [impressionRecorded, setImpressionRecorded] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get(`/ads/slot/${placement}`)
      .then((res) => {
        if (isMounted && res.data?.data) {
          setAd(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [placement]);

  // Track Genuine Impression with IntersectionObserver
  useEffect(() => {
    if (!ad || impressionRecorded || !adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !impressionRecorded) {
            setImpressionRecorded(true);
            const isMobile = window.innerWidth < 768;
            api
              .post('/ad-events/impression', {
                campaignId: ad.campaignId,
                placementId: ad.placementId,
                deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
              })
              .catch(() => {});
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 } // 50% of the ad must be visible
    );

    observer.observe(adRef.current);

    return () => observer.disconnect();
  }, [ad, impressionRecorded]);

  const handleClick = () => {
    if (!ad) return;
    const isMobile = window.innerWidth < 768;
    api
      .post('/ad-events/click', {
        campaignId: ad.campaignId,
        placementId: ad.placementId,
        deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
      })
      .catch(() => {});
  };

  if (!ad) {
    return null;
  }

  const creativeUrl = ad.desktopCreative || ad.mobileCreative;

  return (
    <div
      ref={adRef}
      className={`relative my-4 overflow-hidden rounded-xl bg-gray-50 border border-gray-200/80 shadow-2xs group ${className}`}
    >
      {/* Sponsored Pill Badge */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/60 backdrop-blur-xs text-white text-[10px] font-gujarati font-semibold px-2 py-0.5 rounded-full pointer-events-none">
        <Info className="w-2.5 h-2.5 text-secondary" />
        <span>જાહેરાત • {ad.advertiserName}</span>
      </div>

      <a
        href={ad.landingPageUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block relative w-full overflow-hidden hover:opacity-95 transition-opacity"
      >
        <img
          src={creativeUrl}
          alt={ad.altText || ad.name}
          className="w-full h-auto object-cover max-h-[280px] group-hover:scale-101 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 bg-white/90 text-primary font-bold text-[11px] font-gujarati px-2.5 py-1 rounded-md shadow-xs opacity-0 group-hover:opacity-100 transition-opacity">
          <span>{ad.name}</span>
          <ExternalLink className="w-3 h-3 text-secondary" />
        </div>
      </a>
    </div>
  );
};

export default AdSlot;
