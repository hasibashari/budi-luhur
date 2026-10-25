'use client';

import { useMemo } from 'react';
import { BarChart3, ShieldCheck, Info } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { ConsumptionLog, ConsumptionStats } from '../types';
import { formatShortDate } from '../utils/dateHelpers';

export interface DayPillItem {
  dayIndex: number; // 1 to 30
  dateStr: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 31
  formattedDate: string; // e.g. "25 Okt"
  dayName: string; // e.g. "Min"
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isPlacebo: boolean; // Days 22-30 (pil pengingat / non-hormon)
  status: 'ON_TIME' | 'LATE' | 'MISSED' | 'PENDING' | 'FUTURE';
  scheduledTime: string;
  takenAt?: string;
  notes?: string;
  log?: ConsumptionLog;
}

export interface PillComplianceChartProps {
  logs: ConsumptionLog[];
  activityMap?: Record<string, ActivityDateInfo>;
  stats: ConsumptionStats | null;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  todayStr?: string;
}

export function PillComplianceChart({
  logs,
  activityMap = {},
  stats,
  selectedDate,
  onSelectDate,
  todayStr = new Date().toISOString().split('T')[0],
}: PillComplianceChartProps) {
  // Build the 30-day timeline items for the current active cycle (anchored to month of selectedDate or todayStr)
  const cycleDays = useMemo<DayPillItem[]>(() => {
    const anchorDate = new Date(`${selectedDate || todayStr}T00:00:00`);
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const todayMs = new Date(`${todayStr}T00:00:00`).getTime();

    const days: DayPillItem[] = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let day = 1; day <= 30; day++) {
      const d = new Date(year, month, day);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayMs = d.getTime();
      const isToday = dateStr === todayStr;
      const isPast = dayMs < todayMs;
      const isFuture = dayMs > todayMs;
      const isPlacebo = day >= 22; // Days 22-30 in 28/30 pack are reminder/placebo pills

      const activity = activityMap[dateStr];
      const matchingLog = logs.find(l => l.scheduledDate === dateStr);

      let status: DayPillItem['status'] = 'FUTURE';

      if (activity) {
        if (activity.status === 'recorded') {
          status = activity.rawStatus === 'LATE' ? 'LATE' : 'ON_TIME';
        } else if (activity.status === 'missed') {
          status = 'MISSED';
        } else if (isToday) {
          status = 'PENDING';
        } else if (isPast) {
          status = 'MISSED';
        }
      } else if (matchingLog) {
        if (matchingLog.status === 'ON_TIME') status = 'ON_TIME';
        else if (matchingLog.status === 'LATE') status = 'LATE';
        else if (matchingLog.status === 'MISSED' || matchingLog.status === 'SKIPPED')
          status = 'MISSED';
        else if (isToday) status = 'PENDING';
        else if (isPast) status = 'MISSED';
      } else {
        if (isToday) status = 'PENDING';
        else if (isPast) status = 'MISSED';
        else status = 'FUTURE';
      }

      days.push({
        dayIndex: day,
        dateStr,
        dayNumber: d.getDate(),
        formattedDate: formatShortDate(dateStr),
        dayName: dayNames[d.getDay()],
        isToday,
        isPast,
        isFuture,
        isPlacebo,
        status,
        scheduledTime: activity?.scheduledTime || matchingLog?.scheduledTime || '20:00',
        takenAt: activity?.takenAt || matchingLog?.takenAt,
        notes: activity?.notes || matchingLog?.notes,
        log: matchingLog,
      });
    }

    return days;
  }, [selectedDate, todayStr, activityMap, logs]);

  // Aggregate cycle metrics for 30 days
  const counts = useMemo(() => {
    let onTime = 0;
    let late = 0;
    let missed = 0;
    let pending = 0;
    let future = 0;

    cycleDays.forEach(item => {
      if (item.status === 'ON_TIME') onTime++;
      else if (item.status === 'LATE') late++;
      else if (item.status === 'MISSED') missed++;
      else if (item.status === 'PENDING') pending++;
      else if (item.status === 'FUTURE') future++;
    });

    const completed = onTime + late;
    const totalElapsed = onTime + late + missed + (pending > 0 ? 1 : 0);
    const adherenceRate =
      stats?.adherenceRate ??
      (totalElapsed > 0 ? Math.round((completed / totalElapsed) * 100) : 100);

    return {
      onTime,
      late,
      missed,
      pending,
      future,
      completed,
      totalElapsed,
      adherenceRate,
    };
  }, [cycleDays, stats]);

  return (
    <Card padding='md' className='w-full border-slate-200/90 shadow-xs bg-white overflow-visible'>
      {/* 1. Header with Title and Protection Rate Badge */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100'>
        <div>
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-100'>
              <BarChart3 size={16} />
            </span>
            <h3 className='text-sm sm:text-base font-bold text-slate-900'>
              Grafik Status Kepatuhan Pil KB (30 Hari)
            </h3>
          </div>
          <p className='text-xs text-slate-500 mt-0.5'>
            Visualisasi 30 batang status harian berdasarkan kepatuhan konsumsi obat aktual
          </p>
        </div>

        <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold self-start sm:self-auto'>
          <ShieldCheck size={14} className='text-teal-600 shrink-0' />
          <span>Kepatuhan: {counts.adherenceRate}%</span>
        </div>
      </div>

      {/* 2. Main 30-Day Discrete Status Bar Chart Area (Opsi 2) */}
      <div className='py-3.5'>
        <div className='rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3.5 sm:p-5'>
          {/* Chart Header Guide */}
          <div className='flex items-center gap-1.5 mb-3 text-xs text-slate-600 font-medium'>
            <Info size={14} className='text-teal-600 shrink-0' />
            <span>30 Batang Kapsul mewakili Hari ke-1 s.d. Hari ke-30</span>
          </div>

          {/* 30-Bars Coordinate Track Container */}
          <div className='relative h-48 sm:h-52 w-full pt-6 pb-6 px-1 flex items-end justify-between gap-1 sm:gap-1.5 border-b border-slate-200/80'>
            {/* Y-Axis Guide Lines */}
            <div className='absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 text-[9px] text-slate-400'>
              <div className='border-b border-dashed border-teal-200/60 flex justify-between'>
                <span>Tepat Waktu</span>
              </div>
              <div className='border-b border-dashed border-amber-200/60 flex justify-between'>
                <span>Terlambat</span>
              </div>
              <div className='border-b border-dashed border-rose-200/60 flex justify-between'>
                <span>Terlewat</span>
              </div>
              <div className='border-b border-slate-200 flex justify-between'>
                <span>Belum</span>
              </div>
            </div>

            {/* The 30 Pill-Shaped Discrete Bars */}
            {cycleDays.map(item => {
              const isSelected = item.dateStr === selectedDate;

              // Height and styling calculation for Opsi 2 Discrete Bar Chart
              let heightClass = 'h-[16%]';
              let barStyle = 'bg-slate-200/80 border border-slate-300/80 text-slate-400';

              if (item.status === 'ON_TIME') {
                heightClass = 'h-[95%]';
                barStyle =
                  'bg-gradient-to-t from-teal-600 to-teal-400 border border-teal-600 shadow-xs shadow-teal-500/20';
              } else if (item.status === 'LATE') {
                heightClass = 'h-[68%]';
                barStyle =
                  'bg-gradient-to-t from-amber-500 to-amber-400 border border-amber-500 shadow-xs shadow-amber-500/20';
              } else if (item.status === 'MISSED') {
                heightClass = 'h-[36%]';
                barStyle =
                  'bg-gradient-to-t from-rose-500 to-rose-400 border border-rose-500 shadow-xs shadow-rose-500/20';
              } else if (item.isToday) {
                heightClass = 'h-[50%]';
                barStyle =
                  'bg-orange-100 border-2 border-dashed border-orange-500 animate-pulse text-orange-600';
              }

              return (
                <div
                  key={item.dateStr}
                  className='relative flex-1 flex flex-col items-center justify-end h-full group z-10'
                >
                  {/* Today Pin Indicator */}
                  {item.isToday && (
                    <span className='absolute -top-5 text-[8px] font-extrabold px-1 rounded bg-orange-500 text-white shadow-2xs whitespace-nowrap animate-bounce'>
                      Hari Ini
                    </span>
                  )}

                  {/* The Bar */}
                  <button
                    type='button'
                    onClick={() => onSelectDate?.(item.dateStr)}
                    title={`Hari ${item.dayIndex} (${item.formattedDate}): ${
                      item.status === 'ON_TIME'
                        ? 'Tepat Waktu'
                        : item.status === 'LATE'
                          ? 'Terlambat'
                          : item.status === 'MISSED'
                            ? 'Terlewat'
                            : item.isToday
                              ? 'Hari Ini'
                              : 'Mendatang'
                    }`}
                    aria-label={`Hari ke-${item.dayIndex}`}
                    className={`w-full rounded-t-lg transition-all cursor-pointer ${heightClass} ${barStyle} ${
                      isSelected
                        ? 'ring-2 ring-teal-600 ring-offset-1 scale-110 z-20 brightness-110'
                        : 'hover:scale-105 hover:brightness-105'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Interval Labels (Every 5 Days: 1, 5, 10, 15, 20, 25, 30) */}
          <div className='flex justify-between pt-2 px-1 text-[10px] sm:text-xs font-bold text-slate-500'>
            <span>H-1</span>
            <span>H-5</span>
            <span>H-10</span>
            <span>H-15</span>
            <span>H-20</span>
            <span>H-25</span>
            <span>H-30</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legend & Summary Pill Badges */}
      <div className='pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2.5 text-xs'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800 font-bold'>
            <span className='w-2 h-2 rounded-full bg-teal-600' />
            {counts.onTime} Tepat Waktu
          </span>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 font-bold'>
            <span className='w-2 h-2 rounded-full bg-amber-500' />
            {counts.late} Terlambat
          </span>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 font-bold'>
            <span className='w-2 h-2 rounded-full bg-rose-500' />
            {counts.missed} Terlewat
          </span>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold'>
            <span className='w-2 h-2 rounded-full bg-slate-400' />
            {counts.future + counts.pending} Tersisa
          </span>
        </div>

        <div className='text-[11px] text-slate-500 font-medium flex items-center gap-1'>
          <ShieldCheck size={14} className='text-teal-600' />
          <span>
            Kepatuhan Siklus: <strong>{counts.adherenceRate}%</strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
