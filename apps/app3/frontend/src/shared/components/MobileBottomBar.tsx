import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarCheck, Clock, BookOpen, User } from 'lucide-react';

export interface BottomNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const USER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Riwayat TT', href: '/user/history', icon: CalendarCheck },
  { name: 'Jadwal TT', href: '/user/schedule', icon: Clock },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'Profil Catin', href: '/user/profile', icon: User },
];

export interface MobileBottomBarProps {
  items?: BottomNavItem[];
}

export default function MobileBottomBar({ items = USER_BOTTOM_NAV_ITEMS }: MobileBottomBarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      aria-label='Navigasi Bawah Mobile'
      className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-[#e2e8f0] shadow-[0_-4px_16px_rgba(5,150,105,0.06)]'
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className='max-w-md mx-auto h-16 px-2 flex items-center justify-around'>
        {items.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/user/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] h-full py-1 px-1.5 rounded-xl transition-all duration-150 relative select-none ${
                isActive ? 'text-[#059669]' : 'text-[#64748b] hover:text-[#059669]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[#ecfdf5] scale-105' : 'bg-transparent'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={isActive ? 'text-[#059669]' : 'text-[#64748b]'}
                />
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'text-[#059669] font-bold' : 'text-[#64748b]'
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
