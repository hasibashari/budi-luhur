import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Heart, Menu } from 'lucide-react';
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
  userName = 'Siswi',
  avatarUrl,
}: MobileTopBarProps) {
  const { request, isGranted, isDenied } = useNotificationPermission();

  return (
    <header className='sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#F0DFE7] shadow-[0_2px_10px_rgba(184,40,95,0.02)]'>
      <div className='w-full px-4 h-14 flex items-center justify-between'>
        {/* Left: Sidebar Toggle Button (if onOpenSidebar provided) + Brand */}
        <div className='flex items-center gap-2.5'>
          {onOpenSidebar && (
            <button
              type='button'
              onClick={onOpenSidebar}
              className='w-9 h-9 rounded-xl bg-[#FAF0F4] border border-[#F0DFE7] text-[#1E1F24] hover:text-[#B8285F] hover:bg-[#FCE7F0] flex items-center justify-center transition-colors cursor-pointer shrink-0'
              aria-label='Buka Menu Navigasi'
            >
              <Menu size={19} />
            </button>
          )}

          <Link to={brandHref} className='flex items-center gap-2 text-inherit no-underline'>
            <div className='w-8 h-8 rounded-xl bg-gradient-to-tr from-[#B8285F] to-[#E06397] text-white flex items-center justify-center shadow-xs shadow-[#B8285F]/20 shrink-0'>
              <Heart size={15} className='fill-white' />
            </div>

            <div className='flex flex-col'>
              <div className='flex items-center gap-1.5'>
                <span className='text-sm font-bold text-[#1E1F24] leading-tight'>
                  {brandTitle || `Hai, ${userName}! 🌸`}
                </span>
                {badge}
              </div>
              {brandSubtitle ? (
                <span className='text-[10px] sm:text-[11px] text-[#525866] leading-none'>
                  {brandSubtitle}
                </span>
              ) : (
                <span className='text-[10px] sm:text-[11px] text-[#B8285F] font-medium leading-none'>
                  FEMORY App
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
            <button
              type='button'
              onClick={() => request()}
              className='w-9 h-9 rounded-full bg-[#FAF0F4] border border-[#F0DFE7] flex items-center justify-center text-[#525866] hover:text-[#B8285F] hover:bg-[#FCE7F0] transition-colors relative cursor-pointer'
              aria-label={isGranted ? 'Notifikasi aktif' : 'Aktifkan notifikasi'}
              title={isDenied ? 'Notifikasi diblokir. Izinkan dari pengaturan browser.' : undefined}
            >
              <Bell size={16} />
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white ${
                  isGranted ? 'bg-[#0D9488]' : 'bg-[#B8285F]'
                }`}
              />
            </button>

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
                ringClassName='ring-2 ring-[#FCE7F0] hover:ring-[#B8285F]'
              />
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
