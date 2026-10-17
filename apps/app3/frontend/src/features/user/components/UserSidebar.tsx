import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Clock,
  CalendarCheck,
  BookOpen,
  Bot,
  User,
  LogOut,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

export const USER_NAV_ITEMS = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Riwayat Imunisasi TT', href: '/user/history', icon: CalendarCheck },
  { name: 'Jadwal & Pengingat', href: '/user/schedule', icon: Clock },
  { name: 'Edukasi Pranikah', href: '/user/education', icon: BookOpen },
  { name: 'Konsultasi Luna AI', href: '/user/consultation', icon: Bot },
  { name: 'Profil Calon Pengantin', href: '/user/profile', icon: User },
];

export default function UserSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  const userName = user?.name || 'Calon Pengantin';
  const avatarUrl = user?.avatarUrl || '';

  return (
    <aside className='w-64 h-screen sticky top-0 bg-white border-r border-[#e2e8f0] flex flex-col justify-between p-4 z-40 select-none shadow-xs'>
      {/* Brand & Logo Header */}
      <div>
        <Link
          to='/user/dashboard'
          className='flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-[#ecfdf5] transition-colors mb-4'
        >
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white flex items-center justify-center shadow-md shadow-emerald-700/20'>
            <ShieldCheck size={22} className='text-white' />
          </div>
          <div>
            <div className='flex items-center gap-1'>
              <span className='text-base font-extrabold text-[#0f172a] tracking-tight'>
                PRELUNA
              </span>
            </div>
            <span className='text-[11px] font-semibold text-[#059669]'>Kesehatan Pranikah & TT</span>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className='flex flex-col gap-1'>
          {USER_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/user/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#059669] text-white shadow-sm shadow-emerald-700/20'
                    : 'text-[#64748b] hover:text-[#059669] hover:bg-[#ecfdf5]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-[#64748b]'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Card & Sign Out */}
      <div className='pt-4 border-t border-[#e2e8f0] flex flex-col gap-2.5'>
        {/* User Badge */}
        <Link
          to='/user/profile'
          className='flex items-center gap-2.5 p-2 rounded-xl bg-[#fafaf9] border border-[#e2e8f0] hover:border-emerald-300 transition-colors'
        >
          <Avatar
            src={avatarUrl}
            name={userName}
            size='sm'
            ringClassName='ring-2 ring-emerald-200 shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-[#0f172a] truncate block'>{userName}</span>
            <span className='text-[10px] text-[#059669] font-semibold flex items-center gap-1'>
              <ShieldCheck size={11} />
              <span>Catin Terdaftar</span>
            </span>
          </div>
        </Link>

        {/* Sign Out Action */}
        <button
          type='button'
          onClick={() => logout()}
          className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer'
        >
          <LogOut size={16} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
