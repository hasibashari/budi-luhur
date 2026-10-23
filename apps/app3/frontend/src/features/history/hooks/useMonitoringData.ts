'use client';

import { useState, useEffect, useCallback } from 'react';
import { publishRealtimeEvent, subscribeRealtimeEvent } from '@/src/shared/utils/realtimeSync';
import {
  getUserDashboardDataAction,
  UserDashboardData,
} from '@/src/features/user/api/userRepository';
import {
  getMonitoringSummaryAction,
  recordConsumptionForDateAction,
  ActivityDateInfo,
} from '../api/consumptionRepository';
import { ConsumptionLog, ConsumptionStats } from '../types';

export function useMonitoringData(userId: string) {
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [activityMap, setActivityMap] = useState<Record<string, ActivityDateInfo>>({});
  const [allLogs, setAllLogs] = useState<ConsumptionLog[]>([]);
  const [stats, setStats] = useState<ConsumptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);

  // Load all monitoring and adherence data from PostgreSQL
  const loadData = useCallback(async () => {
    try {
      const [dash, summary] = await Promise.all([
        getUserDashboardDataAction(userId),
        getMonitoringSummaryAction(userId),
      ]);

      setDashboardData(dash);
      setActivityMap(summary.activityMap);
      setAllLogs(summary.logs);
      setStats(summary.stats);
      setLoading(false);
    } catch (err) {
      console.error('Error loading monitoring data:', err);
      setLoading(false);
    }
  }, [userId]);

  // Initial load and realtime event subscription
  useEffect(() => {
    let isSubscribed = true;

    async function initMonitoring() {
      try {
        const [dash, summary] = await Promise.all([
          getUserDashboardDataAction(userId),
          getMonitoringSummaryAction(userId),
        ]);

        if (isSubscribed) {
          setDashboardData(dash);
          setActivityMap(summary.activityMap);
          setAllLogs(summary.logs);
          setStats(summary.stats);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading monitoring data:', err);
        if (isSubscribed) {
          setLoading(false);
        }
      }
    }

    initMonitoring();

    const unsubscribe = subscribeRealtimeEvent(event => {
      if (event.type === 'MEDICATION_TAKEN') {
        initMonitoring();
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [userId]);

  // Handle direct status change for a specific calendar date
  const updateDateStatus = async (
    targetDate: string,
    newStatus: 'recorded' | 'missed' | 'pending',
  ) => {
    setIsUpdatingDate(true);
    try {
      const res = await recordConsumptionForDateAction(userId, targetDate, newStatus);
      if (res.success) {
        await loadData();
        publishRealtimeEvent('MEDICATION_TAKEN', {
          patientId: userId,
          userId,
        });
      }
      return res;
    } catch (err) {
      console.error('Error updating status for date:', err);
      throw err;
    } finally {
      setIsUpdatingDate(false);
    }
  };

  return {
    dashboardData,
    activityMap,
    allLogs,
    stats,
    loading,
    isUpdatingDate,
    refreshData: loadData,
    updateDateStatus,
  };
}
