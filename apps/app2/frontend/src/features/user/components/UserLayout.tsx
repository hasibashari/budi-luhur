import React from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';
import MobileTopBar from '@/src/shared/components/MobileTopBar';
import MobileBottomBar from '@/src/shared/components/MobileBottomBar';
import UserSidebar from './UserSidebar';
import { AuthGuard, useAuth } from '@/src/features/auth';
import { useDailyScheduleReminders } from '@/src/features/schedule/hooks/useDailyScheduleReminders';

export interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const fullName = user?.name || 'Akseptor Pilluna';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Akseptor';
  const avatarUrl = user?.avatarUrl || null;

  // Pengingat jadwal harian aktif di seluruh halaman portal user (bukan hanya
  // di halaman Jadwal), agar notifikasi tetap muncul saat jam jadwal tiba.
  const { activeReminders } = useDailyScheduleReminders({
    userId: user?.id,
    enabled: Boolean(user?.id) && pathname !== '/user/setup',
  });

  const urgentReminder = activeReminders.find(
    r => r.kind === 'exact' || r.kind === 'overdue'
  );

  if (pathname === '/user/setup') {
    return <AuthGuard allowedRoles={['user', 'admin']}>{children || <Outlet />}</AuthGuard>;
  }

  return (
    <AuthGuard allowedRoles={['user', 'admin']}>
      <div className='min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row selection:bg-teal-100 selection:text-[#0D9488]'>
        {/* Mobile Top Header (< md) */}
        <div className='block md:hidden'>
          <MobileTopBar
            userName={fullName}
            brandTitle={`Hai, ${firstName}! 💊`}
            avatarUrl={avatarUrl}
          />
        </div>

        {/* Desktop / Tablet Left Sidebar (>= md) */}
        <div className='hidden md:block shrink-0'>
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className='flex-1 min-w-0 w-full max-w-full md:max-w-7xl mx-auto px-4 py-4 pb-24 md:p-8 md:pb-12 min-h-screen box-border'>
          {pathname !== '/user/dashboard' && urgentReminder && (
            <div className='mb-4 p-3 sm:p-4 rounded-2xl bg-amber-500 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 shadow-md animate-fade-in'>
              <div className='flex items-start sm:items-center gap-2.5 min-w-0'>
                <span className='text-lg sm:text-xl shrink-0 mt-0.5 sm:mt-0'>💊</span>
                <p className='text-xs sm:text-sm font-semibold leading-snug'>
                  {urgentReminder.kind === 'exact'
                    ? `Waktunya minum obat (${urgentReminder.time} WIB)!`
                    : `Pengingat: Jadwal minum obat (${urgentReminder.time} WIB) belum dicatat.`}
                </p>
              </div>
              <Link
                to='/user/dashboard'
                className='shrink-0 bg-white text-amber-900 hover:bg-amber-50 font-bold px-3 py-2 sm:py-1.5 rounded-xl sm:rounded-lg text-xs shadow-xs transition-colors text-center'
              >
                Catat Sekarang
              </Link>
            </div>
          )}
          {children || <Outlet />}
        </main>

        {/* Fixed Mobile Bottom Navigation (< md) */}
        <MobileBottomBar />
      </div>
    </AuthGuard>
  );
}
