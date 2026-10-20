import React, { useMemo } from 'react';
import { CalendarDays, Check, Clock, Info } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';

interface ActiveBlisterStripWidgetProps {
  streakCount: number;
  todayStatus: 'recorded' | 'missed' | 'pending';
  consecutiveDates?: string[];
}

const getLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const ActiveBlisterStripWidget: React.FC<ActiveBlisterStripWidgetProps> = ({
  streakCount,
  todayStatus,
  consecutiveDates = [],
}) => {
  const today = useMemo(() => new Date(), []);
  const todayStr = getLocalDateString(today);
  const weekStart = useMemo(() => {
    const date = new Date(today);
    const day = date.getDay();
    date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
    date.setHours(0, 0, 0, 0);
    return date;
  }, [today]);

  const weekDates = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date(weekStart);
        date.setDate(weekStart.getDate() + index);
        const dateStr = getLocalDateString(date);
        const isToday = dateStr === todayStr;
        const isRecorded = isToday
          ? todayStatus === 'recorded'
          : consecutiveDates.includes(dateStr);

        return {
          dateStr,
          dayNumber: date.getDate(),
          dayName: date.toLocaleDateString('id-ID', { weekday: 'short' }),
          isToday,
          isRecorded,
          isMissed: isToday && todayStatus === 'missed',
          isFuture: dateStr > todayStr,
        };
      }),
    [consecutiveDates, todayStr, todayStatus, weekStart],
  );

  return (
    <Card padding='md' className='border border-slate-200/80 bg-white shadow-xs'>
      <div className='mb-4 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5'>
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-teal-100 bg-teal-50 text-teal-600'>
            <CalendarDays size={18} strokeWidth={1.75} />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h3 className='text-sm font-bold tracking-tight text-slate-800'>
                Kalender Minggu Ini
              </h3>
              <Badge variant='protected' size='sm'>
                {streakCount} Hari Konsisten
              </Badge>
            </div>
            <p className='mt-0.5 text-xs text-slate-500'>
              Pantau tanggal konsumsi pil pada minggu berjalan
            </p>
          </div>
        </div>

        <div className='hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex'>
          <Clock size={13} className='text-teal-600' />
          <span className='font-semibold text-slate-700'>Rutinitas: 20:00 WIB</span>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1.5 sm:gap-2.5'>
        {weekDates.map(date => (
          <div
            key={date.dateStr}
            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border p-1.5 transition-all sm:min-h-20 ${
              date.isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''
            } ${
              date.isRecorded
                ? 'border-teal-600 bg-teal-600 text-white shadow-xs shadow-teal-600/25'
                : date.isMissed
                  ? 'border-rose-300 bg-rose-100 text-rose-700'
                  : date.isFuture
                    ? 'border-slate-200 bg-slate-50 text-slate-400'
                    : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase ${
                date.isToday
                  ? date.isRecorded
                    ? 'text-teal-100'
                    : 'text-orange-600'
                  : date.isRecorded
                    ? 'text-teal-100'
                    : 'text-slate-400'
              }`}
            >
              {date.dayName}
            </span>
            <span className='text-sm font-extrabold sm:text-base'>{date.dayNumber}</span>
            <span className='flex h-3.5 items-center justify-center'>
              {date.isRecorded && <Check size={13} strokeWidth={3} />}
              {date.isToday && !date.isRecorded && !date.isMissed && (
                <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-orange-500' />
              )}
            </span>
          </div>
        ))}
      </div>

      <div className='mt-3.5 flex flex-col justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] sm:flex-row sm:items-center'>
        <div className='flex flex-wrap items-center gap-3 text-slate-500'>
          <span className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-full bg-teal-600' />
            Selesai
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-300' />
            Terlewat
          </span>
          <span className='flex items-center gap-1.5'>
            <span className='h-2.5 w-2.5 rounded-full bg-orange-300' />
            Hari ini
          </span>
        </div>

        <div className='flex items-center gap-1.5 rounded-md bg-teal-50/70 px-2.5 py-1 font-medium text-teal-700'>
          <Info size={12} className='shrink-0' />
          <span>Tanggal akan berubah warna setelah selesai</span>
        </div>
      </div>
    </Card>
  );
};
