import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CalendarCheck, BookOpen, Flame, Bot } from 'lucide-react';

export interface BottomNavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
}

export const USER_BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Monitoring', href: '/user/history', icon: CalendarCheck },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'Buddy', href: '/user/buddy', icon: Flame },
  { name: 'Konsultasi', href: '/user/consultation', icon: Bot },
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
      className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-md border-t border-[#F0DFE7] shadow-[0_-4px_20px_rgba(184,40,95,0.05)]'
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
                isActive ? 'text-[#B8285F]' : 'text-[#525866] hover:text-[#B8285F]'
              }`}
            >
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[#FCE7F0] scale-105' : 'bg-transparent'
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className={isActive ? 'text-[#B8285F]' : 'text-[#8E95A5]'}
                />
              </div>

              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium ${
                  isActive ? 'text-[#B8285F] font-bold' : 'text-[#525866]'
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
