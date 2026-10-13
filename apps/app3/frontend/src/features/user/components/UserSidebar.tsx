import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Clock,
  CalendarCheck,
  BookOpen,
  Flame,
  Bot,
  User,
  LogOut,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

export const USER_NAV_ITEMS = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Pengingat', href: '/user/schedule', icon: Clock },
  { name: 'Monitoring', href: '/user/history', icon: CalendarCheck },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'Group Buddy', href: '/user/buddy', icon: Flame },
  { name: 'Konsultasi AI', href: '/user/consultation', icon: Bot },
  { name: 'Profil & Akun', href: '/user/profile', icon: User },
];

export default function UserSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const { user, logout } = useAuth();
  const userName = user?.name || 'Siswi FEMORY';
  const avatarUrl = user?.avatarUrl || '';

  return (
    <aside className='w-64 h-screen sticky top-0 bg-white border-r border-[#fce7f3] flex flex-col justify-between p-4 z-40 select-none shadow-xs'>
      {/* Brand & Logo Header */}
      <div>
        <Link
          to='/user/dashboard'
          className='flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-[#fff5f7] transition-colors mb-4'
        >
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#fb7185] text-white flex items-center justify-center shadow-md shadow-rose-500/25'>
            <Heart size={20} className='fill-white' />
          </div>
          <div>
            <div className='flex items-center gap-1'>
              <span className='text-base font-extrabold text-[#1e293b] tracking-tight'>
                FEMORY
              </span>
              <span className='text-sm'>🌸</span>
            </div>
            <span className='text-[11px] font-semibold text-[#e11d48]'>Portal Pasien</span>
          </div>
        </Link>

        {/* Navigation List */}
        <nav className='flex flex-col gap-1'>
          {USER_NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
                    : 'text-[#64748b] hover:text-[#e11d48] hover:bg-[#fff5f7]'
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
      <div className='pt-4 border-t border-[#fce7f3] flex flex-col gap-2.5'>
        {/* User Badge */}
        <Link
          to='/user/profile'
          className='flex items-center gap-2.5 p-2 rounded-xl bg-[#fff5f7] border border-[#fce7f3] hover:border-rose-300 transition-colors'
        >
          <Avatar
            src={avatarUrl}
            name={userName}
            size='sm'
            ringClassName='ring-2 ring-rose-200 shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-[#1e293b] truncate block'>{userName}</span>
            <span className='text-[10px] text-[#059669] font-semibold flex items-center gap-1'>
              <ShieldCheck size={11} />
              <span>Profil Aktif</span>
            </span>
          </div>
        </Link>

        {/* Sign Out Action */}
        <button
          type='button'
          onClick={() => logout()}
          className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#e11d48] hover:bg-[#fff1f2] rounded-xl transition-colors cursor-pointer'
        >
          <LogOut size={16} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
