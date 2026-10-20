import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarDays, BookOpen, Ribbon, User, FileText } from 'lucide-react';

export interface BottomNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const USER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Monitoring', href: '/user/history', icon: CalendarDays },
  { name: 'Catatan', href: '/user/notes', icon: FileText },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'SADARI', href: '/user/sadari', icon: Ribbon },
  { name: 'Profil', href: '/user/profile', icon: User },
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
      className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-[0_-4px_16px_rgba(15,23,42,0.05)]'
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className='max-w-md mx-auto h-16 px-2 flex items-center justify-around'>
        {items.map(item => {
          let isActive = false;
          if (item.name === 'SADARI' || item.href === '/user/sadari') {
            isActive = pathname === '/user/sadari';
          } else if (item.name === 'Edukasi' || item.href === '/user/education') {
            isActive = pathname.startsWith('/user/education');
          } else if (item.href === '/user/dashboard') {
            isActive = pathname === '/user/dashboard' || pathname === '/user';
          } else {
            isActive = pathname === item.href || pathname.startsWith(item.href);
          }

          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center min-w-[56px] h-full py-1 px-1.5 rounded-xl transition-all duration-150 relative select-none ${
                isActive ? 'text-[#0D9488]' : 'text-[#64748B] hover:text-[#0D9488]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[#F0FDFA] scale-105' : 'bg-transparent'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.2 : 1.75}
                  className={isActive ? 'text-[#0D9488]' : 'text-[#64748B]'}
                />
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'text-[#0D9488] font-bold' : 'text-[#64748B]'
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
