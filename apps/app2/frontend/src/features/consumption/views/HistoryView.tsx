'use client';

import React, { useState, useMemo } from 'react';
import { CalendarCheck, Flame, Activity } from 'lucide-react';
import { StreakProgressCard } from '@/src/shared/components/domain/StreakProgressCard';
import { useAuth } from '@/src/features/auth/context/AuthContext';
import { useMonitoringData } from '../hooks/useMonitoringData';
import {
  DateFilterBar,
  DateFilterPreset,
  StatusFilterOption,
  ActiveDateActionCard,
  ConsumptionLogList,
  MonthlyEvaluationView,
} from '../components';
import { getTodayDateString, formatShortDate } from '../utils/dateHelpers';

type MonitoringViewMode = 'timeline' | 'evaluation';

export default function HistoryView() {
  const { user } = useAuth();
  const userId = user?.id || 'usr_1';

  // Navigation mode: Timeline or Evaluation
  const [viewMode, setViewMode] = useState<MonitoringViewMode>('timeline');

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
    return allLogs.filter(log => {
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
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#e11d48]' />
      </div>
    );
  }

  const streakCount = dashboardData?.user.streakCount || 0;
  const streakUnit = dashboardData?.user.streakUnit || 'Minggu';
  const consecutiveDates = dashboardData?.user.consecutiveDates || [];

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full pb-8'>
      {/* 1. Header & Title Banner */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-[#1e293b] tracking-tight'>
            Monitoring Kepatuhan TTD 🌸
          </h2>
          <p className='text-xs sm:text-sm text-[#64748b] mt-0.5'>
            Riwayat konsumsi TTD dan evaluasi kepatuhan
          </p>
        </div>

        {/* Live Dynamic Streak Counter Badge */}
        <div className='inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#fce7f3] shadow-2xs self-start sm:self-auto'>
          <Flame size={18} className='text-amber-500 fill-amber-500' />
          <span className='text-xs font-bold text-[#1e293b]'>
            {streakCount} {streakUnit} Streak
          </span>
        </div>
      </div>

      {/* 2. Dynamic Streak Progress Card (Live Milestone Tracker) */}
      <StreakProgressCard
        streakCount={streakCount}
        streakUnit={streakUnit}
        consecutiveDates={consecutiveDates}
        todayStatus={dashboardData?.todayStatus || 'pending'}
        showDetailsLink={false}
      />

      {/* 3. View Mode Switcher: Timeline vs Evaluasi Bulanan */}
      <div className='flex items-center p-1 bg-white rounded-2xl border border-[#fce7f3] shadow-xs max-w-sm'>
        <button
          type='button'
          onClick={() => setViewMode('timeline')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === 'timeline'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          <CalendarCheck size={14} />
          <span>Riwayat & Filter</span>
        </button>
        <button
          type='button'
          onClick={() => setViewMode('evaluation')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            viewMode === 'evaluation'
              ? 'bg-[#e11d48] text-white shadow-sm shadow-rose-500/20'
              : 'text-[#64748b] hover:text-[#e11d48]'
          }`}
        >
          <Activity size={14} />
          <span>Grafik Evaluasi</span>
        </button>
      </div>

      {/* VIEW MODE 1: TIMELINE WITH DATE FILTER & ACTION CARDS */}
      {viewMode === 'timeline' && (
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
      )}

      {/* VIEW MODE 2: MONTHLY EVALUATION CHART & MILESTONE METRICS */}
      {viewMode === 'evaluation' && (
        <MonthlyEvaluationView
          stats={stats}
          streakCount={streakCount}
          streakUnit={streakUnit}
          hbLevel={dashboardData?.user.hbLevel}
          riskLevel={dashboardData?.user.riskLevel}
        />
      )}
    </div>
  );
}
