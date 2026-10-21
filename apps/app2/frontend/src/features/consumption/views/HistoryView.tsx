'use client';

import React, { useState, useMemo } from 'react';
import { Flame } from 'lucide-react';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useMonitoringData } from '../hooks/useMonitoringData';
import {
  DateFilterBar,
  DateFilterPreset,
  StatusFilterOption,
  ActiveDateActionCard,
  ConsumptionLogList,
  MonthlyEvaluationView,
  FullBlisterPackCalendar,
} from '../components';
import { getTodayDateString, formatShortDate } from '../utils/dateHelpers';

export default function HistoryView() {
  const { user } = useAuth();
  const userId = user?.id || '';

  // Filter states
  const todayStr = useMemo(() => getTodayDateString(), []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateFilterPreset, setDateFilterPreset] = useState<DateFilterPreset>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('ALL');

  // Unified PostgreSQL data fetching & realtime mutations hook
  const {
    dashboardData,
    activityMap,
    allLogs,
    stats,
    loading,
    isUpdatingDate,
    updateDateStatus,
  } = useMonitoringData(userId);

  // Selected date details and status
  const selectedDateActivity = activityMap[selectedDate];
  const isSelectedDateToday = selectedDate === todayStr;
  const effectiveSelectedStatus = selectedDateActivity
    ? selectedDateActivity.status
    : isSelectedDateToday
      ? dashboardData?.todayStatus || 'pending'
      : 'pending';

  // Filtered log items based on selected preset and status filter
  const filteredLogs = useMemo(() => {
    return allLogs.filter((log) => {
      // 1. Date filter preset
      if (dateFilterPreset === 'TODAY' && log.scheduledDate !== todayStr) return false;
      if (dateFilterPreset === 'CUSTOM' && log.scheduledDate !== selectedDate) return false;
      if (dateFilterPreset === '7_DAYS') {
        const logMs = new Date(log.scheduledDate).getTime();
        const nowMs = new Date(todayStr).getTime();
        if ((nowMs - logMs) / (1000 * 60 * 60 * 24) > 7) return false;
      }
      if (dateFilterPreset === '30_DAYS') {
        const logMs = new Date(log.scheduledDate).getTime();
        const nowMs = new Date(todayStr).getTime();
        if ((nowMs - logMs) / (1000 * 60 * 60 * 24) > 30) return false;
      }

      // 2. Status filter
      if (statusFilter === 'ON_TIME' && log.status !== 'ON_TIME' && log.status !== 'LATE')
        return false;
      if (statusFilter === 'MISSED' && log.status !== 'MISSED' && log.status !== 'SKIPPED')
        return false;

      return true;
    });
  }, [allLogs, dateFilterPreset, selectedDate, todayStr, statusFilter]);

  // Label for log list header
  const filterLabel = useMemo(() => {
    if (dateFilterPreset === 'ALL') return 'Semua catatan';
    if (dateFilterPreset === 'TODAY') return 'Catatan hari ini';
    if (dateFilterPreset === 'CUSTOM') return `Catatan tanggal ${formatShortDate(selectedDate)}`;
    return `Filter ${dateFilterPreset.replace('_', ' ')}`;
  }, [dateFilterPreset, selectedDate]);

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600' />
      </div>
    );
  }

  const streakCount = dashboardData?.user.streakCount || 0;
  const streakUnit = dashboardData?.user.streakUnit || 'Hari';

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full pb-8'>
      {/* 1. Header & Title Banner */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight'>
            Kalender Blister & Monitoring Kepatuhan
          </h2>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Pantau riwayat 28 butir pil KB dan evaluasi efektivitas siklus kontrasepsi
          </p>
        </div>

        {/* Live Dynamic Streak Counter Badge */}
        <div className='inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-2xs self-start sm:self-auto'>
          <Flame size={18} className='text-orange-500 fill-orange-500' />
          <span className='text-xs font-bold text-slate-800'>
            {streakCount} {streakUnit} Disiplin
          </span>
        </div>
      </div>

      {/* 2. Visual Kemasan Fisik Blister Pack 28 Butir (4 baris x 7 butir) */}
      <FullBlisterPackCalendar
        activityMap={activityMap}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        todayStr={todayStr}
        todayStatus={dashboardData?.todayStatus}
      />

      <div className='flex flex-col gap-5 animate-fade-in'>
          {/* COMPACT FILTER BAR WITH CALENDAR POPOVER */}
          <DateFilterBar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dateFilterPreset={dateFilterPreset}
            onDateFilterPresetChange={setDateFilterPreset}
            activityMap={activityMap}
            todayStr={todayStr}
            todayStatus={dashboardData?.todayStatus}
          />

          <MonthlyEvaluationView
            stats={stats}
            streakCount={streakCount}
            streakUnit={streakUnit}
            hbLevel={dashboardData?.user.hbLevel}
            riskLevel={dashboardData?.user.riskLevel}
            logs={allLogs}
          />

          {/* ACTIVE DATE QUICK ACTION CARD */}
          {(dateFilterPreset === 'CUSTOM' || dateFilterPreset === 'TODAY') && (
            <ActiveDateActionCard
              selectedDate={selectedDate}
              isToday={isSelectedDateToday}
              activity={selectedDateActivity}
              effectiveStatus={effectiveSelectedStatus}
              fallbackTabletName={dashboardData?.activeSchedule?.tabletName}
              fallbackTime={dashboardData?.activeSchedule?.time}
              isUpdating={isUpdatingDate}
              onUpdateStatus={updateDateStatus}
            />
          )}

          {/* UNIFIED CONSUMPTION LOG LIST WITH STATUS FILTER DROPDOWN */}
          <ConsumptionLogList
            logs={filteredLogs}
            filterLabel={filterLabel}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
      </div>
    </div>
  );
}
