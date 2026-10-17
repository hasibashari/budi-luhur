import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShieldCheck, Menu } from 'lucide-react';
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
  userName = 'Calon Pengantin',
  avatarUrl,
}: MobileTopBarProps) {
  return (
    <header className='sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#e2e8f0] shadow-2xs'>
      <div className='w-full px-4 h-14 flex items-center justify-between'>
        {/* Left: Sidebar Toggle Button (if onOpenSidebar provided) + Brand */}
        <div className='flex items-center gap-2.5'>
          {onOpenSidebar && (
            <button
              type='button'
              onClick={onOpenSidebar}
              className='w-9 h-9 rounded-xl bg-[#fafaf9] border border-[#e2e8f0] text-[#0f172a] hover:text-[#059669] hover:bg-[#ecfdf5] flex items-center justify-center transition-colors cursor-pointer shrink-0'
              aria-label='Buka Menu Navigasi'
            >
              <Menu size={20} />
            </button>
          )}

          <Link to={brandHref} className='flex items-center gap-2.5 text-inherit no-underline'>
            <div className='w-8 h-8 rounded-xl bg-gradient-to-tr from-[#059669] to-[#10b981] text-white flex items-center justify-center shadow-xs shadow-emerald-700/20 shrink-0'>
              <ShieldCheck size={18} className='text-white' />
            </div>

            <div className='flex flex-col'>
              <div className='flex items-center gap-1.5'>
                <span className='text-sm font-bold text-[#0f172a] leading-tight'>
                  {brandTitle || `Hai, ${userName}`}
                </span>
                {badge}
              </div>
              {brandSubtitle ? (
                <span className='text-[10px] sm:text-[11px] text-[#64748b] leading-none'>
                  {brandSubtitle}
                </span>
              ) : (
                <span className='text-[10px] sm:text-[11px] text-[#059669] font-medium leading-none'>
                  PRELUNA Pranikah
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
              className='w-9 h-9 rounded-full bg-[#fafaf9] border border-[#e2e8f0] flex items-center justify-center text-[#475569] hover:text-[#059669] hover:bg-[#ecfdf5] transition-colors relative'
              aria-label='Notifikasi'
            >
              <Bell size={17} />
              <span className='absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#d97706] ring-2 ring-white' />
            </Link>

            {/* Profile Avatar */}
            <Link
              to={brandHref.includes('admin') ? '/admin/profile' : '/user/profile'}
              className='block transition-transform hover:scale-105 active:scale-95'
              aria-label='Profil Calon Pengantin'
            >
              <Avatar
                src={avatarUrl}
                name={userName}
                size='sm'
                ringClassName='ring-2 ring-emerald-200 hover:ring-[#059669]'
              />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
