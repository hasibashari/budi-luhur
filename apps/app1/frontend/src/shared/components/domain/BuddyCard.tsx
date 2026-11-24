import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Users, ArrowRight, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export interface GroupBuddySummary {
  id: string;
  name: string;
  groupCode: string;
  streakCount: number;
  memberCount: number;
  membersSummary: string[];
  weeklyCompletedCount: number;
  weeklyTotalCount: number;
  weeklyCompletionRate: number;
  avatarUrl?: string;
}

export interface BuddyCardProps {
  groupData?: GroupBuddySummary | null;
  userName?: string;
  buddyData?: {
    buddyName: string;
    streakCount: number;
  } | null;
}

export function BuddyCard({ groupData }: BuddyCardProps) {
  // 1. EMPTY / INVITE STATE: If user has no active group
  if (!groupData || !groupData.name) {
    return (
      <Card padding='md' className='w-full bg-white border border-[#F0DFE7] shadow-xs'>
        <div className='flex items-center justify-between mb-3'>
          <h3 className='text-sm font-bold text-[#1E1F24] flex items-center gap-1.5'>
            <Users size={16} className='text-[#B8285F]' />
            <span>Sahabat Femory</span>
          </h3>
          <span className='text-xs font-semibold text-[#861A43] bg-[#FCE7F0] px-2.5 py-0.5 rounded-full'>
            Komunitas
          </span>
        </div>

        <div className='bg-[#FAF0F4] border border-[#F0DFE7] rounded-2xl p-4 flex flex-col items-center text-center my-1'>
          <div className='w-12 h-12 rounded-2xl bg-white border border-[#F0DFE7] flex items-center justify-center text-[#B8285F] shadow-xs mb-2.5'>
            <Users size={22} />
          </div>

          <h4 className='text-xs sm:text-sm font-bold text-[#1E1F24] mb-1'>
            Belum Ada Grup Sahabat
          </h4>
          <p className='text-[11.5px] text-[#525866] max-w-xs leading-relaxed mb-3.5'>
            Ajak teman sekelas atau sahabat UKS untuk saling mengingatkan jadwal minum TTD setiap minggu!
          </p>

          <Link to='/user/buddy' className='w-full'>
            <Button
              variant='primary'
              size='sm'
              shape='pill'
              fullWidth
              icon={<ArrowRight size={14} />}
              className='text-xs font-bold'
            >
              Cari & Gabung Grup
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // 2. ACTIVE GROUP BUDDY STATE
  const completed = groupData.weeklyCompletedCount || 0;
  const total = groupData.weeklyTotalCount || groupData.memberCount || 1;
  const percent = groupData.weeklyCompletionRate || Math.round((completed / total) * 100);
  const isAllCompleted = completed >= total && total > 0;

  const membersText =
    groupData.membersSummary && groupData.membersSummary.length > 0
      ? `${groupData.membersSummary.slice(0, 3).join(', ')}${
          groupData.memberCount > 3 ? '...' : ''
        }`
      : `${groupData.memberCount} Anggota`;

  return (
    <Card padding='md' className='w-full bg-white border border-[#F0DFE7] shadow-xs'>
      {/* Card Header */}
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-bold text-[#1E1F24] flex items-center gap-1.5'>
          <Users size={16} className='text-[#B8285F]' />
          <span>Sahabat Femory</span>
        </h3>
        <Link
          to='/user/buddy'
          className='text-xs font-semibold text-[#861A43] hover:text-[#B8285F] hover:underline bg-[#FCE7F0] px-2.5 py-0.5 rounded-full'
        >
          Lihat Chat
        </Link>
      </div>

      {/* Main Group Hero Box */}
      <div className='bg-[#FAF0F4] border border-[#F0DFE7] rounded-2xl p-3.5 my-1 flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          {/* Group Identity */}
          <div className='flex items-center gap-2.5 min-w-0 flex-1'>
            <div className='relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 ring-2 ring-[#FCE7F0] bg-white shadow-2xs'>
              {groupData.avatarUrl ? (
                <img
                  src={groupData.avatarUrl}
                  alt={groupData.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-[#B8285F] font-bold'>
                  <Users size={20} />
                </div>
              )}
            </div>

            <div className='min-w-0'>
              <h4 className='text-xs sm:text-sm font-bold text-[#1E1F24] truncate'>
                {groupData.name}
              </h4>
              <p className='text-[11px] text-[#525866] truncate mt-0.5'>
                {groupData.memberCount} Siswi ({membersText})
              </p>
            </div>
          </div>

          {/* Group Streak Badge */}
          <div
            className='flex items-center gap-1 px-2.5 py-1 bg-white border border-amber-200 rounded-full shrink-0 shadow-2xs'
            title={`Streak: ${groupData.streakCount} Pekan`}
          >
            <Flame size={14} className='fill-amber-500 text-amber-500' />
            <span className='text-xs font-bold text-amber-800'>
              {groupData.streakCount}
            </span>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className='bg-white rounded-xl p-2.5 border border-[#F0DFE7] flex flex-col gap-1.5'>
          <div className='flex items-center justify-between text-[11px] font-medium'>
            <span className='flex items-center gap-1 text-[#525866]'>
              {isAllCompleted ? (
                <CheckCircle2 size={12} className='text-[#0D9488]' />
              ) : (
                <Sparkles size={12} className='text-[#B8285F]' />
              )}
              {isAllCompleted
                ? 'Semua anggota sudah minum TTD! 🎉'
                : `${completed} dari ${total} siswi sudah minum`}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                isAllCompleted ? 'bg-teal-50 text-teal-800' : 'bg-[#FAF0F4] text-[#861A43]'
              }`}
            >
              {percent}%
            </span>
          </div>

          <div className='w-full h-2 bg-[#F6EAF0] rounded-full overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAllCompleted
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                  : 'bg-gradient-to-r from-amber-400 to-[#B8285F]'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, percent))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Direct CTA to Group Chat */}
      <Link to='/user/buddy' className='w-full block mt-3'>
        <Button
          variant='primary'
          size='sm'
          shape='pill'
          fullWidth
          icon={<MessageSquare size={14} />}
          className='text-xs font-bold'
        >
          Buka Obrolan Grup
        </Button>
      </Link>
    </Card>
  );
}

export default BuddyCard;
