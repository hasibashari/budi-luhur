import React, { useState } from 'react';
import { Users, Plus, Search, Flame, MessageSquare, UserPlus } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { BuddyGroupItem } from '../types';

interface GroupSidebarListProps {
  groups: BuddyGroupItem[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onOpenCreateModal: () => void;
  onOpenJoinModal: () => void;
}

export default function GroupSidebarList({
  groups,
  selectedGroupId,
  onSelectGroup,
  onOpenCreateModal,
  onOpenJoinModal,
}: GroupSidebarListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGroups = groups.filter(
    g =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.groupCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Card
      padding='none'
      className='h-full flex flex-col overflow-hidden bg-white shadow-xs border border-rose-100/80'
    >
      {/* Top Header */}
      <div className='p-3 sm:p-3.5 border-b border-rose-100/80 flex flex-col gap-2 bg-white shrink-0'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-bold text-slate-800 flex items-center gap-1.5'>
            <Users size={16} className='text-rose-600' />
            <span>Grup Buddy</span>
            <span className='text-xs font-semibold text-slate-400'>({groups.length})</span>
          </h4>

          <div className='flex items-center gap-1'>
            <button
              type='button'
              onClick={onOpenJoinModal}
              title='Gabung kode'
              className='px-2 py-1 text-xs font-semibold text-slate-600 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors border border-slate-200 flex items-center gap-1 cursor-pointer'
            >
              <UserPlus size={12} />
              <span>Gabung</span>
            </button>

            <button
              type='button'
              onClick={onOpenCreateModal}
              title='Buat grup'
              className='px-2.5 py-1 text-xs font-bold text-white rounded-lg bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer'
            >
              <Plus size={13} />
              <span>Buat</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {groups.length > 0 && (
          <div className='relative'>
            <Search
              size={13}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none'
            />
            <input
              type='text'
              placeholder='Cari grup...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full bg-slate-50 text-slate-800 placeholder-slate-400 text-xs rounded-xl pl-8 pr-3 py-1.5 outline-none border border-slate-200 focus:border-rose-500 focus:bg-white transition-colors'
            />
          </div>
        )}
      </div>

      {/* Scrollable Groups List */}
      <div className='flex-1 min-h-0 overflow-y-auto p-1.5 space-y-1 overscroll-contain'>
        {filteredGroups.length > 0 ? (
          filteredGroups.map(group => {
            const isSelected = group.id === selectedGroupId;

            return (
              <button
                key={group.id}
                type='button'
                onClick={() => onSelectGroup(group.id)}
                className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-rose-50 border border-rose-200 shadow-2xs'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                {/* Group Avatar */}
                <div className='relative w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-1 ring-rose-200 bg-rose-50 mt-0.5'>
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

                {/* Group Info */}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center justify-between gap-1'>
                    <span
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-rose-700' : 'text-slate-800'
                      }`}
                    >
                      {group.name}
                    </span>

                    {/* Streak Pill */}
                    <span className='shrink-0 flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-md border border-amber-200/80'>
                      <Flame size={10} className='fill-amber-500 text-amber-500' />{' '}
                      {group.streakCount}
                    </span>
                  </div>

                  <p className='text-[11px] text-slate-500 truncate mt-0.5'>
                    {group.lastMessage ? (
                      <>
                        <strong className='text-slate-700'>{group.lastMessage.senderName}:</strong>{' '}
                        {group.lastMessage.content}
                      </>
                    ) : (
                      `${group.memberCount} Anggota`
                    )}
                  </p>
                </div>
              </button>
            );
          })
        ) : groups.length > 0 ? (
          <div className='p-6 text-center text-xs text-slate-400'>
            Grup &quot;{searchQuery}&quot; tidak ditemukan.
          </div>
        ) : (
          /* Empty State */
          <div className='p-5 text-center flex flex-col items-center gap-2.5 my-3'>
            <div className='w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center'>
              <MessageSquare size={20} />
            </div>
            <div>
              <h5 className='text-xs font-bold text-slate-800'>Belum Ada Grup</h5>
              <p className='text-[11px] text-slate-400 max-w-xs mt-0.5'>
                Buat grup atau gabung dengan kode dari temanmu.
              </p>
            </div>

            <div className='flex gap-2 w-full pt-1'>
              <button
                type='button'
                onClick={onOpenCreateModal}
                className='flex-1 py-1.5 px-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer'
              >
                + Buat Grup
              </button>
              <button
                type='button'
                onClick={onOpenJoinModal}
                className='flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer'
              >
                Gabung Kode
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
