import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, ShieldCheck, Menu } from 'lucide-react';
import { Avatar } from './ui/Avatar';
import useNotificationPermission from '../hooks/useNotificationPermission';

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
  const { request, isGranted, isDenied } = useNotificationPermission();

  return (
    <header
      className='sticky top-0 z-40 w-full bg-[#ffffff]/92 backdrop-blur-xl border-b border-[#e6eeff] shadow-[0_1px_8px_rgba(170,41,77,0.04)] select-none'
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className='w-full px-3.5 sm:px-4 h-14 flex items-center justify-between max-w-xl mx-auto'>
        {/* Left: Sidebar Toggle Button (if onOpenSidebar provided) + Brand */}
        <div className='flex items-center gap-2'>
          {onOpenSidebar && (
            <button
              type='button'
              onClick={onOpenSidebar}
              className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-xl bg-[#f8f9ff] border border-[#e6eeff] text-[#121c2a] hover:text-[#aa294d] hover:bg-[#ffd9de]/40 active:scale-95 flex items-center justify-center transition-all cursor-pointer shrink-0'
              aria-label='Buka Menu Navigasi'
            >
              <Menu size={20} />
            </button>
          )}

          <Link
            to={brandHref}
            className='flex items-center gap-2 text-inherit no-underline py-1 group'
          >
            <div className='w-8 h-8 rounded-xl bg-gradient-to-tr from-[#aa294d] to-[#cb4364] text-white flex items-center justify-center shadow-xs shadow-rose-900/20 group-active:scale-95 transition-transform shrink-0'>
              <ShieldCheck size={18} className='text-white' />
            </div>

            <div className='flex flex-col'>
              <div className='flex items-center gap-1.5'>
                <span className='text-sm font-bold text-[#121c2a] leading-tight group-hover:text-[#aa294d] transition-colors'>
                  {brandTitle || `Hai, ${userName}`}
                </span>
                {badge}
              </div>
              {brandSubtitle ? (
                <span className='text-[10px] sm:text-[11px] text-[#64748b] leading-none'>
                  {brandSubtitle}
                </span>
              ) : (
                <span className='text-[10px] sm:text-[11px] text-[#aa294d] font-semibold leading-none'>
                  TEMANI Pranikah
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Right: Notification & Profile Avatar */}
        {rightAction ? (
          rightAction
        ) : (
          <div className='flex items-center gap-1.5 shrink-0'>
            {/* Notification Bell (44px touch target) */}
            <button
              type='button'
              onClick={() => request()}
              className='min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-[#f8f9ff] border border-[#e6eeff] flex items-center justify-center text-[#475569] hover:text-[#aa294d] hover:bg-[#ffd9de]/50 active:scale-95 transition-all relative'
              aria-label={isGranted ? 'Notifikasi aktif' : 'Aktifkan notifikasi'}
              title={isDenied ? 'Notifikasi diblokir. Izinkan dari pengaturan browser.' : undefined}
            >
              <Bell size={18} />
              <span
                className={`absolute top-2.5 right-2.5 w-2 h-2 rounded-full ring-2 ring-white ${isGranted ? 'bg-emerald-500' : 'bg-[#aa294d]'}`}
              />
            </button>

            {/* Profile Avatar (44px touch target) */}
            <Link
              to={brandHref.includes('admin') ? '/admin/profile' : '/user/profile'}
              className='min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-full transition-transform active:scale-95'
              aria-label='Profil Calon Pengantin'
            >
              <Avatar
                src={avatarUrl}
                name={userName}
                size='sm'
                ringClassName='ring-2 ring-[#ffd9de] hover:ring-[#aa294d]'
              />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
