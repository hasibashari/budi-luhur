import React from 'react';
import { Flame, Info, ArrowLeft, Users } from 'lucide-react';
import { BuddyGroupItem } from '../types';

interface GroupChatHeaderProps {
  group: BuddyGroupItem;
  onOpenGroupInfo: () => void;
  onBackToGroupList?: () => void;
  showBackButton?: boolean;
}

export default function GroupChatHeader({
  group,
  onOpenGroupInfo,
  onBackToGroupList,
  showBackButton = false,
}: GroupChatHeaderProps) {
  return (
    <div className='shrink-0 bg-white border-b border-rose-100/80 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-2 z-10'>
      {/* Left: Mobile Back Button + Avatar + Title & Member Count */}
      <div className='flex items-center gap-2.5 min-w-0 flex-1'>
        {showBackButton && onBackToGroupList && (
          <button
            type='button'
            onClick={onBackToGroupList}
            className='md:hidden p-1.5 -ml-1 text-slate-600 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors cursor-pointer'
            title='Kembali'
            aria-label='Kembali ke daftar grup'
          >
            <ArrowLeft size={18} />
          </button>
        )}

        {/* Group Avatar */}
        <div className='relative w-9 sm:w-10 h-9 sm:h-10 rounded-2xl overflow-hidden shrink-0 ring-1 ring-rose-200 bg-rose-50'>
          {group.avatarUrl ? (
            <img
              src={group.avatarUrl}
              alt={group.name}
              className='w-full h-full object-cover'
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center bg-rose-100 text-rose-600 font-bold'>
              <Users size={18} />
            </div>
          )}
        </div>

        {/* Group Name & Members */}
        <div className='min-w-0 flex-1'>
          <h3 className='text-sm sm:text-base font-bold text-slate-800 truncate leading-tight'>
            {group.name}
          </h3>
          <p className='text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1'>
            <span>{group.memberCount} Anggota</span>
            <span>•</span>
            <span className='text-rose-600 font-mono font-medium'>{group.groupCode}</span>
          </p>
        </div>
      </div>

      {/* Right: Streak Badge + Info Button */}
      <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
        <div
          title={`Streak: ${group.streakCount} Pekan`}
          className='flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200/80 rounded-full'
        >
          <Flame size={13} className='fill-amber-500 text-amber-500' />
          <span className='text-[11px] font-black text-amber-800 font-mono'>
            {group.streakCount}
          </span>
        </div>

        <button
          type='button'
          onClick={onOpenGroupInfo}
          className='flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-full transition-colors cursor-pointer'
          title='Info Grup'
        >
          <Info size={13} className='text-rose-600' />
          <span className='hidden sm:inline'>Detail</span>
        </button>
      </div>
    </div>
  );
}
