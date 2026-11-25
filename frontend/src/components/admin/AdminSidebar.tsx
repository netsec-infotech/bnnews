'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Clock,
  Newspaper,
  PlusCircle,
  Rss,
  FolderTree,
  Image as ImageIcon,
  Radio,
  TrendingUp,
  Megaphone,
  Layers,
  Sparkles,
  BarChart2,
  Share2,
  Video,
  UserCheck,
  MessageSquare,
  Settings,
  LogOut,
  Briefcase,
  Shield,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string | number;
  roles?: string[];
}

export const AdminSidebar: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}> = ({ isOpen, onClose, pendingCount = 108, theme = 'light', onToggleTheme }) => {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const isLight = theme === 'light';

  // "Our Team CMS" is removed as requested by the user since Reporter page manages editorial staff
  const navItems: NavItem[] = [
    { title: 'ડેશબોર્ડ (Dashboard)', href: '/admin', icon: LayoutDashboard },
    { title: 'પેન્ડિંગ સમીક્ષા', href: '/admin/pending', icon: Clock, badge: pendingCount || 108 },
    { title: 'તમામ સમાચાર', href: '/admin/news', icon: Newspaper },
    { title: 'નવો સમાચાર ઉમેરો', href: '/admin/news/create', icon: PlusCircle },
    { title: 'રિપોર્ટર્સ (Reporters)', href: '/admin/reporters', icon: UserCheck },
    { title: 'વિડીયો અને રીલ્સ', href: '/admin/videos', icon: Video },
    { title: 'RSS સ્ત્રોતો', href: '/admin/rss-sources', icon: Rss },
    { title: 'કેટેગરી વ્યવસ્થાપન', href: '/admin/categories', icon: FolderTree },
    { title: 'મીડિયા લાયબ્રેરી', href: '/admin/media', icon: ImageIcon },
    { title: 'જાહેરાત કેમ્પેઇન', href: '/admin/ads', icon: Megaphone },
    { title: 'જાહેરાતકર્તાઓ (Clients)', href: '/admin/ads/advertisers', icon: Briefcase },
    { title: 'પ્લેસમેન્ટ સિલેક્ટર', href: '/admin/ads/placements', icon: Layers },
    { title: 'પોપઅપ જાહેરાતો', href: '/admin/ads/popups', icon: Sparkles },
    { title: 'એડ રિપોર્ટિંગ & બિલિંગ', href: '/admin/ads/reports', icon: BarChart2 },
    { title: 'સોશિયલ મીડિયા (Meta)', href: '/admin/social', icon: Share2 },
    { title: 'સંપર્ક પૂછપરછ (Enquiries)', href: '/admin/contact-enquiries', icon: MessageSquare },
    { title: 'બ્રેકિંગ સમાચાર', href: '/admin/breaking', icon: Radio },
    { title: 'ટ્રેન્ડિંગ સમાચાર', href: '/admin/trending', icon: TrendingUp },
    { title: 'વપરાશકર્તાઓ', href: '/admin/users', icon: Shield, roles: ['SUPER_ADMIN'] },
    { title: 'સેટિંગ્સ (Settings)', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return hasRole(...item.roles);
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 z-50 flex flex-col justify-between transition-all duration-300 lg:translate-x-0 overflow-hidden ${
          isLight
            ? 'bg-white text-gray-800 border-r border-gray-200/90 shadow-sm'
            : 'bg-[#141b4d] text-white shadow-2xl'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex-1 flex flex-col min-h-0 z-10">
          {/* Brand Logo Header */}
          <div
            className={`p-4 flex flex-col items-center justify-center text-center shrink-0 border-b ${
              isLight ? 'border-gray-100 bg-gray-50/40' : 'border-white/10 bg-[#0f143a]'
            }`}
          >
            <div
              className={`w-20 h-20 rounded-2xl p-1.5 shadow-sm flex items-center justify-center overflow-hidden border mb-2 transition-transform hover:scale-105 ${
                isLight ? 'bg-white border-gray-200' : 'bg-white border-white/40'
              }`}
            >
              <img
                src="/logo.png"
                alt="BN News Gujarati"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h1
              className={`font-gujarati font-extrabold text-sm tracking-wide ${
                isLight ? 'text-gray-900' : 'text-white'
              }`}
            >
              BN NEWS ગુજરાતી
            </h1>
            
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5 font-gujarati text-xs scrollbar-thin">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group ${
                    active
                      ? isLight
                        ? 'bg-[#202A72] text-white font-bold shadow-xs'
                        : 'bg-[#F58220] text-white font-bold shadow-xs'
                      : isLight
                      ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 font-medium'
                      : 'text-gray-300 hover:text-white hover:bg-white/10 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active
                          ? 'text-white'
                          : isLight
                          ? 'text-gray-400 group-hover:text-gray-700'
                          : 'text-gray-400 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{item.title}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        active
                          ? 'bg-white text-gray-900'
                          : isLight
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#ED1C2E] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Theme Toggle & Logout */}
        <div
          className={`p-3 border-t shrink-0 space-y-2 ${
            isLight ? 'border-gray-100 bg-gray-50/40' : 'border-white/10 bg-[#0f143a]'
          }`}
        >
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isLight
                  ? 'border-gray-200 text-gray-600 hover:bg-white hover:text-gray-900'
                  : 'border-white/10 text-gray-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {isLight ? (
                  <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300" />
                )}
                <span>{isLight ? 'લાઇટ થીમ' : 'ડાર્ક થીમ'}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-gray-400">સ્વિચ</span>
            </button>
          )}

          <button
            onClick={logout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
              isLight
                ? 'text-red-600 hover:bg-red-50'
                : 'text-red-300 hover:text-red-100 hover:bg-red-500/20'
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>લૉગઆઉટ (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
