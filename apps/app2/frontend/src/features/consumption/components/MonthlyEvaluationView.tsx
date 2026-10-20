'use client';

import React, { useMemo } from 'react';
import { Flame, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ConsumptionChart } from '@/src/shared/components/domain/ConsumptionChart';
import { ConsumptionLog, ConsumptionStats } from '../types';

export interface MonthlyEvaluationViewProps {
  stats: ConsumptionStats | null;
  streakCount: number;
  streakUnit: string;
  hbLevel?: number | null;
  riskLevel?: string | null;
  logs: ConsumptionLog[];
}

function buildTrend(logs: ConsumptionLog[]) {
  const byDate = new Map<string, { completed: number; scheduled: number }>();
  logs.forEach(log => {
    const current = byDate.get(log.scheduledDate) || { completed: 0, scheduled: 0 };
    current.scheduled += 1;
    if (log.status === 'ON_TIME' || log.status === 'LATE') current.completed += 1;
    byDate.set(log.scheduledDate, current);
  });
  return [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([date, item]) => ({
    label: date.slice(5),
    ...item,
    completionRate: Math.round((item.completed / item.scheduled) * 100),
  }));
}

function getMetrics(stats: ConsumptionStats | null, logs: ConsumptionLog[]) {
  const completedFromLogs = logs.filter(log => log.status === 'ON_TIME' || log.status === 'LATE').length;
  return {
    totalCompleted: stats?.totalCompleted ?? completedFromLogs,
    adherenceRate:
      stats?.adherenceRate ??
      (logs.length > 0 ? Math.round((completedFromLogs / logs.length) * 100) : 0),
  };
}

export function MonthlyEvaluationView({
  stats,
  streakCount,
  streakUnit,
  riskLevel = 'Rendah',
  logs,
}: MonthlyEvaluationViewProps) {
  const trend = useMemo(() => buildTrend(logs), [logs]);
  const metrics = useMemo(() => getMetrics(stats, logs), [logs, stats]);
  return (
    <div className='flex flex-col gap-6 animate-fade-in'>
      {/* Monthly Bar Chart Component */}
      <ConsumptionChart data={trend} totalCount={metrics.totalCompleted} compliancePercent={metrics.adherenceRate} />

      {/* 4-Grid Responsive Milestone Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3.5'>
        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2 border border-orange-100'>
            <Flame size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Streak Kepatuhan</span>
          <span className='text-sm sm:text-base font-extrabold text-orange-600'>
            {streakCount} {streakUnit}
          </span>
        </Card>

        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 border border-teal-100'>
            <CalendarCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>
            Total Pil Diminum
          </span>
          <span className='text-sm sm:text-base font-extrabold text-slate-800'>
            {metrics.totalCompleted} Butir
          </span>
        </Card>

        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 border border-teal-100'>
            <ShieldCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Tingkat Proteksi</span>
          <span className='text-sm sm:text-base font-extrabold text-teal-700'>
            {metrics.adherenceRate >= 80 ? `Optimal (${metrics.adherenceRate}%)` : 'Perlu Konsistensi'}
          </span>
        </Card>

        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2 border border-slate-200'>
            <Sparkles size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Status Risiko Hamil</span>
          <span className='text-sm sm:text-base font-extrabold text-slate-800'>
            {riskLevel === 'Rendah' ? 'Sangat Rendah (<1%)' : 'Perlu Konsultasi Bidan'}
          </span>
        </Card>
      </div>
    </div>
  );
}
