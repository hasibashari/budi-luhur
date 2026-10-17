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
    return (
      <AuthGuard requiredRole='user'>
        {children || <Outlet />}
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRole='user'>
      <div className='min-h-screen bg-[#fafaf9] flex flex-col md:flex-row selection:bg-emerald-100 selection:text-emerald-900'>
        {/* Mobile Top Header (< md) */}
        <div className='block md:hidden'>
          <MobileTopBar userName={displayName} avatarUrl={avatarUrl} />
        </div>

        {/* Desktop / Tablet Left Sidebar (>= md) */}
        <div className='hidden md:block shrink-0'>
          <UserSidebar />
        </div>

        {/* Main Content Area */}
        <main className='flex-1 min-w-0 w-full max-w-full md:max-w-7xl mx-auto px-4 py-4 pb-24 md:p-8 md:pb-12 min-h-screen box-border'>
          {children || <Outlet />}
        </main>

        {/* Fixed Mobile Bottom Navigation (< md) */}
        <MobileBottomBar />
      </div>
    </AuthGuard>
  );
}
