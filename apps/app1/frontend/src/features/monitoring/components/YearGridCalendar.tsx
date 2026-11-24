'use client';

import { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { ConsumptionLog } from '../types';

export interface YearGridCalendarProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  activityMap: Record<string, ActivityDateInfo>;
  allLogs?: ConsumptionLog[];
  todayStr: string;
  todayStatus?: 'pending' | 'recorded' | 'missed';
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onSelectMonth: (year: number, monthIndex: number) => void;
}

const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const DAY_LABELS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

export function YearGridCalendar({
  currentYear,
  onYearChange,
  activityMap,
  todayStr,
  todayStatus = 'pending',
  selectedDate,
  onSelectDate,
  onSelectMonth,
}: YearGridCalendarProps) {
  const actualCurrentYear = useMemo(() => new Date().getFullYear(), []);

  // Pre-calculate 12 months calendar days data
  const monthsData = useMemo(() => {
    return MONTH_NAMES_ID.map((monthName, monthIndex) => {
      const firstDay = new Date(currentYear, monthIndex, 1);
      const firstDayOfWeek = firstDay.getDay(); // 0 is Sunday
      // Align Monday start: 0=Mon, 1=Tue, ..., 6=Sun
      const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      const daysCount = new Date(currentYear, monthIndex + 1, 0).getDate();

      const days: Array<{
        day: number;
        dateKey: string;
        isToday: boolean;
        isSelected: boolean;
        status: 'recorded' | 'missed' | 'pending' | 'none';
        activity?: ActivityDateInfo;
      } | null> = [];

      for (let i = 0; i < startOffset; i++) {
        days.push(null);
      }

      let monthTaken = 0;
      let monthMissed = 0;
      let monthScheduled = 0;

      for (let d = 1; d <= daysCount; d++) {
        const mm = String(monthIndex + 1).padStart(2, '0');
        const dd = String(d).padStart(2, '0');
        const dateKey = `${currentYear}-${mm}-${dd}`;
        const activity = activityMap[dateKey];
        const isToday = dateKey === todayStr;
        const isSelected = dateKey === selectedDate;

        let status: 'recorded' | 'missed' | 'pending' | 'none' = 'none';
        if (activity) {
          status = activity.status;
          monthScheduled++;
          if (activity.status === 'recorded') monthTaken++;
          if (activity.status === 'missed') monthMissed++;
        } else if (isToday && todayStatus) {
          status = todayStatus;
        }

        days.push({
          day: d,
          dateKey,
          isToday,
          isSelected,
          status,
          activity,
        });
      }

      const monthRate =
        monthScheduled > 0 ? Math.round((monthTaken / monthScheduled) * 100) : 0;

      return {
        monthIndex,
        monthName,
        days,
        monthTaken,
        monthMissed,
        monthScheduled,
        monthRate,
      };
    });
  }, [currentYear, activityMap, todayStr, selectedDate, todayStatus]);

  return (
    <div className='flex flex-col gap-5 w-full animate-fade-in'>
      {/* 1. Header Toolbar: Year Navigator & Actions */}
      <div className='flex items-center justify-between gap-2 sm:gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-[#F0DFE7] shadow-[0_2px_10px_rgba(184,40,95,0.02)]'>
        {/* Left: Hanya menampilkan tahun aktif */}
        <div className='flex items-center gap-2 min-w-0'>
          <h3 className='font-extrabold text-base sm:text-lg text-[#1E1F24] tracking-tight truncate'>
            Tahun {currentYear}
          </h3>
        </div>

        {/* Right: Button "Tahun Ini" serta icon/button < dan > untuk navigasi ganti tahun */}
        <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
          {/* Button "Tahun Ini" */}
          <button
            type='button'
            onClick={() => onYearChange(actualCurrentYear)}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
              currentYear === actualCurrentYear
                ? 'bg-[#FAF6F8] text-[#525866] border-[#F0DFE7] hover:bg-[#FCE7F0] hover:text-[#B8285F]'
                : 'bg-[#FAF0F4] text-[#861A43] border-[#F7CADF] hover:bg-[#FCE7F0] font-bold'
            }`}
            title={`Kembali ke Tahun ${actualCurrentYear}`}
          >
            <RotateCcw size={12} className={currentYear === actualCurrentYear ? 'text-[#8E95A5]' : 'text-[#861A43]'} />
            <span>Tahun Ini</span>
          </button>

          {/* Icon/Button < dan > untuk navigasi ganti tahun (sebelumnya/berikutnya) */}
          <div className='flex items-center bg-[#FAF6F8] p-0.5 rounded-xl border border-[#F0DFE7]'>
            <button
              type='button'
              onClick={() => onYearChange(currentYear - 1)}
              className='p-1.5 rounded-lg text-[#525866] hover:text-[#B8285F] hover:bg-white transition-colors cursor-pointer'
              title='Tahun Sebelumnya'
              aria-label='Tahun Sebelumnya'
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type='button'
              onClick={() => onYearChange(currentYear + 1)}
              className='p-1.5 rounded-lg text-[#525866] hover:text-[#B8285F] hover:bg-white transition-colors cursor-pointer'
              title='Tahun Selanjutnya'
              aria-label='Tahun Selanjutnya'
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. The 12-Month Grid Matrix (2 Columns on Mobile) */}
      <div className='grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4 items-stretch'>
        {monthsData.map(m => {
          return (
            <div
              key={m.monthIndex}
              className='bg-white rounded-xl sm:rounded-2xl border border-[#F0DFE7] hover:border-[#EE9CBF] hover:shadow-[0_8px_24px_rgba(184,40,95,0.06)] hover:-translate-y-0.5 transition-all p-2 sm:p-3.5 flex flex-col justify-between group shadow-[0_2px_10px_rgba(184,40,95,0.02)]'
            >
              <div>
                {/* Month Card Header */}
                <div className='flex items-center justify-between mb-1.5 sm:mb-2.5 pb-1.5 sm:pb-2 border-b border-[#FAF0F4] gap-1'>
                  <div className='flex items-center gap-1 min-w-0'>
                    <h4 className='text-xs sm:text-sm font-bold text-[#1E1F24] group-hover:text-[#B8285F] transition-colors truncate'>
                      {m.monthName}
                    </h4>
                  </div>
                  {m.monthScheduled > 0 ? (
                    <span
                      className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap ${
                        m.monthRate >= 80
                          ? 'bg-teal-50 text-[#0D9488] border-teal-200'
                          : m.monthRate >= 50
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-[#FAF0F4] text-[#861A43] border-[#F7CADF]'
                      }`}
                    >
                      {m.monthTaken}/{m.monthScheduled}
                    </span>
                  ) : (
                    <span className='text-[8px] sm:text-[10px] font-medium text-[#8E95A5] shrink-0'>
                      Kosong
                    </span>
                  )}
                </div>

                {/* Day Labels */}
                <div className='grid grid-cols-7 gap-0.5 sm:gap-1 text-center mb-1'>
                  {DAY_LABELS.map((label, idx) => (
                    <span key={idx} className='text-[8px] sm:text-[10px] font-semibold text-[#8E95A5] leading-none'>
                      {label}
                    </span>
                  ))}
                </div>

                {/* Calendar Days Matrix */}
                <div className='grid grid-cols-7 gap-0.5 sm:gap-1'>
                  {m.days.map((cell, cIdx) => {
                    if (!cell) {
                      return <div key={`empty-${m.monthIndex}-${cIdx}`} className='h-5 sm:h-7' />;
                    }

                    const isTaken = cell.status === 'recorded';
                    const isMissed = cell.status === 'missed';
                    const isPending = cell.status === 'pending';
                    const isSelected = cell.dateKey === selectedDate;

                    return (
                      <button
                        key={cell.dateKey}
                        type='button'
                        onClick={() => onSelectDate(cell.dateKey)}
                        className={`relative h-5 sm:h-7 rounded-sm sm:rounded-lg flex flex-col items-center justify-center text-[9px] sm:text-[11px] font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#B8285F] text-white font-bold shadow-xs ring-1 sm:ring-2 ring-[#FCE7F0]'
                            : cell.isToday
                              ? 'border border-[#B8285F] font-bold text-[#B8285F] bg-[#FAF0F4]'
                              : isTaken
                                ? 'bg-teal-50 text-[#065F46] font-bold hover:bg-teal-100'
                                : isMissed
                                  ? 'bg-[#FAF0F4] text-[#861A43] font-bold hover:bg-[#FCE7F0]'
                                  : 'text-[#525866] hover:bg-[#FAF6F8] hover:text-[#1E1F24]'
                        }`}
                        title={`${cell.day} ${m.monthName} ${currentYear}${cell.activity ? ` - ${cell.activity.status}` : ''}`}
                      >
                        <span className='leading-none'>{cell.day}</span>

                        {/* Status Dots */}
                        {isTaken && (
                          <span
                            className={`absolute -bottom-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-[#0D9488]'
                            }`}
                          />
                        )}
                        {isMissed && (
                          <span
                            className={`absolute -bottom-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-[#B8285F]'
                            }`}
                          />
                        )}
                        {isPending && (
                          <span
                            className={`absolute -bottom-0.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Month Card Footer Action: Drill-down to Month Detail */}
              <button
                type='button'
                onClick={() => onSelectMonth(currentYear, m.monthIndex)}
                className='mt-2 sm:mt-3 pt-1.5 sm:pt-2 border-t border-[#F0DFE7] flex items-center justify-between text-[10px] sm:text-[11px] font-semibold text-[#861A43] group-hover:text-[#B8285F] transition-colors w-full cursor-pointer'
              >
                <span>Buka Detail</span>
                <ArrowRight size={11} className='group-hover:translate-x-0.5 transition-transform shrink-0' />
              </button>
            </div>
          );
        })}
      </div>

      {/* 4. Legend Footer */}
      <div className='flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-[#F0DFE7] text-xs text-[#525866] shadow-2xs'>
        <div className='flex items-center gap-1.5 font-semibold text-[#1E1F24]'>
          <span>Keterangan Status:</span>
        </div>
        <div className='flex items-center gap-4 flex-wrap'>
          <div className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-[#0D9488]' />
            <span className='text-[11px] font-medium'>Diminum (Selesai)</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-[#B8285F]' />
            <span className='text-[11px] font-medium'>Terlewat</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full bg-amber-400' />
            <span className='text-[11px] font-medium'>Hari Ini / Pending</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2.5 h-2.5 rounded-full border border-[#B8285F] bg-[#FAF0F4]' />
            <span className='text-[11px] font-medium'>Tanggal Terpilih</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default YearGridCalendar;
