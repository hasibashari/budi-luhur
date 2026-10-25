'use client';

import { useMemo } from 'react';
import { Flame, CalendarCheck } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { PillComplianceChart } from './PillComplianceChart';
import { ActivityDateInfo } from '../api/consumptionRepository';
import { ConsumptionLog, ConsumptionStats } from '../types';

export interface MonthlyEvaluationViewProps {
  stats: ConsumptionStats | null;
  streakCount: number;
  streakUnit: string;
  hbLevel?: number | null;
  riskLevel?: string | null;
  logs: ConsumptionLog[];
  activityMap?: Record<string, ActivityDateInfo>;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
  todayStr?: string;
}

export function MonthlyEvaluationView({
  stats,
  streakCount,
  streakUnit,
  logs,
  activityMap,
  selectedDate,
  onSelectDate,
  todayStr,
}: MonthlyEvaluationViewProps) {
  // Compute adherence and totals for the current cycle
  const metrics = useMemo(() => {
    const completedFromLogs = logs.filter(
      log => log.status === 'ON_TIME' || log.status === 'LATE',
    ).length;
    const adherenceRate =
      stats?.adherenceRate ??
      (logs.length > 0 ? Math.round((completedFromLogs / logs.length) * 100) : 100);

    return {
      totalCompleted: stats?.totalCompleted ?? completedFromLogs,
      adherenceRate,
      onTimeCount: stats?.totalOnTime ?? logs.filter(l => l.status === 'ON_TIME').length,
      missedCount:
        stats?.totalMissed ??
        logs.filter(l => l.status === 'MISSED' || l.status === 'SKIPPED').length,
    };
  }, [logs, stats]);

  return (
    <div className='flex flex-col gap-5 animate-fade-in'>
      {/* 1. 30-Day Pill Compliance Status Bar Chart */}
      <PillComplianceChart
        logs={logs}
        activityMap={activityMap}
        stats={stats}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        todayStr={todayStr}
      />

      {/* 2. Responsive Milestone KPI Cards (2 Cards) */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3.5'>
        {/* Card 1: Streak Disiplin */}
        <Card
          padding='md'
          className='relative overflow-hidden border-slate-200/80 shadow-xs bg-white hover:border-orange-200 transition-all flex flex-col justify-between'
        >
          <div>
            <div className='flex items-center justify-between mb-2.5'>
              <div className='w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-100 shadow-2xs'>
                <Flame size={18} className='animate-pulse' />
              </div>
              <span className='text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200/80'>
                {streakCount >= 7 ? 'Konsisten' : 'Mulai Rutin'}
              </span>
            </div>
            <span className='text-[11px] text-slate-500 block font-medium'>Streak Kepatuhan</span>
            <span className='text-base sm:text-lg font-extrabold text-slate-900'>
              {streakCount} {streakUnit}
            </span>
          </div>
          <span className='text-[10px] text-slate-400 mt-2 block font-normal border-t border-slate-100 pt-1.5'>
            {streakCount > 0 ? `${streakCount} hari tanpa jeda` : 'Mulai catat hari ini'}
          </span>
        </Card>

        {/* Card 2: Total Pil Diminum */}
        <Card
          padding='md'
          className='relative overflow-hidden border-slate-200/80 shadow-xs bg-white hover:border-teal-200 transition-all flex flex-col justify-between'
        >
          <div>
            <div className='flex items-center justify-between mb-2.5'>
              <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-2xs'>
                <CalendarCheck size={18} />
              </div>
              <span className='text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/80'>
                {metrics.totalCompleted}/30 Pil
              </span>
            </div>
            <span className='text-[11px] text-slate-500 block font-medium'>Total Pil Diminum</span>
            <span className='text-base sm:text-lg font-extrabold text-slate-900'>
              {metrics.totalCompleted} Butir
            </span>
          </div>
          {/* Mini Progress Bar */}
          <div className='mt-2 border-t border-slate-100 pt-1.5'>
            <div className='w-full h-1.5 bg-slate-100 rounded-full overflow-hidden'>
              <div
                className='h-full bg-teal-600 rounded-full transition-all duration-500'
                style={{
                  width: `${Math.min(100, Math.round((metrics.totalCompleted / 30) * 100))}%`,
                }}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
