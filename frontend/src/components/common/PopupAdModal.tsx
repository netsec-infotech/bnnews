'use client';

import React, { useEffect, useState } from 'react';
import { X, ExternalLink, Sparkles } from 'lucide-react';
import { AdPopup } from '../../lib/types';
import api from '../../lib/api';

export const PopupAdModal: React.FC = () => {
  const [popup, setPopup] = useState<AdPopup | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const shown = sessionStorage.getItem('bnnews_ad_popup_shown');
    if (shown) return;

    api
      .get('/ads/popup')
      .then((res) => {
        if (res.data?.data) {
          const p = res.data.data;
          setPopup(p);

          const delay = (p.delaySeconds || 3) * 1000;
          const timer = setTimeout(() => {
            setIsOpen(true);
            sessionStorage.setItem('bnnews_ad_popup_shown', 'true');

            // Record impression
            const isMobile = window.innerWidth < 768;
            api
              .post('/ad-events/impression', {
                campaignId: p.campaignId,
                deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
              })
              .catch(() => {});
          }, delay);

          return () => clearTimeout(timer);
        }
      })
      .catch(() => {});
  }, []);

  const handleClick = () => {
    if (!popup) return;
    const isMobile = window.innerWidth < 768;
    api
      .post('/ad-events/click', {
        campaignId: popup.campaignId,
        deviceType: isMobile ? 'MOBILE' : 'DESKTOP',
      })
      .catch(() => {});
  };

  if (!isOpen || !popup) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn font-gujarati">
      <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border border-gray-100 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-colors shadow-md"
          title="બંધ કરો"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Media / Creative */}
        <div className="relative h-60 w-full bg-gray-900 overflow-hidden">
          <img
            src={popup.mediaUrl}
            alt={popup.heading}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>ખાસ ઓફર (Special Offer)</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-black text-neutral-text leading-snug">
            {popup.headingGu || popup.heading}
          </h3>
          {(popup.descriptionGu || popup.description) && (
            <p className="text-xs text-neutral-muted leading-relaxed">
              {popup.descriptionGu || popup.description}
            </p>
          )}

          <div className="pt-3 flex items-center gap-3">
            <a
              href={popup.destinationUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              onClick={handleClick}
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-sm transition-all shadow-md"
            >
              <span>{popup.ctaButton}</span>
              <ExternalLink className="w-4 h-4 text-accent-gold" />
            </a>

            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold text-xs transition-colors"
            >
              પછી જુઓ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupAdModal;
