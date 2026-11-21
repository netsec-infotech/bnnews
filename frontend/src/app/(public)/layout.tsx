import React from 'react';
import Header from '../../components/public/Header';
import Navbar from '../../components/public/Navbar';
import BreakingNewsTicker from '../../components/public/BreakingNewsTicker';
import Footer from '../../components/public/Footer';
import PopupAdModal from '../../components/common/PopupAdModal';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-bg">
      <Header />
      <Navbar />
      <BreakingNewsTicker />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>
      <Footer />
      <PopupAdModal />
    </div>
  );
}
