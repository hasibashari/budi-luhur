'use client';

import { ConsumptionChart } from '@/src/shared/components/domain/ConsumptionChart';
import { ConsumptionLog, ConsumptionStats } from '../types';
import { calculateWeeklyAdherence } from '../utils/weeklyAdherence';
import { useMemo } from 'react';

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
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, item]) => ({
      label: date.slice(5),
      ...item,
      completionRate: Math.round((item.completed / item.scheduled) * 100),
    }));
}

export function MonthlyEvaluationView({ stats, logs }: MonthlyEvaluationViewProps) {
  const trend = useMemo(() => buildTrend(logs), [logs]);
  const weeklyData = useMemo(() => calculateWeeklyAdherence(logs), [logs]);

  const metrics = useMemo(() => {
    const completedFromLogs = logs.filter(
      log => log.status === 'ON_TIME' || log.status === 'LATE'
    ).length;
    const targetDoses = weeklyData[0]?.targetDoses || 4;
    return {
      totalCompleted: stats?.totalCompleted ?? completedFromLogs,
      adherenceRate:
        targetDoses > 0
          ? Math.min(100, Math.round((completedFromLogs / targetDoses) * 100))
          : 0,
    };
  }, [logs, stats, weeklyData]);

  return (
    <div className='flex flex-col gap-6 animate-fade-in'>
      {/* Monthly Bar Chart Component with Actual Weekly Data */}
      <ConsumptionChart
        data={trend}
        weeklyData={weeklyData}
        totalCount={metrics.totalCompleted}
        compliancePercent={metrics.adherenceRate}
      />
    </div>
  );
}
