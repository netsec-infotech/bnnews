'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const FULL_BLEED_ROUTES = ['/about-us', '/contact-us', '/reporters', '/e-paper'];

export default function PublicMainContainer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullBleed = FULL_BLEED_ROUTES.some((route) => pathname === route);

  if (isFullBleed) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
      {children}
    </main>
  );
}
