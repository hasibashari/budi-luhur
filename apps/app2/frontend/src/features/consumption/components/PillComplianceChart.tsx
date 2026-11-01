import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { ConsumptionLog, ConsumptionStats } from '../types';
import { formatShortDate } from '../utils/dateHelpers';

export interface DayPillItem {
  dayIndex: number; // 1 to 28
  dateStr: string; // YYYY-MM-DD
  dayNumber: number; // 1 to 31
  formattedDate: string; // e.g. "25 Okt"
  dayName: string; // e.g. "Min"
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  isPlacebo: boolean; // Days 22-28 (pil pengingat / non-hormon)
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
  hasActiveSchedule?: boolean;
  startDate?: string;
  activeScheduleId?: string;
}

export function PillComplianceChart({
  logs,
  activityMap = {},
  stats,
  selectedDate,
  onSelectDate,
  todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }),
  hasActiveSchedule = true,
  startDate,
  activeScheduleId,
}: PillComplianceChartProps) {
  // Build the 28-day timeline items for the current active cycle
  const cycleDays = useMemo<DayPillItem[]>(() => {
    const anchorDateStr = selectedDate || todayStr;
    const todayMs = new Date(`${todayStr}T00:00:00`).getTime();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    // Determine the start date of the 28-day cycle
    let cycleStart: Date;

    if (startDate) {
      const startMs = new Date(`${startDate}T00:00:00`).getTime();
      const targetMs = new Date(`${anchorDateStr}T00:00:00`).getTime();
      const diffDays = Math.floor((targetMs - startMs) / 86400000);

      if (diffDays >= 0) {
        const cycleIndex = Math.floor(diffDays / 28);
        const cycleStartMs = startMs + cycleIndex * 28 * 86400000;
        cycleStart = new Date(cycleStartMs);
      } else {
        cycleStart = new Date(startMs);
      }
    } else {
      const anchor = new Date(`${anchorDateStr}T00:00:00`);
      const dayOfMonth = anchor.getDate();
      if (dayOfMonth <= 28) {
        cycleStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
      } else {
        cycleStart = new Date(anchor.getFullYear(), anchor.getMonth(), dayOfMonth - 27);
      }
    }

    const days: DayPillItem[] = [];

    for (let i = 0; i < 28; i++) {
      const d = new Date(cycleStart.getFullYear(), cycleStart.getMonth(), cycleStart.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayMs = d.getTime();
      const isToday = dateStr === todayStr;
      const isPast = dayMs < todayMs;
      const isFuture = dayMs > todayMs;
      const isPlacebo = i >= 21; // Days 22-28 (0-indexed 21..27) in 28 pack are reminder/placebo pills

      const activity = activityMap[dateStr];
      const matchingLog = logs.find(
        l =>
          l.scheduledDate === dateStr && (!activeScheduleId || l.reminderId === activeScheduleId),
      );

      let status: DayPillItem['status'] = 'FUTURE';

      // Jika tanggal sebelum jadwal aktif dibuat, tanggal ini bukan bagian dari siklus aktif saat ini
      if (startDate && dateStr < startDate) {
        status = 'FUTURE';
      } else if (activity) {
        if (activity.status === 'recorded') {
          status = activity.rawStatus === 'LATE' ? 'LATE' : 'ON_TIME';
        } else if (activity.status === 'missed') {
          status = 'MISSED';
        } else if (activity.status === 'pending') {
          status = isToday ? 'PENDING' : isPast ? 'MISSED' : 'PENDING';
        }
      } else if (matchingLog) {
        if (matchingLog.status === 'ON_TIME') status = 'ON_TIME';
        else if (matchingLog.status === 'LATE') status = 'LATE';
        else if (matchingLog.status === 'MISSED' || matchingLog.status === 'SKIPPED')
          status = 'MISSED';
        else if (isToday) status = 'PENDING';
        else if (isPast) status = 'MISSED';
      } else {
        if (!hasActiveSchedule) {
          status = 'FUTURE';
        } else if (isToday) {
          status = 'PENDING';
        } else if (isPast) {
          status = 'MISSED';
        } else {
          status = 'FUTURE';
        }
      }

      days.push({
        dayIndex: i + 1,
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
  }, [selectedDate, todayStr, activityMap, logs, hasActiveSchedule, startDate]);

  // Aggregate cycle metrics for 28 days
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
    const elapsedPills = onTime + late + missed;
    const adherenceRate =
      elapsedPills > 0
        ? Math.round((completed / elapsedPills) * 100)
        : (stats?.adherenceRate ?? 100);

    return {
      onTime,
      late,
      missed,
      pending,
      future,
      completed,
      elapsedPills,
      adherenceRate,
    };
  }, [cycleDays, stats]);

  const isChartActive = Boolean(hasActiveSchedule);

  if (!isChartActive) {
    return (
      <Card
        padding='lg'
        className='w-full border-2 border-dashed border-teal-200/90 bg-gradient-to-b from-teal-50/30 to-white text-center py-10 sm:py-12 rounded-3xl shadow-xs'
      >
        <div className='w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3.5 shadow-2xs'>
          <BarChart3 size={28} />
        </div>
        <h3 className='text-base sm:text-lg font-bold text-slate-900 tracking-tight'>
          Grafik Kepatuhan 28 Hari Belum Berjalan
        </h3>
        <p className='text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 mb-5 leading-relaxed'>
          Grafik 28 hari dan persentase kepatuhan akan aktif secara otomatis setelah Anda membuat
          jadwal pengingat minum pil KB harian.
        </p>
        <Link
          to='/user/schedule'
          className='inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-600/20'
        >
          <Clock size={15} />
          <span>Atur Pengingat Minum Pil Sekarang</span>
          <ArrowRight size={14} />
        </Link>
      </Card>
    );
  }

  return (
    <Card padding='md' className='w-full border-slate-200/90 shadow-xs bg-white overflow-visible'>
      {/* 1. Header with Title, Cycle Date Range Badge, and Protection Rate Badge */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-100'>
        <div>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='inline-flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-100'>
              <BarChart3 size={16} />
            </span>
            <h3 className='text-sm sm:text-base font-bold text-slate-900'>
              Grafik Status Kepatuhan Pil KB (28 Hari)
            </h3>
            {cycleDays[0] && cycleDays[27] && (
              <span className='text-[10px] sm:text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded-md'>
                {cycleDays[0].formattedDate} – {cycleDays[27].formattedDate}
              </span>
            )}
          </div>
          <p className='text-xs text-slate-500 mt-0.5'>
            Visualisasi 28 tablet status harian berdasarkan kepatuhan konsumsi obat aktual
          </p>
        </div>

        <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-bold self-start sm:self-auto'>
          <ShieldCheck size={14} className='text-teal-600 shrink-0' />
          <span>Kepatuhan Siklus: {counts.adherenceRate}%</span>
        </div>
      </div>

      {/* 2. Main 28-Day Discrete Status Bar Chart Area */}
      <div className='py-3.5'>
        <div className='rounded-2xl border border-slate-200/90 bg-slate-50/50 p-3 sm:p-5'>
          {/* Mobile Swipe / Interaction Hint */}
          <div className='flex items-center justify-between pb-2 sm:hidden text-[10px] text-teal-700 font-semibold'>
            <span>Geser horizontal untuk melihat 28 hari</span>
            <span aria-hidden='true'>→</span>
          </div>

          {/* Horizontally scrollable coordinate container for mobile touch usability */}
          <div
            data-testid='pill-chart-scroll-track'
            className='overflow-x-auto no-scrollbar -mx-1 px-1'
          >
            <div className='min-w-[540px] sm:min-w-0 w-full'>
              {/* Chart Coordinate Area: Left Y-Axis Labels + Right Bars Area */}
              <div className='flex gap-2 sm:gap-3 w-full'>
                {/* Y-Axis Column (Fixed width on the left, completely separated from bars) */}
                <div className='flex flex-col justify-between pt-7 sm:pt-8 pb-6 w-16 sm:w-20 text-[9px] sm:text-[10px] font-semibold shrink-0 text-slate-500 select-none'>
                  <div className='flex items-center gap-1 text-teal-700'>
                    <span className='w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0' />
                    <span className='truncate'>Tepat</span>
                  </div>
                  <div className='flex items-center gap-1 text-amber-700'>
                    <span className='w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0' />
                    <span className='truncate'>Terlambat</span>
                  </div>
                  <div className='flex items-center gap-1 text-rose-700'>
                    <span className='w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0' />
                    <span className='truncate'>Terlewat</span>
                  </div>
                  <div className='flex items-center gap-1 text-slate-400'>
                    <span className='w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0' />
                    <span className='truncate'>Belum</span>
                  </div>
                </div>

                {/* 28-Bars Coordinate Track Container */}
                <div className='relative flex-1 h-48 sm:h-52 pt-7 sm:pt-8 pb-6 px-1 flex items-end justify-between gap-1 sm:gap-1.5 border-b border-slate-200/80'>
                  {/* Y-Axis Guide Lines running across the track behind bars */}
                  <div className='absolute inset-0 flex flex-col justify-between pointer-events-none pt-7 sm:pt-8 pb-6'>
                    <div className='w-full border-b border-dashed border-teal-200/80' />
                    <div className='w-full border-b border-dashed border-amber-200/80' />
                    <div className='w-full border-b border-dashed border-rose-200/80' />
                    <div className='w-full border-b border-slate-200' />
                  </div>

                  {/* The 28 Pill-Shaped Discrete Bars */}
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
                          <span className='absolute -top-5 text-[8px] font-extrabold px-1 rounded bg-orange-500 text-white shadow-2xs whitespace-nowrap animate-bounce z-20'>
                            Hari Ini
                          </span>
                        )}

                        {/* The Bar */}
                        <button
                          type='button'
                          onClick={() => onSelectDate?.(item.dateStr)}
                          title={`Tablet ${item.dayIndex} (${item.formattedDate}): ${
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
                          aria-label={`Tablet ke-${item.dayIndex}`}
                          className={`w-full rounded-t-lg transition-all cursor-pointer ${heightClass} ${barStyle} ${
                            isSelected
                              ? 'ring-2 ring-teal-600 ring-offset-1 z-20 brightness-110'
                              : 'hover:brightness-105'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-Axis Interval Labels (Siklus 28 Hari / 4 Minggu: H-1, H-7, H-14, H-21, H-28) */}
              <div className='flex gap-2 sm:gap-3 w-full'>
                {/* Offset spacer matching Y-axis column width */}
                <div className='w-16 sm:w-20 shrink-0' />

                <div className='flex-1 flex justify-between pt-2 px-1 text-[10px] sm:text-xs font-bold text-slate-500'>
                  <span>H-1</span>
                  <span>H-7</span>
                  <span>H-14</span>
                  <span>H-21</span>
                  <span>H-28</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legend & Summary Pill Badges */}
      <div className='pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs'>
        <div className='grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto'>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200/80 text-teal-800 font-bold text-[11px] sm:text-xs justify-center sm:justify-start'>
            <span className='w-2 h-2 rounded-full bg-teal-600' />
            {counts.onTime} Tepat Waktu
          </span>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800 font-bold text-[11px] sm:text-xs justify-center sm:justify-start'>
            <span className='w-2 h-2 rounded-full bg-amber-500' />
            {counts.late} Terlambat
          </span>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-800 font-bold text-[11px] sm:text-xs justify-center sm:justify-start'>
            <span className='w-2 h-2 rounded-full bg-rose-500' />
            {counts.missed} Terlewat
          </span>
          <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] sm:text-xs justify-center sm:justify-start'>
            <span className='w-2 h-2 rounded-full bg-slate-400' />
            {counts.future + counts.pending} Tersisa
          </span>
        </div>

        <div className='text-[11px] text-slate-500 font-medium flex items-center gap-1 self-end sm:self-auto'>
          <ShieldCheck size={14} className='text-teal-600' />
          <span>
            Kepatuhan Siklus: <strong>{counts.adherenceRate}%</strong>
          </span>
        </div>
      </div>
    </Card>
  );
}
