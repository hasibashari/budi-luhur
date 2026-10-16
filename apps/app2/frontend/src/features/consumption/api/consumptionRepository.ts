import apiClient from '@/src/shared/api/client';
import {
  ConsumptionLog,
  ConsumptionStats,
  ConsumptionStatus,
  DateRangeFilter,
  CategoryFilter,
  StatusFilter,
} from '../types';

export interface ActivityDateInfo {
  id: string;
  status: 'recorded' | 'missed' | 'pending';
  rawStatus: ConsumptionStatus;
  title: string;
  category: string;
  dosage?: string;
  scheduledDate: string;
  scheduledTime: string;
  takenAt?: string;
  notes?: string;
}

export async function getConsumptionLogsAction(
  range: DateRangeFilter = 'ALL',
  category: CategoryFilter = 'ALL',
  status: StatusFilter = 'ALL',
  _userId?: string,
  dateFilter?: string,
): Promise<ConsumptionLog[]> {
  const response = await apiClient.get<ConsumptionLog[]>('/consumption/history', {
    params: { range, category, status, dateFilter },
  });
  return response.data || [];
}

export async function getConsumptionStatsAction(_userId?: string): Promise<ConsumptionStats> {
  const response = await apiClient.get<ConsumptionStats>('/consumption/summary');
  return response.data;
}

export async function recordConsumptionAction(
  _userId: string,
  scheduleId: string,
  status: 'taken' | 'missed' | 'pending',
  notes?: string,
  scheduledDate?: string,
) {
  const normalizedStatus = status === 'taken' ? 'recorded' : status;
  const finalDate = scheduledDate || new Date().toISOString().split('T')[0];
  const response = await apiClient.post('/consumption/record', {
    scheduleId,
    status: normalizedStatus,
    notes,
    date: finalDate,
    targetDate: finalDate,
    scheduledDate: finalDate,
  });
  return response.data;
}

export async function getMonitoringSummaryAction(
  _userId?: string,
): Promise<{
  activityMap: Record<string, ActivityDateInfo>;
  logs: ConsumptionLog[];
  stats: ConsumptionStats;
}> {
  const [logs, stats] = await Promise.all([
    getConsumptionLogsAction('ALL', 'ALL', 'ALL'),
    getConsumptionStatsAction(),
  ]);

  const activityMap: Record<string, ActivityDateInfo> = {};
  logs.forEach(log => {
    const isCompleted = log.status === 'ON_TIME' || log.status === 'LATE';
    const isMissed = log.status === 'MISSED' || log.status === 'SKIPPED';
    const uiStatus: 'recorded' | 'missed' | 'pending' = isCompleted
      ? 'recorded'
      : isMissed
        ? 'missed'
        : 'pending';

    activityMap[log.scheduledDate] = {
      id: log.id,
      status: uiStatus,
      rawStatus: log.status,
      title: log.title,
      category: log.category,
      dosage: log.dosage,
      scheduledDate: log.scheduledDate,
      scheduledTime: log.scheduledTime,
      takenAt: log.takenAt,
      notes: log.notes,
    };
  });

  return { activityMap, logs, stats };
}

export async function recordConsumptionForDateAction(
  _userId: string,
  targetDate: string,
  status: 'recorded' | 'missed' | 'pending',
  notes?: string,
) {
  try {
    const finalDate = targetDate || new Date().toISOString().split('T')[0];
    const response = await apiClient.post('/consumption/record', {
      date: finalDate,
      targetDate: finalDate,
      scheduledDate: finalDate,
      status,
      notes,
    });
    return { success: true, ...response.data };
  } catch (err: any) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}
