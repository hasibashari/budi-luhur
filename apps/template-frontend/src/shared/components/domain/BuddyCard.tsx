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
  // Legacy fallback props
  buddyData?: {
    buddyName: string;
    streakCount: number;
  } | null;
}

export function BuddyCard({ groupData }: BuddyCardProps) {
  // 1. EMPTY / INVITE STATE: If user has no active group
  if (!groupData || !groupData.name) {
    return (
      <Card padding='md' className='w-full border border-[#fce7f3] shadow-sm'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='text-sm font-bold text-[#1e293b] flex items-center gap-1.5'>
            <Users size={16} className='text-[#e11d48]' />
            <span>Group Buddy</span>
          </h4>
          <span className='text-xs font-semibold text-[#be123c] bg-[#ffe4e6] px-2.5 py-0.5 rounded-full'>
            Komunitas Sehat
          </span>
        </div>

        <div className='bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border border-rose-200/80 rounded-2xl p-4 flex flex-col items-center text-center my-1.5'>
          <div className='w-12 h-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center text-[#e11d48] shadow-sm mb-2.5'>
            <Users size={22} />
          </div>

          <h5 className='text-xs sm:text-sm font-bold text-[#1e293b] mb-1'>
            Belum Bergabung ke Grup
          </h5>
          <p className='text-[11.5px] text-[#64748b] max-w-xs leading-relaxed mb-3.5'>
            Ajak kawan sekelas atau sahabat UKS untuk saling mengingatkan jadwal minum TTD setiap
            minggu!
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
              Buka Grup Buddy
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
    <Card padding='md' className='w-full border border-[#fce7f3] shadow-sm'>
      {/* Card Header */}
      <div className='flex items-center justify-between mb-3'>
        <h4 className='text-sm font-bold text-[#1e293b] flex items-center gap-1.5'>
          <Users size={16} className='text-[#e11d48]' />
          <span>Group Buddy</span>
        </h4>
        <Link
          to='/user/buddy'
          className='text-xs font-semibold text-[#be123c] hover:underline bg-[#ffe4e6] px-2.5 py-0.5 rounded-full'
        >
          Lihat Chat Grup
        </Link>
      </div>

      {/* Main Group Hero Box */}
      <div className='bg-gradient-to-r from-rose-50/90 via-amber-50/60 to-rose-50/90 border border-rose-200 rounded-2xl p-3.5 my-1 flex flex-col gap-3'>
        <div className='flex items-center justify-between gap-3'>
          {/* Group Identity */}
          <div className='flex items-center gap-2.5 min-w-0 flex-1'>
            <div className='relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 ring-2 ring-rose-200 bg-rose-100 shadow-2xs'>
              {groupData.avatarUrl ? (
                <img
                  src={groupData.avatarUrl}
                  alt={groupData.name}
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center text-[#e11d48] font-bold'>
                  <Users size={20} />
                </div>
              )}
            </div>

            <div className='min-w-0'>
              <h5 className='text-xs sm:text-sm font-extrabold text-[#1e293b] truncate'>
                {groupData.name}
              </h5>
              <p className='text-[10.5px] text-[#64748b] truncate mt-0.5'>
                {groupData.memberCount} Siswi ({membersText})
              </p>
            </div>
          </div>

          {/* Group Streak Badge */}
          <div
            className='flex items-center gap-1 px-2.5 py-1 bg-white/90 border border-amber-200 rounded-full shrink-0 shadow-2xs'
            title={`Streak: ${groupData.streakCount} Pekan`}
          >
            <Flame size={14} className='fill-orange-500 text-orange-500 animate-pulse' />
            <span className='text-xs font-black font-mono text-orange-700'>
              {groupData.streakCount}
            </span>
          </div>
        </div>

        {/* Weekly Progress Bar */}
        <div className='bg-white/80 rounded-xl p-2.5 border border-rose-100 flex flex-col gap-1.5'>
          <div className='flex items-center justify-between text-[11px] font-semibold'>
            <span className='flex items-center gap-1 text-[#475569]'>
              {isAllCompleted ? (
                <CheckCircle2 size={12} className='text-emerald-600' />
              ) : (
                <Sparkles size={12} className='text-[#e11d48]' />
              )}
              {isAllCompleted
                ? 'Semua anggota sudah minum TTD! 🎉'
                : `${completed} dari ${total} siswi sudah minum TTD`}
            </span>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                isAllCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-[#be123c]'
              }`}
            >
              {percent}%
            </span>
          </div>

          <div className='w-full h-2 bg-rose-100 rounded-full overflow-hidden'>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAllCompleted
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500'
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
