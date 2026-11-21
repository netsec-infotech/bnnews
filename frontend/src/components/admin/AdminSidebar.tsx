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
  Users,
  Settings,
  LogOut,
  Briefcase,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string | number;
  roles?: string[];
}

export const AdminSidebar: React.FC<{ isOpen: boolean; onClose: () => void; pendingCount?: number }> = ({
  isOpen,
  onClose,
  pendingCount = 108,
}) => {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();

  const navItems: NavItem[] = [
    { title: 'ડેશબોર્ડ', href: '/admin', icon: LayoutDashboard },
    { title: 'પેન્ડિંગ સમાચાર', href: '/admin/pending', icon: Clock, badge: pendingCount || 108 },
    { title: 'તમામ સમાચાર', href: '/admin/news', icon: Newspaper },
    { title: 'નવો સમાચાર ઉમેરો', href: '/admin/news/create', icon: PlusCircle },
    { title: 'RSS સ્ત્રોતો', href: '/admin/rss-sources', icon: Rss },
    { title: 'જાહેરાત કેમ્પેઇન', href: '/admin/ads', icon: Megaphone },
    { title: 'જાહેરાતકર્તાઓ (Clients)', href: '/admin/ads/advertisers', icon: Briefcase },
    { title: 'પ્લેસમેન્ટ સિલેક્ટર', href: '/admin/ads/placements', icon: Layers },
    { title: 'પોપઅપ જાહેરાતો', href: '/admin/ads/popups', icon: Sparkles },
    { title: 'એડ રિપોર્ટિંગ & બિલિંગ', href: '/admin/ads/reports', icon: BarChart2 },
    { title: 'સોશિયલ મીડિયા (Meta)', href: '/admin/social', icon: Share2 },
    { title: 'વીડિયો અને રીલ્સ', href: '/admin/videos', icon: Video },
    { title: 'અમારી ટીમ (Our Team)', href: '/admin/team', icon: Users },
    { title: 'કેટેગરી', href: '/admin/categories', icon: FolderTree },
    { title: 'મીડિયા લાઇબ્રેરી', href: '/admin/media', icon: ImageIcon },
    { title: 'બ્રેકિંગ સમાચાર', href: '/admin/breaking', icon: Radio },
    { title: 'ટ્રેન્ડિંગ સમાચાર', href: '/admin/trending', icon: TrendingUp },
    { title: 'વપરાશકર્તાઓ', href: '/admin/users', icon: Shield, roles: ['SUPER_ADMIN'] },
    { title: 'સેટિંગ્સ', href: '/admin/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
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
        className={`fixed top-0 bottom-0 left-0 w-64 bg-[#141b4d] text-white z-50 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 overflow-hidden shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 flex flex-col min-h-0 z-10">
          {/* Brand Logo Header matching Mockup */}
          <div className="p-4 flex flex-col items-center justify-center text-center border-b border-white/10 shrink-0">
            <div className="w-14 h-14 rounded-full bg-white p-1 shadow-lg flex items-center justify-center overflow-hidden border-2 border-white/40 mb-1.5">
              <img
                src="/logo.png"
                alt="BN News Gujarati"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <h1 className="font-gujarati font-extrabold text-sm tracking-wide text-white">
              BN NEWS ગુજરાતી
            </h1>
            <p className="text-[10px] text-gray-300 font-medium tracking-wider">
              Admin CMS
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-1 font-gujarati text-xs scrollbar-thin scrollbar-thumb-white/10">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-white text-[#141b4d] font-black shadow-md'
                      : 'text-gray-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#F58220]' : 'text-gray-300'}`} />
                    <span className="truncate">{item.title}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="ml-2 bg-[#E51F2A] text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs shrink-0">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer with Logout & Logo Swoosh */}
        <div className="relative pt-2 pb-4 px-3 z-10 border-t border-white/10 bg-[#141b4d]/90 shrink-0">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-gujarati text-gray-200 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="font-bold">લૉગઆઉટ</span>
          </button>
        </div>

        {/* Bottom Curved Swoosh (Red & Gold Ribbon from BN Logo) */}
        <div className="absolute -bottom-1 -left-4 -right-4 h-12 pointer-events-none z-0 overflow-hidden">
          <svg viewBox="0 0 280 60" fill="none" className="w-full h-full preserve-3d">
            <path
              d="M-20 60 C80 50, 160 30, 300 0 L300 60 Z"
              fill="#E51B2B"
            />
            <path
              d="M-20 54 C80 44, 160 22, 300 -6 L300 2 C160 30, 80 50, -20 58 Z"
              fill="#FFD900"
            />
          </svg>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
