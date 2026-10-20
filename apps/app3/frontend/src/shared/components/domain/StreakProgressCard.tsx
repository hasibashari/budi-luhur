import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
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
  const milestones = [
    { level: 1, target: 1, label: `1 ${streakUnit}`, title: 'Pemula' },
    { level: 2, target: 3, label: `3 ${streakUnit}`, title: 'Konsisten' },
    { level: 3, target: 6, label: `6 ${streakUnit}`, title: 'Kesiapan Baik' },
    { level: 4, target: 12, label: `12 ${streakUnit}`, title: 'Catin Teladan' },
  ];

  const maxTarget = 12;
  const progressPercent = Math.min(100, Math.max(streakCount > 0 ? 8 : 0, (streakCount / maxTarget) * 100));

  const getCurrentMilestone = (count: number) => {
    if (count >= 12) return { title: 'Level 4: Calon Pengantin Teladan (Champion)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (count >= 6) return { title: 'Level 3: Kesiapan Fisik & Imun Optimal', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    if (count >= 3) return { title: 'Level 2: Calon Pengantin Konsisten', color: 'text-teal-800 bg-teal-50 border-teal-200' };
    if (count >= 1) return { title: 'Level 1: Langkah Awal Pranikah', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    return { title: 'Mulai Komitmen Sehat Pranikah', color: 'text-slate-600 bg-stone-50 border-stone-200' };
  };

  const currentLevel = getCurrentMilestone(streakCount);

  return (
    <Card padding='md' className={`relative overflow-hidden border-stone-200 ${className}`}>
      {/* Header Info */}
      <div className='flex items-start justify-between gap-3 mb-3'>
        <div className='flex items-center gap-2.5'>
          <div className='w-11 h-11 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md shadow-emerald-950/10 shrink-0'>
            <ShieldCheck size={22} className='text-emerald-100' />
          </div>
          <div>
            <div className='flex items-center gap-1.5'>
              <h4 className='text-sm sm:text-base font-bold text-slate-900 leading-tight'>
                {streakCount} {streakUnit} Disiplin Sehat
              </h4>
              {streakCount > 0 && (
                <span className='inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200'>
                  <Sparkles size={10} /> Aktif
                </span>
              )}
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-1 inline-block ${currentLevel.color}`}>
              {currentLevel.title}
            </span>
          </div>
        </div>

        {showDetailsLink && (
          <Link
            to='/user/history'
            className='inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 shrink-0 hover:underline'
          >
            <span>Buku Imunisasi</span>
            <ArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* Visual Elongating Progress Track */}
      <div className='my-3.5'>
        <div className='flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1.5'>
          <span>Konsistensi Kunjungan & Suplementasi</span>
          <span className='font-bold text-emerald-700'>
            {streakCount >= 12 ? 'Tingkat Kepatuhan Sempurna' : `${streakCount}/${maxTarget} ${streakUnit}`}
          </span>
        </div>

        <div className='relative w-full h-3 bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200'>
          <div
            className='h-full rounded-full bg-linear-to-r from-emerald-600 via-teal-600 to-amber-500 transition-all duration-700 ease-out shadow-xs'
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className='grid grid-cols-4 gap-1 mt-2'>
          {milestones.map(m => {
            const isAchieved = streakCount >= m.target;
            return (
              <div key={m.level} className='flex flex-col items-center text-center'>
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isAchieved
                      ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-100'
                      : 'bg-stone-100 text-slate-400 border border-stone-300'
                  }`}
                >
                  {isAchieved ? '✓' : m.target}
                </div>
                <span className={`text-[10px] font-bold mt-1 leading-tight ${isAchieved ? 'text-slate-900' : 'text-slate-400'}`}>
                  {m.label}
                </span>
                <span className='text-[9px] text-slate-400 hidden sm:block'>{m.title}</span>
              </div>
            );
          })}
        </div>
      </div>

    </Card>
  );
}

export default StreakProgressCard;
