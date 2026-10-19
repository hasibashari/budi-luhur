import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Clock,
  BookOpen,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

export const USER_NAV_ITEMS = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Edukasi Pranikah', href: '/user/education', icon: BookOpen },
  { name: 'Status & Riwayat TT', href: '/user/imunisasi?tab=riwayat', icon: ShieldCheck },
  { name: 'Jadwal & Pengingat', href: '/user/imunisasi?tab=jadwal', icon: Clock },
  { name: 'Profil Calon Pengantin', href: '/user/profile', icon: User },
];

export default function UserSidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const currentTab = new URLSearchParams(location.search).get('tab');
  const { user, logout } = useAuth();
  const userName = user?.name || 'Calon Pengantin';
  const avatarUrl = user?.avatarUrl || '';

  const isImunisasi = pathname === '/user/imunisasi' || pathname === '/user/history' || pathname === '/user/schedule';

  return (
    <aside className='w-64 h-screen sticky top-0 bg-white border-r border-[#e6eeff] flex flex-col justify-between z-40 select-none shadow-xs overflow-hidden'>
      {/* Brand & Logo Header - Pinned at top */}
      <div className='p-4 pb-2 shrink-0'>
        <Link
          to='/user/dashboard'
          className='flex items-center gap-3 px-2 py-3 rounded-2xl hover:bg-[#ffd9de]/20 transition-colors'
        >
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#aa294d] to-[#cb4364] text-white flex items-center justify-center shadow-md shadow-rose-950/20 shrink-0'>
            <ShieldCheck size={22} className='text-white' />
          </div>
          <div className='min-w-0'>
            <div className='flex items-center gap-1'>
              <span className='text-base font-extrabold text-[#121c2a] tracking-tight truncate'>
                PRELUNA
              </span>
            </div>
            <span className='text-[11px] font-semibold text-[#aa294d] truncate block'>
              Kesehatan Pranikah & TT
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation List - Independent Scroll Area */}
      <nav className='flex-1 flex flex-col gap-1 px-4 py-2 overflow-y-auto overscroll-contain'>
        {USER_NAV_ITEMS.map(item => {
          const Icon = item.icon;
          
          let isActive = false;
          if (item.href === '/user/imunisasi?tab=riwayat') {
            isActive = isImunisasi && (currentTab === 'riwayat' || !currentTab);
          } else if (item.href === '/user/imunisasi?tab=jadwal') {
            isActive = isImunisasi && currentTab === 'jadwal';
          } else {
            isActive =
              pathname === item.href ||
              (item.href !== '/user/dashboard' && pathname?.startsWith(item.href));
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#aa294d] text-white shadow-sm shadow-rose-950/15'
                  : 'text-[#64748b] hover:text-[#aa294d] hover:bg-[#ffd9de]/30'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-white shrink-0' : 'text-[#64748b] shrink-0'}
              />
              <span className='truncate'>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Area: User Card & Sign Out - Pinned at bottom */}
      <div className='p-4 border-t border-[#e6eeff] flex flex-col gap-2.5 shrink-0 bg-white'>
        {/* User Badge */}
        <Link
          to='/user/profile'
          className='flex items-center gap-2.5 p-2 rounded-xl bg-[#f8f9ff] border border-[#e6eeff] hover:border-[#ffd9de] transition-colors'
        >
          <Avatar
            src={avatarUrl}
            name={userName}
            size='sm'
            ringClassName='ring-2 ring-[#ffd9de] shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <span className='text-xs font-bold text-[#121c2a] truncate block'>{userName}</span>
            <span className='text-[10px] text-[#2a6950] font-semibold flex items-center gap-1'>
              <ShieldCheck size={11} />
              <span>Catin Terdaftar</span>
            </span>
          </div>
        </Link>

        {/* Sign Out Action */}
        <button
          type='button'
          onClick={() => logout()}
          className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors cursor-pointer min-h-[38px]'
        >
          <LogOut size={16} />
          <span>Keluar dari Akun</span>
        </button>
      </div>
    </aside>
  );
}
