'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, ExternalLink, Bell, User as UserIcon, ChevronDown, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminHeader: React.FC<{
  onToggleSidebar: () => void;
  sidebarTheme?: 'light' | 'dark';
  onToggleSidebarTheme?: () => void;
}> = ({ onToggleSidebar, sidebarTheme = 'light', onToggleSidebarTheme }) => {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile hamburger & CMS title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors"
          title="મેનુ ખોલો"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-gujarati text-sm md:text-base font-bold text-gray-800">
          સંચાલન પેનલ (Admin Management CMS)
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 font-gujarati text-xs">
        {/* Sidebar Theme Switcher Pill */}
        {onToggleSidebarTheme && (
          <button
            onClick={onToggleSidebarTheme}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all shadow-2xs ${
              sidebarTheme === 'light'
                ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                : 'bg-indigo-900 border-indigo-700 text-indigo-100 hover:bg-indigo-800'
            }`}
            title={`સાઇડબાર થીમ: ${sidebarTheme === 'light' ? 'લાઇટ' : 'ડાર્ક'} (ક્લિક કરી બદલો)`}
          >
            {sidebarTheme === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span className="hidden sm:inline">લાઇટ સાઇડબાર</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300" />
                <span className="hidden sm:inline">ડાર્ક સાઇડબાર</span>
              </>
            )}
          </button>
        )}

        {/* View Public Website */}
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold transition-all shadow-2xs"
        >
          <ExternalLink className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">વેબસાઇટ જુઓ</span>
        </Link>

        {/* Bell Notification Icon with Red Dot */}
        <button className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E51F2A] rounded-full ring-2 ring-white"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-8 h-8 rounded-full bg-[#141b4d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4 text-white" />}
          </div>
          <div className="hidden sm:flex items-center gap-1 cursor-pointer">
            <span className="font-bold text-gray-800 text-xs">
              {user?.role === 'SUPER_ADMIN' ? 'મુખ્ય વ્યવસ્થાપક' : user?.name || 'સંપાદક'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;