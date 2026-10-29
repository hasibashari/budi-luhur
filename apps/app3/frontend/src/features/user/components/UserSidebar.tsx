import { Link } from 'react-router-dom';
import { Home, Calendar, BookOpen, User, LogOut, ShieldCheck } from 'lucide-react';
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

export const USER_NAV_ITEMS: NavItem[] = [
  { name: 'Beranda', href: '/user/dashboard', icon: Home },
  { name: 'Jadwal', href: '/user/schedule', icon: Calendar },
  { name: 'Riwayat TT', href: '/user/imunisasi?tab=riwayat', icon: ShieldCheck },
  { name: 'Edukasi', href: '/user/education', icon: BookOpen },
  { name: 'Profil & Akun', href: '/user/profile', icon: User },
];

export default function UserSidebar() {
  const { user, logout } = useAuth();
  const userName = user?.name || 'Calon Pengantin';
  const avatarUrl = user?.avatarUrl || '';

  const userFooter = (
    <div className='flex flex-col gap-2'>
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

      <button
        type='button'
        onClick={() => logout()}
        className='flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-xl transition-colors cursor-pointer min-h-[38px] w-full text-left'
      >
        <LogOut size={16} />
        <span>Keluar dari Akun</span>
      </button>
    </div>
  );

  return (
    <AppSidebar
      brandSubtitle='Kesehatan Pranikah & TT'
      brandIcon={ShieldCheck}
      brandHref='/user/dashboard'
      navItems={USER_NAV_ITEMS}
      footerAction={userFooter}
    />
  );
}
