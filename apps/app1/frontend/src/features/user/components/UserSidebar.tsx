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
    <aside className='w-64 h-screen sticky top-0 bg-white border-r border-[#F0DFE7] flex flex-col justify-between p-4 z-40 select-none shadow-[2px_0_12px_rgba(184,40,95,0.02)]'>
      {/* Brand & Logo Header */}
      <div>
        <Link
          to='/user/dashboard'
          className='flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-[#FAF0F4] transition-colors mb-4'
        >
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#B8285F] to-[#E06397] text-white flex items-center justify-center shadow-sm shadow-[#B8285F]/25'>
            <Heart size={20} className='fill-white' />
          </div>
          <div>
            <div className='flex items-center gap-1.5'>
              <span className='text-base font-bold text-[#1E1F24] tracking-tight'>
                FEMORY
              </span>
              <span className='text-sm'>🌸</span>
            </div>
            <span className='text-[11px] font-medium text-[#B8285F] block -mt-0.5'>Sahabat Remaja Sehat</span>
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
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#B8285F] text-white shadow-sm shadow-[#B8285F]/20'
                    : 'text-[#525866] hover:text-[#B8285F] hover:bg-[#FAF0F4]'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-[#8E95A5]'} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Area: User Card & Sign Out */}
      <div className='pt-4 border-t border-[#F0DFE7] flex flex-col gap-2.5'>
        {/* User Badge */}
        <Link
          to='/user/profile'
          className='flex items-center gap-2.5 p-2 rounded-xl bg-[#FAF0F4] border border-[#F0DFE7] hover:border-[#EE9CBF] transition-colors'
        >
          <Avatar
            src={avatarUrl}
            name={userName}
            size='sm'
            ringClassName='ring-2 ring-[#FCE7F0] shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-[#1E1F24] truncate block'>{userName}</span>
            <span className='text-[10px] text-[#0D9488] font-semibold flex items-center gap-1'>
              <ShieldCheck size={11} />
              <span>Profil Aktif</span>
            </span>
          </div>
        </Link>

        {/* Sign Out Action */}
        <button
          type='button'
          onClick={() => logout()}
          className='flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#861A43] hover:bg-[#FAF0F4] hover:text-[#B8285F] rounded-xl transition-colors cursor-pointer'
        >
          <LogOut size={15} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
