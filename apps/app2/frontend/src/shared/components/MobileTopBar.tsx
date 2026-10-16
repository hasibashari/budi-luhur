import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Pill, Menu } from 'lucide-react';
import { Avatar } from './ui/Avatar';

export interface MobileTopBarProps {
  onOpenSidebar?: () => void;
  brandTitle?: React.ReactNode;
  brandSubtitle?: string;
  brandHref?: string;
  badge?: React.ReactNode;
  rightAction?: React.ReactNode;
  userName?: string;
  avatarUrl?: string | null;
}

export default function MobileTopBar({
  onOpenSidebar,
  brandTitle,
  brandSubtitle,
  brandHref = '/user/dashboard',
  badge,
  rightAction,
  userName = 'Akseptor',
  avatarUrl,
}: MobileTopBarProps) {
  return (
    <header className='sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs'>
      <div className='w-full px-4 h-13 flex items-center justify-between'>
        {/* Left: Sidebar Toggle Button (if onOpenSidebar provided) + Brand */}
        <div className='flex items-center gap-2.5'>
          {onOpenSidebar && (
            <button
              type='button'
              onClick={onOpenSidebar}
              className='w-9 h-9 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:text-[#0D9488] hover:bg-[#F0FDFA] flex items-center justify-center transition-colors cursor-pointer shrink-0'
              aria-label='Buka Menu Navigasi'
            >
              <Menu size={20} />
            </button>
          )}

          <Link to={brandHref} className='flex items-center gap-2 text-inherit no-underline'>
            <div className='w-8 h-8 rounded-xl bg-gradient-to-tr from-[#0D9488] to-[#14B8A6] text-white flex items-center justify-center shadow-xs shadow-teal-700/20 shrink-0'>
              <Pill size={16} className='text-white' />
            </div>

            <div className='flex flex-col'>
              <div className='flex items-center gap-1.5'>
                <span className='text-sm font-bold text-[#0F172A] leading-tight'>
                  {brandTitle || `Hai, ${userName}!`}
                </span>
                {badge}
              </div>
              {brandSubtitle ? (
                <span className='text-[10px] sm:text-[11px] text-[#64748B] leading-none'>
                  {brandSubtitle}
                </span>
              ) : (
                <span className='text-[10px] sm:text-[11px] text-[#0D9488] font-medium leading-none'>
                  Pilluna KB
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Right: Notification & Profile Avatar */}
        {rightAction ? (
          rightAction
        ) : (
          <div className='flex items-center gap-2 shrink-0'>
            {/* Notification Bell */}
            <Link
              to={brandHref}
              className='w-9 h-9 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#334155] hover:text-[#0D9488] hover:bg-[#F0FDFA] transition-colors relative'
              aria-label='Notifikasi'
            >
              <Bell size={17} />
              <span className='absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316] ring-2 ring-white' />
            </Link>

            {/* Profile Avatar with initials fallback */}
            <Link
              to={brandHref.includes('admin') ? '/admin/profile' : '/user/profile'}
              className='block transition-transform hover:scale-105 active:scale-95'
              aria-label='Profil Pengguna'
            >
              <Avatar
                src={avatarUrl}
                name={userName}
                size='sm'
                ringClassName='ring-2 ring-teal-100 hover:ring-[#0D9488]'
              />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
