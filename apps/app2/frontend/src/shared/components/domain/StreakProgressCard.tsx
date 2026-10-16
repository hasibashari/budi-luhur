import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, CheckCircle2, ArrowRight, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';

export interface StreakProgressCardProps {
  streakCount: number;
  streakUnit?: 'Hari' | 'Minggu';
  consecutiveDates?: string[];
  todayStatus?: 'recorded' | 'missed' | 'pending';
  className?: string;
  showDetailsLink?: boolean;
}

export function StreakProgressCard({
  streakCount,
  streakUnit = 'Minggu',
  consecutiveDates = [],
  todayStatus = 'pending',
  className = '',
  showDetailsLink = true,
}: StreakProgressCardProps) {
  // Determine milestone thresholds
  const milestones = [
    { level: 1, target: 1, label: `1 ${streakUnit}`, title: 'Pemula' },
    { level: 2, target: 3, label: `3 ${streakUnit}`, title: 'Konsisten' },
    { level: 3, target: 6, label: `6 ${streakUnit}`, title: 'Bebas Anemia' },
    { level: 4, target: 12, label: `12 ${streakUnit}`, title: 'Champion' },
  ];

  const maxTarget = 12;
  const progressPercent = Math.min(100, Math.max(streakCount > 0 ? 8 : 0, (streakCount / maxTarget) * 100));

  // Determine current milestone title & badge
  const getCurrentMilestone = (count: number) => {
    if (count >= 12) return { title: 'Level 4: Proteksi Maksimal (Champion)', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (count >= 6) return { title: 'Level 3: Siklus Teratur & Terproteksi', color: 'text-[#E94383] bg-[#FFF1F5] border-[#FCE7F3]' };
    if (count >= 3) return { title: 'Level 2: Disiplin Pil Harian', color: 'text-purple-600 bg-purple-50 border-purple-200' };
    if (count >= 1) return { title: 'Level 1: Pemula Disiplin', color: 'text-[#58AA96] bg-[#58AA96]/10 border-[#58AA96]/20' };
    return { title: 'Mulai Streak Pertamamu', color: 'text-[#4A5E78] bg-slate-50 border-slate-200' };
  };

  const currentLevel = getCurrentMilestone(streakCount);

  // Helper format short date (e.g. 2026-09-26 -> 26 Sep)
  const formatShortDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        const mIndex = parseInt(parts[1], 10) - 1;
        return `${parts[2]} ${months[mIndex] || ''}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <Card padding='md' className={`relative overflow-hidden ${className}`}>
      {/* Header Info */}
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#E94383] via-[#F58CB4] to-[#58AA96] text-white flex items-center justify-center shadow-md shadow-[#E94383]/25 shrink-0'>
            <Flame size={22} className='fill-white' />
          </div>
          <div>
            <div className='flex items-center gap-1.5'>
              <h4 className='text-sm sm:text-base font-extrabold text-[#24354D] leading-tight'>
                {streakCount} {streakUnit} Streak
              </h4>
              {streakCount > 0 && (
                <span className='inline-flex items-center gap-0.5 text-[10px] font-bold text-[#E94383] bg-[#FFF1F5] px-2 py-0.5 rounded-full border border-[#FCE7F3]'>
                  <Sparkles size={10} /> Aktif
                </span>
              )}
            </div>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block ${currentLevel.color}`}>
              {currentLevel.title}
            </span>
          </div>
        </div>

        {showDetailsLink && (
          <Link
            to='/user/history'
            className='inline-flex items-center gap-1 text-xs font-bold text-[#E94383] hover:text-[#D83272] shrink-0 hover:underline'
          >
            <span>Kalender</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Visual Elongating Progress Track */}
      <div className='my-3.5'>
        <div className='flex items-center justify-between text-[11px] font-semibold text-[#4A5E78] mb-1.5'>
          <span>Progres Menuju Milestone Berikutnya</span>
          <span className='font-bold text-[#E94383]'>
            {streakCount >= 12 ? 'Milestone Maksimal Tercapai! 🏆' : `${streakCount}/${maxTarget} ${streakUnit}`}
          </span>
        </div>

        {/* Outer Track Bar */}
        <div className='relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-[#FCE7F3]'>
          {/* Dynamic Inner Elongating Gradient Bar */}
          <div
            className='h-full rounded-full bg-gradient-to-r from-[#F58CB4] via-[#E94383] to-[#58AA96] transition-all duration-700 ease-out shadow-sm'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Pin Points */}
        <div className='grid grid-cols-4 gap-1 mt-2'>
          {milestones.map(m => {
            const isAchieved = streakCount >= m.target;
            return (
              <div key={m.level} className='flex flex-col items-center text-center'>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    isAchieved
                      ? 'bg-[#E94383] text-white shadow-xs shadow-[#E94383]/40 ring-2 ring-[#FCE7F3]'
                      : 'bg-slate-100 text-slate-400 border border-slate-300'
                  }`}
                >
                  {isAchieved ? '✓' : m.target}
                </div>
                <span className={`text-[10px] font-bold mt-1 leading-tight ${isAchieved ? 'text-[#24354D]' : 'text-slate-400'}`}>
                  {m.label}
                </span>
                <span className='text-[9px] text-[#8A9BA8] hidden sm:block'>{m.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Consecutive Active Dates Chain (Visual Day Capsules) */}
      {consecutiveDates.length > 0 ? (
        <div className='mt-3 pt-3 border-t border-[#FCE7F3]'>
          <span className='text-[11px] font-bold text-[#4A5E78] flex items-center gap-1.5 mb-2'>
            <Calendar size={13} className='text-[#E94383]' />
            <span>Rangkaian Tanggal Konsisten ({consecutiveDates.length} Aktivitas):</span>
          </span>

          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar'>
            {consecutiveDates.slice(0, 7).map((d, index) => (
              <div
                key={d}
                className='inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#58AA96]/10 text-[#58AA96] border border-[#58AA96]/20 shrink-0 shadow-2xs'
                title={`Aktivitas ke-${consecutiveDates.length - index}: ${d}`}
              >
                <CheckCircle2 size={11} className='text-[#58AA96]' />
                <span>{formatShortDate(d)}</span>
              </div>
            ))}
            {consecutiveDates.length > 7 && (
              <span className='text-[10px] font-bold text-slate-400 shrink-0 px-1'>
                +{consecutiveDates.length - 7} lainnya
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className='mt-2.5 pt-2.5 border-t border-[#FCE7F3] text-center'>
          <p className='text-[11px] text-[#4A5E78]'>
            Belum ada rangkaian streak aktif. {todayStatus === 'pending' ? 'Catat konsumsi pil KB hari ini untuk memulai!' : 'Pertahankan jadwal berikutnya!'}
          </p>
        </div>
      )}
    </Card>
  );
}
