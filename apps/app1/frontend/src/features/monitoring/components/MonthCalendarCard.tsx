'use client';

import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ActivityDateInfo } from '../api/consumptionRepository';

export interface MonthCalendarCardProps {
  currentYear: number;
  currentMonthIndex: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectCurrentMonth: () => void;
  activityMap: Record<string, ActivityDateInfo>;
  todayStr: string;
  todayStatus?: 'pending' | 'recorded' | 'missed';
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
  onSwitchToYearView?: () => void;
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

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function MonthCalendarCard({
  currentYear,
  currentMonthIndex,
  onPrevMonth,
  onNextMonth,
  onSelectCurrentMonth,
  activityMap,
  todayStr,
  todayStatus = 'pending',
  selectedDate,
  onSelectDate,
  onSwitchToYearView,
}: MonthCalendarCardProps) {
  const now = useMemo(() => new Date(), []);
  const actualCurrentYear = now.getFullYear();
  const actualCurrentMonthIndex = now.getMonth();

  const isActualCurrentMonth =
    currentYear === actualCurrentYear && currentMonthIndex === actualCurrentMonthIndex;

  const currentMonthName = MONTH_NAMES_ID[currentMonthIndex] || 'Bulan';

  // Calculate days matrix for the active month
  const monthData = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonthIndex, 1);
    const firstDayOfWeek = firstDay.getDay(); // 0 is Sunday
    // Align Monday start: 0=Mon, 1=Tue, ..., 6=Sun
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    const daysCount = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

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

    let takenCount = 0;
    let missedCount = 0;
    let scheduledCount = 0;

    for (let d = 1; d <= daysCount; d++) {
      const mm = String(currentMonthIndex + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateKey = `${currentYear}-${mm}-${dd}`;
      const activity = activityMap[dateKey];
      const isToday = dateKey === todayStr;
      const isSelected = dateKey === selectedDate;

      let status: 'recorded' | 'missed' | 'pending' | 'none' = 'none';
      if (activity) {
        status = activity.status;
        scheduledCount++;
        if (activity.status === 'recorded') takenCount++;
        if (activity.status === 'missed') missedCount++;
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

    const rate = scheduledCount > 0 ? Math.round((takenCount / scheduledCount) * 100) : 0;

    return {
      days,
      takenCount,
      missedCount,
      scheduledCount,
      rate,
    };
  }, [currentYear, currentMonthIndex, activityMap, todayStr, selectedDate, todayStatus]);

  return (
    <Card padding='md' className='border-[#F0DFE7] bg-white shadow-2xs w-full animate-fade-in'>
      {/* 1. Header Toolbar: Month Navigator & Actions */}
      <div className='flex items-center justify-between gap-2 sm:gap-3 pb-3 border-b border-[#F0DFE7]'>
        {/* Left: Hanya menampilkan nama bulan aktif */}
        <div className='flex items-center gap-2 min-w-0'>
          <h3 className='font-extrabold text-base sm:text-lg text-[#1E1F24] tracking-tight truncate'>
            {currentMonthName} {currentYear}
          </h3>
        </div>

        {/* Right: Button "Hari Ini" serta icon/button < dan > untuk navigasi ganti bulan */}
        <div className='flex items-center gap-1.5 sm:gap-2 shrink-0'>
          {/* Button "Hari Ini" */}
          <button
            type='button'
            onClick={onSelectCurrentMonth}
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-2xs ${
              isActualCurrentMonth
                ? 'bg-[#FAF6F8] text-[#525866] border-[#F0DFE7] hover:bg-[#FCE7F0] hover:text-[#B8285F]'
                : 'bg-[#FAF0F4] text-[#861A43] border-[#F7CADF] hover:bg-[#FCE7F0] font-bold'
            }`}
            title='Kembali ke Bulan & Hari Ini'
          >
            <RotateCcw size={12} className={isActualCurrentMonth ? 'text-[#8E95A5]' : 'text-[#861A43]'} />
            <span>Hari Ini</span>
          </button>

          {/* Icon/Button < dan > untuk navigasi ganti bulan (sebelumnya/berikutnya) */}
          <div className='flex items-center bg-[#FAF6F8] p-0.5 rounded-xl border border-[#F0DFE7]'>
            <button
              type='button'
              onClick={onPrevMonth}
              className='p-1.5 rounded-lg text-[#525866] hover:text-[#B8285F] hover:bg-white transition-colors cursor-pointer'
              title='Bulan Sebelumnya'
              aria-label='Bulan Sebelumnya'
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type='button'
              onClick={onNextMonth}
              className='p-1.5 rounded-lg text-[#525866] hover:text-[#B8285F] hover:bg-white transition-colors cursor-pointer'
              title='Bulan Selanjutnya'
              aria-label='Bulan Selanjutnya'
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Days of the Week Header */}
      <div className='grid grid-cols-7 gap-1 sm:gap-2 text-center pt-3 pb-1'>
        {DAY_LABELS.map((label, idx) => (
          <span
            key={idx}
            className={`text-xs font-bold py-1 ${
              idx === 6 ? 'text-[#B8285F]' : 'text-[#8E95A5]'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      {/* 3. Monthly Calendar Date Grid */}
      <div className='grid grid-cols-7 gap-1.5 sm:gap-2'>
        {monthData.days.map((cell, idx) => {
          if (!cell) {
            return (
              <div
                key={`empty-${currentMonthIndex}-${idx}`}
                className='h-10 sm:h-12 rounded-xl'
              />
            );
          }

          const isTaken = cell.status === 'recorded';
          const isMissed = cell.status === 'missed';
          const isPending = cell.status === 'pending';
          const isSelected = cell.isSelected;

          return (
            <button
              key={cell.dateKey}
              type='button'
              onClick={() => onSelectDate(cell.dateKey)}
              className={`relative h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#B8285F] text-white font-extrabold shadow-sm ring-2 ring-[#FCE7F0] ring-offset-1'
                  : cell.isToday
                    ? 'border-2 border-[#B8285F] bg-[#FAF0F4] font-extrabold text-[#B8285F]'
                    : isTaken
                      ? 'bg-teal-50/80 text-[#065F46] font-bold border border-teal-100 hover:bg-teal-100/80'
                      : isMissed
                        ? 'bg-[#FAF0F4] text-[#861A43] font-bold border border-[#F7CADF] hover:bg-[#FCE7F0]'
                        : 'text-[#1E1F24] hover:bg-[#FAF6F8] font-medium border border-transparent'
              }`}
              title={`${cell.day} ${currentMonthName} ${currentYear}${cell.activity ? ` - Status: ${cell.activity.status}` : ''}`}
            >
              <span className='text-xs sm:text-sm leading-none'>
                {cell.day}
              </span>

              {/* Status Indicator Dot */}
              <div className='absolute bottom-1.5 flex items-center justify-center gap-0.5'>
                {isTaken && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#0D9488]'
                    }`}
                  />
                )}
                {isMissed && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-[#B8285F]'
                    }`}
                  />
                )}
                {isPending && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-white' : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Legend Footer */}
      <div className='flex items-center justify-between flex-wrap gap-2 pt-3.5 mt-3 border-t border-[#F0DFE7] text-xs text-[#525866]'>
        <span className='font-semibold text-[#1E1F24] text-[11px] sm:text-xs'>
          Keterangan:
        </span>
        <div className='flex items-center gap-3 sm:gap-4 flex-wrap text-[11px]'>
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-[#0D9488]' />
            <span>Diminum</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-[#B8285F]' />
            <span>Terlewat</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-amber-400' />
            <span>Hari Ini / Jadwal</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='w-2 h-2 rounded-full bg-[#B8285F] ring-2 ring-[#FCE7F0]' />
            <span>Dipilih</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default MonthCalendarCard;
