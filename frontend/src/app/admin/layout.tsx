'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import api from '../../lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState<number>(108);

  useEffect(() => {
    if (user) {
      api
        .get('/admin/dashboard')
        .then((res) => {
          if (res.data?.data?.kpi?.pendingNews !== undefined) {
            setPendingCount(res.data.data.kpi.pendingNews);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Client-side authentication guard (Must be declared before any conditional return)
  useEffect(() => {
    if (pathname !== '/admin/login' && !loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router, pathname]);

  // If on login page, render clean layout without sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-gujarati">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold text-primary">સુરક્ષિત સત્ર લોડ થઈ રહ્યું છે...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingCount={pendingCount}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <AdminHeader onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
