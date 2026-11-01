import { Flame, Shield, Clock } from 'lucide-react';

export interface MobileHealthStatsBarProps {
  streakCount: number;
  streakUnit: string;
  isReminderActive: boolean;
  scheduleTime?: string;
}

export function MobileHealthStatsBar({
  streakCount,
  streakUnit,
  isReminderActive,
  scheduleTime,
}: MobileHealthStatsBarProps) {
  return (
    <div className='flex md:hidden items-center justify-between gap-1.5 sm:gap-2 p-2.5 sm:p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs'>
      <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shrink-0'>
          <Flame size={15} className='fill-orange-500 text-orange-500' />
        </div>
        <div className='min-w-0'>
          <span className='text-[9px] sm:text-[10px] text-slate-500 block leading-tight truncate'>
            Disiplin Konsumsi
          </span>
          <span className='text-[11px] sm:text-xs font-extrabold text-slate-900 truncate block'>
            {streakCount} {streakUnit}
          </span>
        </div>
      </div>

      <div className='h-6 sm:h-7 w-[1px] bg-slate-200/80 shrink-0' />

      <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100 shrink-0'>
          <Shield size={15} />
        </div>
        <div className='min-w-0'>
          <span className='text-[9px] sm:text-[10px] text-slate-500 block leading-tight truncate'>
            Proteksi
          </span>
          <span className='text-[11px] sm:text-xs font-extrabold text-teal-700 truncate block'>
            {streakCount >= 7 ? '99% Optimal' : 'Tahap Adaptasi'}
          </span>
        </div>
      </div>

      <div className='h-6 sm:h-7 w-[1px] bg-slate-200/80 shrink-0' />

      <div className='flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1'>
        <div className='w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0'>
          <Clock size={15} />
        </div>
        <div className='min-w-0'>
          <span className='text-[9px] sm:text-[10px] text-slate-500 block leading-tight truncate'>
            Jadwal
          </span>
          <span className='text-[11px] sm:text-xs font-extrabold text-slate-800 truncate block'>
            {isReminderActive ? `${scheduleTime || '20:00'} WIB` : 'Nonaktif'}
          </span>
        </div>
      </div>
    </div>
  );
}

