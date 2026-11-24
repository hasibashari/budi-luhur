'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, X, Grid, CalendarDays } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { formatShortDate } from '../utils/dateHelpers';

export type DateFilterPreset = 'ALL' | 'TODAY' | '7_DAYS' | '30_DAYS' | '1_YEAR' | 'CUSTOM';
export type StatusFilterOption = 'ALL' | 'ON_TIME' | 'MISSED';

export interface DateFilterBarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  dateFilterPreset: DateFilterPreset;
  onDateFilterPresetChange: (preset: DateFilterPreset) => void;
  activityMap: Record<string, ActivityDateInfo>;
  todayStr: string;
  todayStatus?: 'pending' | 'recorded' | 'missed';
  onSwitchToYearView?: () => void;
  showCalendarButton?: boolean;
}

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des',
];

export function DateFilterBar({
  selectedDate,
  onSelectDate,
  dateFilterPreset,
  onDateFilterPresetChange,
  activityMap,
  todayStr,
  todayStatus = 'pending',
  onSwitchToYearView,
  showCalendarButton = true,
}: DateFilterBarProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());
  // Sub-view inside calendar popover: 'month' or 'year' (Google Calendar style)
  const [popoverViewMode, setPopoverViewMode] = useState<'month' | 'year'>('month');
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

  // 12 Mini Months data for Year View inside Popover
  const popoverYearMonths = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    return MONTH_NAMES_ID.map((mName, mIdx) => {
      const firstDayIdx = new Date(year, mIdx, 1).getDay();
      const startOffset = firstDayIdx === 0 ? 6 : firstDayIdx - 1;
      const daysCount = new Date(year, mIdx + 1, 0).getDate();

      const days = [];
      for (let i = 0; i < startOffset; i++) days.push(null);
      for (let d = 1; d <= daysCount; d++) {
        const dStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const act = activityMap[dStr];
        const isToday = dStr === todayStr;
        let st: 'recorded' | 'missed' | 'pending' | 'none' = 'none';
        if (act) st = act.status;
        else if (isToday) st = todayStatus;
        days.push({ day: d, dateStr: dStr, status: st, isToday });
      }

      return {
        monthIndex: mIdx,
        monthName: mName,
        shortName: MONTH_NAMES_SHORT[mIdx],
        days,
      };
    });
  }, [calendarViewDate, activityMap, todayStr, todayStatus]);

  const handleSelectDay = (dateKey: string) => {
    onSelectDate(dateKey);
    onDateFilterPresetChange('CUSTOM');
    setIsCalendarOpen(false);
  };

  const handleSelectFullYear = () => {
    onDateFilterPresetChange('1_YEAR');
    setIsCalendarOpen(false);
    if (onSwitchToYearView) {
      onSwitchToYearView();
    }
  };

  const currentYear = calendarViewDate.getFullYear();

  return (
    <Card padding='md' className='relative z-30 overflow-visible border-pink-100'>
      <div className='flex flex-col lg:flex-row lg:items-center justify-between gap-3'>
        {/* Left Side: Calendar Dropdown Button & Preset Chips */}
        <div className='flex items-center gap-2 flex-wrap'>
          {/* 📅 Popover Calendar Trigger Button */}
          {showCalendarButton && (
            <div className='relative' ref={calendarPopoverRef}>
              <button
                type='button'
                onClick={() => setIsCalendarOpen(prev => !prev)}
                className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs ${
                  isCalendarOpen || dateFilterPreset === 'CUSTOM' || dateFilterPreset === '1_YEAR'
                    ? 'bg-pink-50 border-rose-600 text-rose-600 ring-2 ring-pink-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-pink-300'
                }`}
                title='Buka Kalender'
                aria-label='Buka Kalender'
              >
                <CalendarIcon size={15} className='text-rose-600 shrink-0' />
                <span className='font-bold'>
                  {dateFilterPreset === 'CUSTOM'
                    ? formatShortDate(selectedDate)
                    : dateFilterPreset === '1_YEAR'
                      ? `1 Tahun (${currentYear})`
                      : dateFilterPreset === 'TODAY'
                          ? `Hari Ini (${formatShortDate(todayStr)})`
                          : 'Kalender'}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform text-rose-600 ${isCalendarOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* 🗓️ MINI CALENDAR POPOVER DROPDOWN (Supports Month & Year Views) */}
              {isCalendarOpen && (
                <div
                  className={`absolute left-0 top-full mt-2 bg-white rounded-3xl shadow-2xl border border-pink-100 p-4 z-50 animate-fade-in ${
                    popoverViewMode === 'year' ? 'w-[320px] sm:w-[480px]' : 'w-72 sm:w-80'
                  }`}
                >
                  {/* View Switcher Bar inside Popover: Bulan vs 1 Tahun (Google Calendar style) */}
                  <div className='flex items-center justify-between pb-2 mb-3 border-b border-pink-100 gap-2'>
                    <div className='flex items-center bg-slate-100 p-0.5 rounded-xl'>
                      <button
                        type='button'
                        onClick={() => setPopoverViewMode('month')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          popoverViewMode === 'month'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Bulan
                      </button>
                      <button
                        type='button'
                        onClick={() => setPopoverViewMode('year')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          popoverViewMode === 'year'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        1 Tahun Penuh
                      </button>
                    </div>

                    {/* Quick Year Selection Button */}
                    <button
                      type='button'
                      onClick={handleSelectFullYear}
                      className='text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-pink-200'
                    >
                      Pilih 1 Tahun
                    </button>
                  </div>

                  {popoverViewMode === 'month' ? (
                    <>
                      {/* Month Navigator */}
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
                          aria-label='Bulan Sebelumnya'
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <span className='text-xs font-bold text-slate-800'>
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
                          aria-label='Bulan Selanjutnya'
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
                                  ? 'bg-rose-600 text-white shadow-xs font-black'
                                  : day.isToday
                                    ? 'bg-pink-50 text-rose-600 border border-pink-300'
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
                    </>
                  ) : (
                    /* 12-Month Year View Grid (Google Calendar style) */
                    <div className='flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1'>
                      {/* Year Navigator */}
                      <div className='flex items-center justify-between pb-1 border-b border-slate-100'>
                        <button
                          type='button'
                          onClick={() => {
                            setCalendarViewDate(
                              new Date(calendarViewDate.getFullYear() - 1, 0, 1),
                            );
                          }}
                          className='p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer'
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <span className='text-sm font-extrabold text-slate-800'>
                          Tahun {calendarViewDate.getFullYear()}
                        </span>

                        <button
                          type='button'
                          onClick={() => {
                            setCalendarViewDate(
                              new Date(calendarViewDate.getFullYear() + 1, 0, 1),
                            );
                          }}
                          className='p-1 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer'
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>

                      {/* 12 Months Grid */}
                      <div className='grid grid-cols-2 sm:grid-cols-3 gap-2.5'>
                        {popoverYearMonths.map(m => (
                          <div
                            key={m.monthIndex}
                            className='p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-pink-300 transition-colors cursor-pointer'
                            onClick={() => {
                              setCalendarViewDate(new Date(calendarViewDate.getFullYear(), m.monthIndex, 1));
                              setPopoverViewMode('month');
                            }}
                          >
                            <div className='text-[11px] font-extrabold text-rose-600 mb-1'>
                              {m.shortName}
                            </div>
                            <div className='grid grid-cols-7 gap-0.5 text-center'>
                              {['S','S','R','K','J','S','M'].map((d, i) => (
                                <span key={i} className='text-[7px] text-slate-400'>{d}</span>
                              ))}
                              {m.days.map((d, di) => {
                                if (!d) return <div key={`em-${di}`} className='h-3' />;
                                const hasTaken = d.status === 'recorded';
                                const hasMissed = d.status === 'missed';
                                return (
                                  <div
                                    key={d.dateStr}
                                    className={`h-3 flex items-center justify-center text-[7px] font-bold rounded-sm ${
                                      hasTaken
                                        ? 'bg-emerald-500 text-white'
                                        : hasMissed
                                          ? 'bg-rose-500 text-white'
                                          : d.isToday
                                            ? 'bg-amber-400 text-white'
                                            : 'text-slate-600'
                                    }`}
                                  >
                                    {d.day}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Calendar Dot Legend Footer */}
                  <div className='flex items-center justify-between pt-2.5 mt-3 border-t border-slate-100 text-[10px] text-slate-500'>
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
          )}

          {/* Quick Filter Preset Chips */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar'>
            <button
              type='button'
              onClick={() => onDateFilterPresetChange('ALL')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 ${
                dateFilterPreset === 'ALL'
                  ? 'bg-rose-600 text-white shadow-2xs'
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
                  ? 'bg-rose-600 text-white shadow-2xs'
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
                  ? 'bg-rose-600 text-white shadow-2xs'
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
                  ? 'bg-rose-600 text-white shadow-2xs'
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
              className='inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-pink-50 rounded-xl transition-colors cursor-pointer border border-slate-200 hover:border-pink-200'
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
