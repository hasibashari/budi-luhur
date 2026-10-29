import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{
    size?: number;
    color?: string;
    className?: string;
    style?: React.CSSProperties;
  }>;
}

export interface AppSidebarProps {
  navItems: NavItem[];
  brandTitle?: React.ReactNode;
  brandSubtitle?: string;
  brandIcon?: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  brandHref?: string;
  badge?: React.ReactNode;
  footerAction?: React.ReactNode;
  drawerWidth?: number;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AppSidebar({
  navItems,
  brandTitle = 'TEMANI',
  brandSubtitle = 'Portal Faskes',
  brandIcon: BrandIcon,
  brandHref = '/admin/dashboard',
  badge,
  footerAction,
  drawerWidth = 260,
  mobileOpen = false,
  onMobileClose,
}: AppSidebarProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const sidebarInner = (
    <div className='flex flex-col h-full bg-white px-4 py-5 overflow-hidden'>
      {/* Header Section - Pinned at top */}
      <div className='flex items-center justify-between pb-4 mb-4 border-b border-[#eff4ff] shrink-0'>
        <Link
          to={brandHref}
          onClick={onMobileClose}
          className='flex items-center gap-3 group min-w-0'
        >
          {BrandIcon ? (
            <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#aa294d] to-[#cb4364] text-white flex items-center justify-center shadow-md shadow-rose-950/20 shrink-0 group-hover:scale-105 transition-transform'>
              <BrandIcon size={20} />
            </div>
          ) : (
            <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#aa294d] to-[#cb4364] text-white flex items-center justify-center text-lg shadow-md shadow-rose-950/20 shrink-0 group-hover:scale-105 transition-transform'>
              💍
            </div>
          )}
          <div className='flex flex-col min-w-0'>
            <div className='flex items-center gap-1.5'>
              <span className='font-extrabold text-base text-[#121c2a] leading-tight truncate'>
                {brandTitle}
              </span>
              {badge}
            </div>
            <span className='text-[11px] font-bold text-[#aa294d] uppercase tracking-wider leading-tight'>
              {brandSubtitle}
            </span>
          </div>
        </Link>

        {/* Mobile close button */}
        {mobileOpen && (
          <button
            type='button'
            onClick={onMobileClose}
            className='md:hidden p-1.5 rounded-lg text-[#574144] hover:bg-[#ffd9de]/30 hover:text-[#aa294d] transition-colors cursor-pointer'
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation List - Independent Scroll */}
      <nav className='flex-1 flex flex-col gap-1.5 overflow-y-auto overscroll-contain pr-1'>
        {navItems.map(item => {
          const [baseItemPath, itemQuery] = item.href.split('?');
          const isHome = item.href === brandHref || item.href === '/admin/dashboard' || item.href === '/user/dashboard';
          const isActive = itemQuery
            ? pathname === baseItemPath && location.search.includes(itemQuery)
            : pathname === item.href || (!isHome && pathname?.startsWith(baseItemPath));
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 select-none ${
                isActive
                  ? 'bg-[#ffd9de]/60 text-[#aa294d] font-bold shadow-2xs'
                  : 'text-[#574144] hover:bg-[#eff4ff] hover:text-[#aa294d]'
              }`}
            >
              <Icon
                size={18}
                className={isActive ? 'text-[#aa294d] shrink-0' : 'text-[#8b7074] shrink-0'}
              />
              <span className='truncate'>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Action - Pinned at bottom */}
      {footerAction && (
        <div className='pt-3 mt-3 border-t border-[#eff4ff] shrink-0'>{footerAction}</div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop + Overlay */}
      {mobileOpen && (
        <div className='fixed inset-0 z-50 md:hidden animate-fade-in'>
          <div className='fixed inset-0 bg-[#121c2a]/40 backdrop-blur-xs' onClick={onMobileClose} />
          <div
            style={{ width: drawerWidth }}
            className='fixed top-0 bottom-0 left-0 bg-white shadow-2xl z-10 border-r border-[#eff4ff]'
          >
            {sidebarInner}
          </div>
        </div>
      )}

      {/* Desktop Sticky Permanent Sidebar */}
      <aside
        style={{ width: drawerWidth }}
        className='hidden md:flex flex-col sticky top-0 h-screen z-30 bg-white border-r border-[#eff4ff] shadow-2xs shrink-0 select-none overflow-hidden'
      >
        {sidebarInner}
      </aside>
    </>
  );
}
