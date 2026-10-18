import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Clock,
  CalendarDays,
  BookOpen,
  Bot,
  User,
  LogOut,
  Pill,
  Ribbon,
  ShieldCheck,
} from 'lucide-react';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

export const USER_NAV_ITEMS = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Pengingat', href: '/user/schedule', icon: Clock },
  { name: 'Monitoring', href: '/user/history', icon: CalendarDays },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'SADARI', href: '/user/sadari', icon: Ribbon },
  { name: 'Konsultasi AI', href: '/user/consultation', icon: Bot },
  { name: 'Profil & Akun', href: '/user/profile', icon: User },
];

export default function UserSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  const userName = user?.name || 'Pengguna Pilluna';
  const avatarUrl = user?.avatarUrl || '';

  return (
    <aside className='w-64 h-screen sticky top-0 bg-white border-r border-[#E2E8F0] flex flex-col justify-between p-4 z-40 select-none shadow-xs'>
      {/* Brand & Logo Header */}
      <div>
        <Link
          to='/user/dashboard'
          className='flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-[#F0FDFA] transition-colors mb-4'
        >
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white flex items-center justify-center shadow-md shadow-teal-700/20'>
            <Pill size={20} className='text-white' />
          </div>
          <div>
            <div className='flex items-center gap-1'>
              <span className='text-base font-extrabold text-[#0F172A] tracking-tight'>
                Pilluna
              </span>
            </div>
            <span className='text-[11px] font-semibold text-[#0D9488]'>Sahabat Setia Pil KB</span>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className='flex flex-col gap-1'>
          {USER_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            let isActive = false;
            if (item.href === '/user/sadari') {
              isActive = pathname === '/user/sadari';
            } else if (item.href === '/user/education') {
              isActive = pathname.startsWith('/user/education');
            } else if (item.href === '/user/dashboard') {
              isActive = pathname === '/user/dashboard' || pathname === '/user';
            } else {
              isActive = pathname === item.href;
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#0D9488] text-white shadow-xs shadow-teal-700/20'
                    : 'text-[#334155] hover:text-[#0D9488] hover:bg-[#F0FDFA]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-[#64748B]'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Card & Sign Out */}
      <div className='pt-4 border-t border-[#E2E8F0] flex flex-col gap-2.5'>
        {/* User Badge */}
        <Link
          to='/user/profile'
          className='flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] hover:border-teal-300 transition-colors'
        >
          <Avatar
            src={avatarUrl}
            name={userName}
            size='sm'
            ringClassName='ring-2 ring-teal-100 shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-[#0F172A] truncate block'>{userName}</span>
            <span className='text-[10px] text-[#0D9488] font-semibold flex items-center gap-1'>
              <ShieldCheck size={11} />
              <span>Akseptor Aktif</span>
            </span>
          </div>
        </Link>

        {/* Sign Out Action */}
        <button
          type='button'
          onClick={() => logout()}
          className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#DC2626] hover:bg-[#FEF2F2] rounded-xl transition-colors cursor-pointer'
        >
          <LogOut size={16} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
