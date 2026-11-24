import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Sparkles, ArrowRight, Award } from 'lucide-react';
import { Card } from '../ui/Card';

export interface StreakProgressCardProps {
  streakCount: number;
  streakUnit?: 'Hari' | 'Minggu';
  className?: string;
  showDetailsLink?: boolean;
}

export function StreakProgressCard({
  streakCount,
  streakUnit = 'Minggu',
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
  const progressPercent = Math.min(
    100,
    Math.max(streakCount > 0 ? 8 : 0, (streakCount / maxTarget) * 100),
  );

  // Determine current milestone title & badge
  const getCurrentMilestone = (count: number) => {
    if (count >= 12)
      return {
        title: 'Level 4: Duta Remaja Sehat (Champion)',
        color: 'text-amber-800 bg-amber-50 border-amber-200',
      };
    if (count >= 6)
      return {
        title: 'Level 3: Pejuang Bebas Anemia',
        color: 'text-[#861A43] bg-[#FAF0F4] border-[#F7CADF]',
      };
    if (count >= 3)
      return {
        title: 'Level 2: Pejuang Konsisten',
        color: 'text-purple-800 bg-purple-50 border-purple-200',
      };
    if (count >= 1)
      return {
        title: 'Level 1: Pemula Sehat',
        color: 'text-teal-800 bg-teal-50 border-teal-200',
      };
    return {
      title: 'Mulai Streak Pertamamu',
      color: 'text-[#525866] bg-[#F1F3F7] border-[#E2E6EE]',
    };
  };

  const currentLevel = getCurrentMilestone(streakCount);

  return (
    <Card padding='md' className={`relative overflow-hidden bg-white ${className}`}>
      {/* Header Info */}
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-[#CE3B77] to-[#B8285F] text-white flex items-center justify-center shadow-xs shadow-[#B8285F]/20 shrink-0'>
            <Flame size={20} className='fill-white' />
          </div>
          <div>
            <div className='flex items-center gap-1.5'>
              <h3 className='text-sm sm:text-base font-bold text-[#1E1F24] leading-tight'>
                {streakCount} {streakUnit} Berturut-turut
              </h3>
              {streakCount > 0 && (
                <span className='inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200'>
                  <Sparkles size={10} /> Aktif
                </span>
              )}
            </div>
            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block ${currentLevel.color}`}
            >
              {currentLevel.title}
            </span>
          </div>
        </div>

        {showDetailsLink && (
          <Link
            to='/user/history'
            className='inline-flex items-center gap-1 text-xs font-semibold text-[#B8285F] hover:text-[#8D1847] shrink-0 hover:underline'
          >
            <span>Kalender</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Visual Elongating Progress Track */}
      <div className='my-3'>
        <div className='flex items-center justify-between text-[11px] font-medium text-[#525866] mb-1.5'>
          <span>Progres Menuju Milestone Berikutnya</span>
          <span className='font-bold text-[#B8285F]'>
            {streakCount >= 12
              ? 'Milestone Maksimal Tercapai! 🏆'
              : `${streakCount}/${maxTarget} ${streakUnit}`}
          </span>
        </div>

        {/* Outer Track Bar */}
        <div className='relative w-full h-2.5 bg-[#FAF2F6] rounded-full overflow-hidden p-0.5 border border-[#F0DFE7]'>
          {/* Dynamic Inner Elongating Gradient Bar */}
          <div
            className='h-full rounded-full bg-gradient-to-r from-amber-400 via-[#E06397] to-[#B8285F] transition-all duration-700 ease-out shadow-xs'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Milestone Pin Points */}
        <div className='grid grid-cols-4 gap-1 mt-2.5'>
          {milestones.map(m => {
            const isAchieved = streakCount >= m.target;
            return (
              <div key={m.level} className='flex flex-col items-center text-center'>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isAchieved
                      ? 'bg-[#B8285F] text-white shadow-xs ring-2 ring-[#FCE7F0]'
                      : 'bg-[#F1F3F7] text-[#8E95A5] border border-[#E2E6EE]'
                  }`}
                >
                  {isAchieved ? '✓' : m.target}
                </div>
                <span
                  className={`text-[10px] font-semibold mt-1 leading-tight ${
                    isAchieved ? 'text-[#1E1F24]' : 'text-[#8E95A5]'
                  }`}
                >
                  {m.label}
                </span>
                <span className='text-[9px] text-[#8E95A5] hidden sm:block'>{m.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
