import React from 'react';
import { CheckCircle2, Hourglass } from 'lucide-react';

export interface TTMilestoneTrackerProps {
  currentTTLevel?: number;
  className?: string;
  title?: string;
}

export function TTMilestoneTracker({
  currentTTLevel = 3,
  className = '',
  title = 'Rangkaian 5 Dosis Vaksin TT',
}: TTMilestoneTrackerProps) {
  const safeCurrentLevel = Math.max(0, Math.min(5, currentTTLevel));

  return (
    <section
      aria-label='Progres Vaksin TT'
      className={`bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#eff4ff] ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='w-8 h-8 rounded-lg bg-[#ffd9de] text-[#aa294d] flex items-center justify-center shrink-0 shadow-2xs'>
            <span className='material-symbols-outlined text-[18px]'>linear_scale</span>
          </div>
          <h3 className='text-sm sm:text-base font-bold text-[#121c2a]'>{title}</h3>
        </div>
        <span className='px-2.5 py-0.5 rounded-full bg-[#ffd9de] text-[#8c0f39] text-xs font-bold shrink-0'>
          {safeCurrentLevel} / 5 Selesai
        </span>
      </div>

      <div className='relative w-full pt-2 pb-2'>
        <div className='absolute top-6 left-6 right-6 h-1 bg-[#d9e3f6] rounded-full -translate-y-1/2' />
        <div
          className='absolute top-6 left-6 h-1 bg-[#2a6950] rounded-full -translate-y-1/2 transition-all duration-700'
          style={{ width: `${Math.min(100, (safeCurrentLevel / 5) * 100)}%` }}
        />

        <div className='relative flex items-start justify-between z-10 px-1'>
          {[1, 2, 3, 4, 5].map(step => {
            const isCompleted = step <= safeCurrentLevel;
            const isUpcoming = step === safeCurrentLevel + 1;

            return (
              <div key={step} className='flex flex-col items-center'>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-xs ring-4 ring-white transition-all ${
                    isCompleted
                      ? 'bg-[#2a6950] text-white'
                      : isUpcoming
                        ? 'bg-[#ffd9dd] text-[#ac254b]'
                        : 'bg-[#e6eeff] text-[#8b7074]'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 size={16} />
                  ) : isUpcoming ? (
                    <Hourglass size={14} />
                  ) : (
                    <span className='w-2 h-2 rounded-full bg-[#8b7074]/40' />
                  )}
                </div>
                <span className='text-xs font-bold text-[#121c2a] mt-1.5'>TT{step}</span>
                <span
                  className={`text-[10px] font-semibold ${
                    isCompleted
                      ? 'text-[#2a6950]'
                      : isUpcoming
                        ? 'text-[#ac254b]'
                        : 'text-[#8b7074]'
                  }`}
                >
                  {isCompleted ? 'Selesai' : isUpcoming ? 'Jadwal' : 'Belum'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TTMilestoneTracker;
