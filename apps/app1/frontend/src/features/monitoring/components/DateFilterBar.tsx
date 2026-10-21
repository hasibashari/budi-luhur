'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { formatShortDate } from '../utils/dateHelpers';

export type DateFilterPreset = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS' | 'CUSTOM';
export type StatusFilterOption = 'ALL' | 'ON_TIME' | 'MISSED';

export interface DateFilterBarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dateFilterPreset: DateFilterPreset;
  onDateFilterPresetChange: (preset: DateFilterPreset) => void;
  activityMap: Record<string, ActivityDateInfo>;
  todayStr: string;
  todayStatus?: 'pending' | 'recorded' | 'missed';
}

export function DateFilterBar({
  selectedDate,
  onSelectDate,
  dateFilterPreset,
  onDateFilterPresetChange,
  activityMap,
  todayStr,
  todayStatus = 'pending',
}: DateFilterBarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  const calendarPopoverRef = useRef<HTMLDivElement>(null);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        calendarPopoverRef.current &&
        !calendarPopoverRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    }
    if (isCalendarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);

  // Calendar matrix calculation for current month view
  const calendarGrid = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday start (0=Mon, 6=Sun)
    const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;
    const days = [];

    // Empty lead slots before the 1st day of the month
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }

    // Days in current month
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateKey = `${year}-${mStr}-${dStr}`;

      const activity = activityMap[dateKey];
      const isToday = dateKey === todayStr;
      const isSelected = dateKey === selectedDate;

      let status: 'recorded' | 'missed' | 'pending' | 'none' = 'none';
      if (activity) {
        status = activity.status;
      } else if (isToday) {
        status = todayStatus;
      }

      days.push({
        dayNum,
        dateKey,
        isToday,
        isSelected,
        status,
        activity,
      });
    }

    return days;
  }, [calendarViewDate, activityMap, todayStr, selectedDate, todayStatus]);

  const handleSelectDay = (dateKey: string) => {
    onSelectDate(dateKey);
    onDateFilterPresetChange('CUSTOM');
    setIsCalendarOpen(false);
  };

  return (
    <Card padding='md' className='relative z-30 overflow-visible'>
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
        {/* Left Side: Calendar Dropdown Button & Preset Chips */}
        <div className='flex items-center gap-2 flex-wrap'>
          {/* 📅 Popover Calendar Trigger Button */}
          <div className='relative' ref={calendarPopoverRef}>
            <button
              type='button'
              onClick={() => setIsCalendarOpen(prev => !prev)}
              className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                isCalendarOpen || dateFilterPreset === 'CUSTOM'
                  ? 'bg-[#fff1f2] border-[#e11d48] text-[#e11d48] ring-2 ring-rose-200'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-rose-300'
              }`}
              title='Pilih Tanggal dari Kalender'
              aria-label='Pilih Tanggal dari Kalender'
            >
              <CalendarIcon size={15} className='text-[#e11d48] shrink-0' />
              <span className='hidden sm:inline'>
                {dateFilterPreset === 'CUSTOM'
                  ? formatShortDate(selectedDate)
                  : dateFilterPreset === 'TODAY'
                    ? `Hari Ini (${formatShortDate(todayStr)})`
                    : 'Pilih dari Kalender'}
              </span>
              <ChevronDown
                size={14}
                className={`hidden sm:inline-block transition-transform ${isCalendarOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* 🗓️ MINI CALENDAR POPOVER DROPDOWN WITH ACTIVITY DOTS */}
            {isCalendarOpen && (
              <div className='absolute left-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-rose-100 p-3.5 z-50 animate-fade-in'>
                {/* Popover Header: Month & Year Navigator */}
                <div className='flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100'>
                  <button
                    type='button'
                    onClick={() => {
                      setCalendarViewDate(
                        new Date(
                          calendarViewDate.getFullYear(),
                          calendarViewDate.getMonth() - 1,
                          1,
                        ),
                      );
                    }}
                    className='p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer'
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className='text-xs font-bold text-[#1e293b]'>
                    {calendarViewDate.toLocaleDateString('id-ID', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>

                  <button
                    type='button'
                    onClick={() => {
                      setCalendarViewDate(
                        new Date(
                          calendarViewDate.getFullYear(),
                          calendarViewDate.getMonth() + 1,
                          1,
                        ),
                      );
                    }}
                    className='p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer'
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Day Names Header */}
                <div className='grid grid-cols-7 gap-1 text-center mb-1'>
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'].map(d => (
                    <span key={d} className='text-[10px] font-bold text-slate-400'>
                      {d}
                    </span>
                  ))}
                </div>

                {/* Calendar Month Grid (1-31) with Status Dots */}
                <div className='grid grid-cols-7 gap-1'>
                  {calendarGrid.map((day, idx) => {
                    if (!day) {
                      return <div key={`empty-${idx}`} className='h-8' />;
                    }

                    const isSelected =
                      dateFilterPreset === 'CUSTOM' && selectedDate === day.dateKey;
                    const isRecorded = day.status === 'recorded';
                    const isMissed = day.status === 'missed';
                    const isPending = day.status === 'pending' && day.isToday;

                    return (
                      <button
                        key={day.dateKey}
                        type='button'
                        onClick={() => handleSelectDay(day.dateKey)}
                        className={`relative h-8 rounded-xl flex flex-col items-center justify-center text-[11px] font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#e11d48] text-white shadow-xs font-black'
                            : day.isToday
                              ? 'bg-rose-50 text-[#e11d48] border border-rose-300'
                              : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{day.dayNum}</span>

                        {/* Status Indicator Dot on Calendar Date */}
                        <div className='absolute bottom-1 flex items-center justify-center'>
                          {isRecorded && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-emerald-500 ring-1 ring-white'
                              }`}
                            />
                          )}
                          {isMissed && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-rose-500 ring-1 ring-white'
                              }`}
                            />
                          )}
                          {isPending && (
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected
                                  ? 'bg-white'
                                  : 'bg-amber-400 animate-pulse ring-1 ring-white'
                              }`}
                            />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Calendar Dot Legend Footer */}
                <div className='flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[10px] text-slate-500'>
                  <div className='flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-emerald-500' />
                    <span>Selesai</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-rose-500' />
                    <span>Terlewat</span>
                  </div>
                  <div className='flex items-center gap-1'>
                    <span className='w-2 h-2 rounded-full bg-amber-400' />
                    <span>Hari Ini</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Filter Preset Chips */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar'>
            <button
              type='button'
              onClick={() => onDateFilterPresetChange('ALL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                dateFilterPreset === 'ALL'
                  ? 'bg-[#e11d48] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type='button'
              onClick={() => {
                onDateFilterPresetChange('TODAY');
                onSelectDate(todayStr);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                dateFilterPreset === 'TODAY'
                  ? 'bg-[#e11d48] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              type='button'
              onClick={() => onDateFilterPresetChange('7_DAYS')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                dateFilterPreset === '7_DAYS'
                  ? 'bg-[#e11d48] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              7 Hari
            </button>
            <button
              type='button'
              onClick={() => onDateFilterPresetChange('30_DAYS')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                dateFilterPreset === '30_DAYS'
                  ? 'bg-[#e11d48] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              30 Hari
            </button>
          </div>
        </div>

        {/* Right Side: Reset Date Filter button if preset is active */}
        {dateFilterPreset !== 'ALL' && (
          <div className='flex items-center gap-1.5 self-end lg:self-auto'>
            <button
              type='button'
              onClick={() => onDateFilterPresetChange('ALL')}
              className='inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-[#e11d48] hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-slate-200 hover:border-[#fce7f3]'
              title='Reset Filter Tanggal'
            >
              <X size={14} />
              <span>Reset Filter</span>
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
