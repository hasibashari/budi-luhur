'use client';

import React, { useMemo } from 'react';
import { ShieldCheck, CalendarCheck, Activity, Award } from 'lucide-react';
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
      {/* Monthly Chart Component */}
      <ConsumptionChart data={trend} totalCount={metrics.totalCompleted} compliancePercent={metrics.adherenceRate} />

      {/* 4-Grid Responsive Milestone Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3.5'>
        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <ShieldCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Disiplin Kunjungan</span>
          <span className='text-sm sm:text-base font-bold text-slate-900'>
            {streakCount} {streakUnit}
          </span>
        </Card>

        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <CalendarCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>
            Aktivitas Terverifikasi
          </span>
          <span className='text-sm sm:text-base font-bold text-slate-900'>
            {metrics.totalCompleted} Sesi
          </span>
        </Card>

        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Activity size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Kadar Hb Darah</span>
          <span className={`text-sm sm:text-base font-bold ${hbLevel ? 'text-emerald-700' : 'text-slate-500'}`}>
            {hbLevel ? `${hbLevel} g/dL` : 'Belum Tes'}
          </span>
        </Card>

        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Award size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Status Kesiapan</span>
          <span className='text-sm sm:text-base font-bold text-emerald-700'>
            {riskLevel === 'Rendah' ? 'Optimal (Siap Nikah)' : 'Perlu Pendampingan'}
          </span>
        </Card>
      </div>
    </div>
  );
}

export default MonthlyEvaluationView;
