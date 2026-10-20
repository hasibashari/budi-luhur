'use client';

import React, { useMemo } from 'react';
import { Flame, CalendarCheck, Activity, Sparkles } from 'lucide-react';
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
  hbLevel,
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
        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Flame size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>Streak Kepatuhan</span>
          <span className='text-sm sm:text-base font-extrabold text-[#e11d48]'>
            {streakCount} {streakUnit}
          </span>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <CalendarCheck size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>
            Total Tablet Diminum
          </span>
          <span className='text-sm sm:text-base font-extrabold text-[#1e293b]'>
            {metrics.totalCompleted} Tablet
          </span>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Activity size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>Kadar Hb</span>
          <span className={`text-sm sm:text-base font-extrabold ${hbLevel ? 'text-[#10b981]' : 'text-slate-500'}`}>
            {hbLevel ? `${hbLevel} g/dL` : 'Belum Tes'}
          </span>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Sparkles size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>Status Kebugaran</span>
          <span className='text-sm sm:text-base font-extrabold text-[#9333ea]'>
            {riskLevel === 'Rendah' ? 'Bebas Anemia' : 'Perlu Pendampingan'}
          </span>
        </Card>
      </div>
    </div>
  );
}
