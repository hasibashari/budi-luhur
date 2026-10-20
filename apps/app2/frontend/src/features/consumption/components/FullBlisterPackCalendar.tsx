import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ActivityDateInfo } from '../api/consumptionRepository';

interface FullBlisterPackCalendarProps {
  activityMap: Record<string, ActivityDateInfo>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  todayStr: string;
  todayStatus?: 'pending' | 'recorded' | 'missed';
}

interface CalendarDay {
  dateKey: string;
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  status: 'recorded' | 'missed' | 'pending' | 'none';
}

const getDateKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const FullBlisterPackCalendar: React.FC<FullBlisterPackCalendarProps> = ({
  activityMap,
  selectedDate,
  onSelectDate,
  todayStr,
  todayStatus = 'pending',
}) => {
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const date = new Date(`${selectedDate || todayStr}T00:00:00`);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  const calendarDays = useMemo<(CalendarDay | null)[]>(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (CalendarDay | null)[] = Array.from({ length: startOffset }, () => null);

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = getDateKey(year, month, day);
      const activity = activityMap[dateKey];
      const isToday = dateKey === todayStr;

      days.push({
        dateKey,
        dayNumber: day,
        isToday,
        isSelected: dateKey === selectedDate,
        status: activity?.status || (isToday ? todayStatus : 'none'),
      });
    }

    return days;
  }, [activityMap, calendarViewDate, selectedDate, todayStr, todayStatus]);

  const changeMonth = (offset: number) => {
    setCalendarViewDate(current => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  return (
    <Card padding='md' className='border border-slate-200/90 bg-white shadow-xs'>
      <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
        <div>
          <h3 className='text-sm font-bold tracking-tight text-slate-900 sm:text-base'>
            Kalender Konsumsi Pil
          </h3>
          <p className='mt-0.5 text-xs text-slate-500'>
            Pilih tanggal untuk melihat atau mengubah status konsumsi
          </p>
        </div>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => changeMonth(-1)}
            className='cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-teal-700'
            aria-label='Bulan sebelumnya'
          >
            <ChevronLeft size={18} />
          </button>
          <span className='min-w-32 text-center text-xs font-extrabold capitalize text-slate-800 sm:text-sm'>
            {calendarViewDate.toLocaleDateString('id-ID', {
              month: 'long',
              year: 'numeric',
            })}
          </span>
          <button
            type='button'
            onClick={() => changeMonth(1)}
            className='cursor-pointer rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-teal-700'
            aria-label='Bulan berikutnya'
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className='mt-4 rounded-2xl border border-slate-200/70 bg-slate-50/70 p-2.5 sm:p-4'>
        <div className='mb-2 grid grid-cols-7 gap-1 text-center sm:gap-2'>
          {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(day => (
            <span key={day} className='text-[10px] font-bold text-slate-400 sm:text-xs'>
              {day}
            </span>
          ))}
        </div>

        <div className='grid grid-cols-7 gap-1 sm:gap-2'>
          {calendarDays.map((day, index) =>
            day ? (
              <button
                key={day.dateKey}
                type='button'
                onClick={() => onSelectDate(day.dateKey)}
                title={`Pilih tanggal ${day.dayNumber}`}
                className={`relative flex aspect-square min-h-9 items-center justify-center rounded-xl border text-xs font-bold transition-all sm:min-h-11 sm:text-sm ${
                  day.isSelected
                    ? 'ring-2 ring-teal-600 ring-offset-1'
                    : 'hover:border-teal-300 hover:bg-teal-50'
                } ${
                  day.status === 'recorded'
                    ? 'border-teal-600 bg-teal-600 text-white'
                    : day.status === 'missed'
                      ? 'border-rose-300 bg-rose-100 text-rose-700'
                      : day.status === 'pending' && day.isToday
                        ? 'border-orange-400 bg-orange-100 text-orange-700'
                        : day.isToday
                          ? 'border-orange-300 bg-white text-orange-600'
                          : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                {day.dayNumber}
                {day.status === 'recorded' && (
                  <Check
                    size={10}
                    strokeWidth={3}
                    className='absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5'
                  />
                )}
              </button>
            ) : (
              <div key={`empty-${index}`} className='aspect-square min-h-9 sm:min-h-11' />
            ),
          )}
        </div>

        <div className='mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 border-t border-slate-200/70 pt-3 text-[10px] text-slate-600 sm:text-xs'>
          <span className='flex items-center gap-1'>
            <span className='h-2.5 w-2.5 rounded-full bg-teal-600' />
            Selesai
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-2.5 w-2.5 rounded-full bg-rose-300' />
            Terlewat
          </span>
          <span className='flex items-center gap-1'>
            <span className='h-2.5 w-2.5 rounded-full bg-orange-300' />
            Hari ini
          </span>
        </div>
      </div>
    </Card>
  );
};
