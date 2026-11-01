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
    <div className='flex md:hidden items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs'>
      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100'>
          <Flame size={16} className='fill-orange-500 text-orange-500' />
        </div>
        <div>
          <span className='text-[10px] text-slate-500 block leading-tight'>
            Disiplin Konsumsi
          </span>
          <span className='text-xs font-extrabold text-slate-900'>
            {streakCount} {streakUnit}
          </span>
        </div>
      </div>

      <div className='h-7 w-[1px] bg-slate-200' />

      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 border border-teal-100'>
          <Shield size={16} />
        </div>
        <div>
          <span className='text-[10px] text-slate-500 block leading-tight'>
            Proteksi Kontrasepsi
          </span>
          <span className='text-xs font-extrabold text-teal-700'>
            {streakCount >= 7 ? '99% Optimal' : 'Tahap Adaptasi'}
          </span>
        </div>
      </div>

      <div className='h-7 w-[1px] bg-slate-200' />

      <div className='flex items-center gap-2'>
        <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600'>
          <Clock size={16} />
        </div>
        <div>
          <span className='text-[10px] text-slate-500 block leading-tight'>Jadwal</span>
          <span className='text-xs font-extrabold text-slate-800'>
            {isReminderActive ? `${scheduleTime || '20:00'} WIB` : 'Nonaktif'}
          </span>
        </div>
      </div>
    </div>
  );
}

