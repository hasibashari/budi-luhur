import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, BarChart3, FileText } from 'lucide-react';

const ADMIN_BOTTOM_ITEMS = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Catin', href: '/admin/users', icon: Users },
  { name: 'Jadwal TT', href: '/admin/schedules', icon: CalendarCheck },
  { name: 'Artikel', href: '/admin/articles', icon: FileText },
  { name: 'Laporan', href: '/admin/reports', icon: BarChart3 },
];

export default function AdminMobileBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/95 backdrop-blur-lg border-t border-emerald-100 shadow-[0_-4px_20px_rgba(5,150,105,0.06)]'
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
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-emerald-600 font-medium'
              }`}
            >
              <div
                className={`relative flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-emerald-100/70 text-emerald-700 scale-105 shadow-2xs' : 'text-slate-500'
                }`}
              >
                <Icon size={19} className={isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'} />
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                  isActive ? 'font-bold text-emerald-700' : 'font-medium text-slate-500'
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
