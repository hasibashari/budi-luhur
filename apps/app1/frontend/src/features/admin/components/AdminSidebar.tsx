import { LayoutDashboard, Users, Calendar, FileText, BookOpen, LogOut, User } from 'lucide-react';
import AppSidebar, { NavItem } from '@/src/shared/components/AppSidebar';
import { Avatar } from '@/src/shared/components/ui/Avatar';
import { useAuth } from '@/src/features/auth';

const ADMIN_NAVIGATION_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Data Siswi', href: '/admin/users', icon: Users },
  { name: 'Jadwal', href: '/admin/schedules', icon: Calendar },
  { name: 'Laporan', href: '/admin/reports', icon: FileText },
  { name: 'Artikel', href: '/admin/articles', icon: BookOpen },
  { name: 'Profil & Akun', href: '/admin/profile', icon: User },
];

export interface AdminSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ mobileOpen = false, onMobileClose }: AdminSidebarProps) {
  const { user, logout } = useAuth();

  const adminBadge = (
    <span className='px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-sm shadow-rose-200 uppercase tracking-wide'>
      ADMIN
    </span>
  );

  const signOutFooter = (
    <div className='flex flex-col gap-2'>
      {user && (
        <div className='p-2.5 rounded-2xl bg-[#fff5f7] border border-pink-100 flex items-center gap-2.5'>
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size='sm'
            ringClassName='ring-1.5 ring-rose-300 shrink-0'
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
        className='flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer w-full text-left'
      >
        <LogOut size={16} />
        <span>Keluar dari Admin</span>
      </button>
    </div>
  );

  return (
    <AppSidebar
      brandSubtitle='Administrator'
      badge={adminBadge}
      brandHref='/admin/dashboard'
      navItems={ADMIN_NAVIGATION_ITEMS}
      footerAction={signOutFooter}
      mobileOpen={mobileOpen}
      onMobileClose={onMobileClose}
    />
  );
}
