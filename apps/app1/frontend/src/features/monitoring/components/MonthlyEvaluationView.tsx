'use client';

import React, { useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Grid,
  CalendarDays,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { ConsumptionChart } from '@/src/shared/components/domain/ConsumptionChart';
import { Card } from '@/src/shared/components/ui/Card';
import { ConsumptionLog, ConsumptionStats } from '../types';
import { calculateWeeklyAdherence } from '../utils/weeklyAdherence';

export interface MonthlyEvaluationViewProps {
  stats: ConsumptionStats | null;
  streakCount: number;
  streakUnit: string;
  hbLevel?: number | null;
  riskLevel?: string | null;
  logs: ConsumptionLog[];
  selectedYear?: number;
  selectedMonthIndex?: number;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onSelectCurrentMonth?: () => void;
  onSwitchToYearView?: () => void;
  showNavigation?: boolean;
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

function buildTrend(logs: ConsumptionLog[]) {
  const byDate = new Map<string, { completed: number; scheduled: number }>();
  logs.forEach(log => {
    const current = byDate.get(log.scheduledDate) || { completed: 0, scheduled: 0 };
    current.scheduled += 1;
    if (log.status === 'ON_TIME' || log.status === 'LATE') current.completed += 1;
    byDate.set(log.scheduledDate, current);
  });
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, item]) => ({
      label: date.slice(5),
      ...item,
      completionRate: Math.round((item.completed / item.scheduled) * 100),
    }));
}

export function MonthlyEvaluationView({
  stats,
  logs,
  selectedYear,
  selectedMonthIndex,
  onPrevMonth,
  onNextMonth,
  onSelectCurrentMonth,
  onSwitchToYearView,
  showNavigation = true,
}: MonthlyEvaluationViewProps) {
  const now = useMemo(() => new Date(), []);
  const actualCurrentYear = now.getFullYear();
  const actualCurrentMonthIndex = now.getMonth();

  const isCurrentMonthActive =
    selectedYear === actualCurrentYear && selectedMonthIndex === actualCurrentMonthIndex;

  const currentYear = selectedYear ?? actualCurrentYear;
  const currentMonthIdx = selectedMonthIndex ?? actualCurrentMonthIndex;
  const currentMonthName = MONTH_NAMES_ID[currentMonthIdx] || 'Bulan';

  // Construct target reference date string (15th of the selected month) for calculating weekly adherence
  const referenceDateStr = useMemo(() => {
    const mm = String(currentMonthIdx + 1).padStart(2, '0');
    return `${currentYear}-${mm}-15`;
  }, [currentYear, currentMonthIdx]);

  // Filter logs for the selected month
  const monthLogs = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;
    return logs.filter(log => log.scheduledDate?.startsWith(prefix));
  }, [logs, currentYear, currentMonthIdx]);

  const trend = useMemo(
    () => buildTrend(monthLogs.length > 0 ? monthLogs : logs),
    [monthLogs, logs]
  );

  const weeklyData = useMemo(
    () => calculateWeeklyAdherence(logs, referenceDateStr),
    [logs, referenceDateStr]
  );

  const metrics = useMemo(() => {
    const completedInMonth = monthLogs.filter(
      log => log.status === 'ON_TIME' || log.status === 'LATE'
    ).length;
    const missedInMonth = monthLogs.filter(
      log => log.status === 'MISSED' || log.status === 'SKIPPED'
    ).length;
    const targetDoses =
      weeklyData[0]?.targetDoses || (weeklyData.length > 0 ? weeklyData.length : 4);
    const adherenceRate =
      targetDoses > 0
        ? Math.min(100, Math.round((completedInMonth / targetDoses) * 100))
        : 0;

    return {
      completedInMonth,
      missedInMonth,
      targetDoses,
      adherenceRate,
    };
  }, [monthLogs, weeklyData]);

  return (
    <div className='flex flex-col gap-4 animate-fade-in'>
      {/* 1. Month Navigation Toolbar */}
      {showNavigation && selectedYear !== undefined && selectedMonthIndex !== undefined && (
        <Card padding='sm' className='border-[#F0DFE7] bg-white shadow-2xs'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
            {/* Left: Previous / Next Month Navigator */}
            <div className='flex items-center gap-2'>
              <div className='flex items-center bg-[#FAF6F8] p-1 rounded-xl border border-[#F0DFE7]'>
                <button
                  type='button'
                  onClick={onPrevMonth}
                  className='p-1.5 rounded-lg text-[#525866] hover:text-[#B8285F] hover:bg-white transition-colors cursor-pointer'
                  title='Bulan Sebelumnya'
                  aria-label='Bulan Sebelumnya'
                >
                  <ChevronLeft size={18} />
                </button>
                <div className='px-3.5 py-0.5 text-center min-w-[130px]'>
                  <span className='font-bold text-sm sm:text-base text-[#1E1F24] block leading-tight'>
                    {currentMonthName} {currentYear}
                  </span>
                  <span className='text-[10px] text-[#525866] font-medium leading-none'>
                    Evaluasi 4-5 Pekan
                  </span>
                </div>
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

              {!isCurrentMonthActive && onSelectCurrentMonth && (
                <button
                  type='button'
                  onClick={onSelectCurrentMonth}
                  className='inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#861A43] bg-[#FAF0F4] hover:bg-[#FCE7F0] border border-[#F7CADF] rounded-xl transition-colors cursor-pointer'
                >
                  <RotateCcw size={12} />
                  <span>Bulan Ini</span>
                </button>
              )}
            </div>

            {/* Right: Quick Month Status Badge & Switch to Year View */}
            <div className='flex items-center gap-2 flex-wrap'>
              <div className='flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF0F4] border border-[#F7CADF] text-xs'>
                <span className='font-semibold text-[#861A43]'>
                  {metrics.completedInMonth}/{metrics.targetDoses} Tablet Selesai
                </span>
                <span className='w-1 h-1 rounded-full bg-[#861A43]/40' />
                <span className='font-bold text-[#B8285F]'>
                  {metrics.adherenceRate}% Kepatuhan
                </span>
              </div>

              {onSwitchToYearView && (
                <button
                  type='button'
                  onClick={onSwitchToYearView}
                  className='inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#525866] hover:text-[#B8285F] hover:bg-[#FAF6F8] border border-[#E2E6EE] hover:border-[#F0DFE7] rounded-xl transition-all cursor-pointer'
                  title='Buka Kalender 1 Tahun Penuh'
                >
                  <Grid size={13} className='text-[#B8285F]' />
                  <span>Lihat 1 Tahun</span>
                </button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* 2. Monthly Bar Chart Component with Weekly Adherence Points */}
      <ConsumptionChart
        data={trend}
        weeklyData={weeklyData}
        totalCount={metrics.completedInMonth}
        compliancePercent={metrics.adherenceRate}
      />
    </div>
  );
}

export default MonthlyEvaluationView;
