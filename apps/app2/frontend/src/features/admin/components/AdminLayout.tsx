import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminMobileBottomNav from './AdminMobileBottomNav';
import { AuthGuard } from '@/src/features/auth';
import MobileTopBar from '@/src/shared/components/MobileTopBar';

export default function AdminLayout() {
  const adminBadge = (
    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-extrabold shadow-sm shadow-rose-200 uppercase tracking-wide">
      ADMIN
    </span>
  );

  return (
    <AuthGuard requiredRole='admin'>
      <div className="flex flex-col min-h-screen bg-[#FFF1F5]">
        {/* Mobile Top App Bar (< md) */}
        <div className="block md:hidden">
          <MobileTopBar
            brandTitle="Pilluna 🌸"
            brandSubtitle="Bidan & Faskes KB"
            brandHref="/admin/dashboard"
            badge={adminBadge}
          />
        </div>

        {/* Main Workspace Layout (Desktop Sidebar on md+ & Content) */}
        <div className="flex flex-col md:flex-row flex-1 min-h-screen">
          <AdminSidebar />
          <main className="flex-1 min-w-0 w-full p-4 sm:p-6 md:p-8 pb-28 md:pb-12 min-h-screen box-border">
            <div className="max-w-7xl w-full mx-auto">
              <Outlet />
            </div>
          </main>
        </div>

        {/* Fixed Mobile Bottom Navigation Bar (< md) */}
        <AdminMobileBottomNav />
      </div>
    </AuthGuard>
  );
}
