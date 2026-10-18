import React from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import MobileTopBar from '@/src/shared/components/MobileTopBar';
import MobileBottomBar from '@/src/shared/components/MobileBottomBar';
import UserSidebar from './UserSidebar';
import { AuthGuard, useAuth } from '@/src/features/auth';

export interface UserLayoutProps {
  children?: React.ReactNode;
}

export default function UserLayout({ children }: UserLayoutProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useAuth();
  const displayName = user?.name ? user.name.split(' ')[0] : 'Calon Pengantin';
  const avatarUrl = user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=PRELUNA';

  if (pathname === '/user/setup') {
    return <AuthGuard requiredRole='user'>{children || <Outlet />}</AuthGuard>;
  }

  return (
    <AuthGuard requiredRole='user'>
      <div className='min-h-[100dvh] md:h-screen md:overflow-hidden bg-[#f8f9ff] flex flex-col md:flex-row selection:bg-[#ffd9de] selection:text-[#400014]'>
        {/* Mobile Top Header (< md) */}
        <div className='block md:hidden shrink-0'>
          <MobileTopBar userName={displayName} avatarUrl={avatarUrl} />
        </div>

        {/* Desktop / Tablet Left Sidebar (>= md) */}
        <div className='hidden md:flex shrink-0 h-screen sticky top-0'>
          <UserSidebar />
        </div>

        {/* Main Content Area with its own independent scroll */}
        <main className='flex-1 min-w-0 w-full overflow-y-auto px-4 py-4 pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:p-8 md:pb-12 box-border'>
          <div className='max-w-7xl mx-auto w-full'>{children || <Outlet />}</div>
        </main>

        {/* Fixed Mobile Bottom Navigation (< md) */}
        <MobileBottomBar />
      </div>
    </AuthGuard>
  );
}
