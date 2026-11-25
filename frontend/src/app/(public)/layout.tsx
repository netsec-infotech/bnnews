import React from 'react';
import Header from '../../components/public/Header';
import Navbar from '../../components/public/Navbar';
import BreakingNewsTicker from '../../components/public/BreakingNewsTicker';
import Footer from '../../components/public/Footer';
import PopupAdModal from '../../components/common/PopupAdModal';
import PublicMainContainer from '../../components/public/PublicMainContainer';

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
      <PublicMainContainer>{children}</PublicMainContainer>
      <Footer />
      <PopupAdModal />
    </div>
  );
}
