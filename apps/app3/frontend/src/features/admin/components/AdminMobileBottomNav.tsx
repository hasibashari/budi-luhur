import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, BarChart3, FileText, Award } from 'lucide-react';

const ADMIN_BOTTOM_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Catin', href: '/admin/users', icon: Users },
  { name: 'Jadwal', href: '/admin/schedules', icon: CalendarCheck },
  { name: 'Verifikasi', href: '/admin/certificates', icon: Award },
  { name: 'Artikel', href: '/admin/articles', icon: FileText },
  { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
];

export default function AdminMobileBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-[#eff4ff] shadow-[0_-4px_20px_rgba(170,41,77,0.06)]'
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label='Navigasi Bawah Petugas'
    >
      <div className='flex items-center justify-around h-16 px-2 max-w-lg mx-auto'>
        {ADMIN_BOTTOM_ITEMS.map(item => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 select-none ${
                isActive
                  ? 'text-[#aa294d] font-bold'
                  : 'text-[#8b7074] hover:text-[#aa294d] font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive
                    ? 'bg-[#ffd9de]/70 text-[#aa294d] scale-105 shadow-2xs'
                    : 'text-[#8b7074]'
                }`}
              >
                <Icon size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                  isActive ? 'font-bold text-[#aa294d]' : 'font-medium text-[#8b7074]'
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
