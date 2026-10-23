import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ShieldCheck, User } from 'lucide-react';

export interface BottomNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  matchPrefixes?: string[];
}

export const USER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen, matchPrefixes: ['/user/education'] },
  {
    name: 'Imunisasi',
    href: '/user/imunisasi',
    icon: ShieldCheck,
    matchPrefixes: ['/user/imunisasi', '/user/history', '/user/schedule'],
  },
  { name: 'Profil', href: '/user/profile', icon: User, matchPrefixes: ['/user/profile'] },
];

export interface MobileBottomBarProps {
  items?: BottomNavItem[];
}

export default function MobileBottomBar({ items = USER_BOTTOM_NAV_ITEMS }: MobileBottomBarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      aria-label='Navigasi Bawah TEMANI'
      className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#ffffff]/94 backdrop-blur-xl border-t border-[#e6eeff] shadow-[0_-4px_20px_rgba(170,41,77,0.06)]'
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}
    >
      <div className='max-w-[430px] mx-auto h-16 px-2 flex items-center justify-around'>
        {items.map(item => {
          const isActive =
            pathname === item.href ||
            (item.matchPrefixes &&
              item.matchPrefixes.some(prefix => pathname?.startsWith(prefix))) ||
            (item.href !== '/user/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center min-w-[64px] min-h-[48px] h-full py-1 px-1 rounded-2xl transition-all duration-150 relative select-none active:scale-90 ${
                isActive ? 'text-[#aa294d]' : 'text-[#64748b] hover:text-[#aa294d]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-[#ffd9de]/90 scale-105 shadow-2xs' : 'bg-transparent'
                }`}
              >
                <Icon
                  size={21}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-[#aa294d]' : 'text-[#64748b]'}
                />
              </div>

              <span
                className={`text-[11px] mt-0.5 tracking-tight transition-colors duration-150 ${
                  isActive ? 'text-[#aa294d] font-bold' : 'text-[#64748b] font-medium'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
