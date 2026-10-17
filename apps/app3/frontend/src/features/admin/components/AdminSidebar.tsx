import { LayoutDashboard, Users, Calendar, FileText, BookOpen, LogOut, User } from 'lucide-react';
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

const ADMIN_NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Data Catin', href: '/admin/users', icon: Users },
  { name: 'Jadwal & Imunisasi TT', href: '/admin/schedules', icon: Calendar },
  { name: 'Laporan & Cakupan TT', href: '/admin/reports', icon: FileText },
  { name: 'Artikel Edukasi', href: '/admin/articles', icon: BookOpen },
  { name: 'Profil Petugas', href: '/admin/profile', icon: User },
];

export interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const adminBadge = (
    <span className='px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-sm shadow-emerald-200 uppercase tracking-wide'>
      PETUGAS
    </span>
  );

  const signOutFooter = (
    <div className='flex flex-col gap-2'>
      {user && (
        <div className='p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2.5'>
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size='sm'
            ringClassName='ring-1.5 ring-emerald-300 shrink-0'
          />
          <div className='min-w-0 flex-1'>
            <div className='font-bold text-xs text-slate-800 truncate leading-tight'>
              {user.name}
            </div>
            <div className='text-[11px] text-slate-500 truncate'>{user.email}</div>
          </div>
        </div>
      )}

      <button
        type='button'
        onClick={() => logout()}
        className='flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 rounded-xl transition-colors cursor-pointer w-full text-left'
      >
        <LogOut size={16} />
        <span>Keluar dari Portal</span>
      </button>
    </div>
  );

  return (
    <AppSidebar
      brandSubtitle='Petugas Faskes & KUA'
      badge={adminBadge}
      brandHref='/admin/dashboard'
      navItems={ADMIN_NAVIGATION_ITEMS}
      footerAction={signOutFooter}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
