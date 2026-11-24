'use client';

import React, { useState, useMemo } from 'react';
import {
  Flame,
  Calendar as CalendarIcon,
  Grid,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
} from 'lucide-react';
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
  YearGridCalendar,
  MonthCalendarCard,
} from '../components';
import { getTodayDateString, formatShortDate } from '../utils/dateHelpers';

export type MonitoringViewMode = 'MONTHLY' | 'YEARLY';

export default function HistoryView() {
  const { user } = useAuth();
  const userId = user?.id || '';

  // Dual-view mode state: 'MONTHLY' (default: kalender bulan aktif + grafik kepatuhan) or 'YEARLY' (matriks 12 bulan)
  const [viewMode, setViewMode] = useState<MonitoringViewMode>('MONTHLY');

  // Month & Year state (defaults to current month and year)
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => getTodayDateString(), []);
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(today.getMonth());

  // Filter states
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [dateFilterPreset, setDateFilterPreset] = useState<DateFilterPreset>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('ALL');

  // Unified PostgreSQL data fetching & realtime mutations hook
  const { dashboardData, activityMap, allLogs, stats, loading, isUpdatingDate, updateDateStatus } =
    useMonitoringData(userId);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (selectedMonthIndex === 0) {
      setSelectedMonthIndex(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonthIndex === 11) {
      setSelectedMonthIndex(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonthIndex(prev => prev + 1);
    }
  };

  const handleSelectCurrentMonth = () => {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonthIndex(now.getMonth());
    setSelectedDate(todayStr);
    setDateFilterPreset('TODAY');
  };

  // Switch from Annual Grid directly into that month's detail
  const handleSelectMonthFromYear = (year: number, monthIdx: number) => {
    setSelectedYear(year);
    setSelectedMonthIndex(monthIdx);
    setViewMode('MONTHLY');
  };

  // Date selection directly from calendar (Monthly or Annual Grid)
  const handleSelectDateFromCalendar = (dateKey: string) => {
    setSelectedDate(dateKey);
    setDateFilterPreset('CUSTOM');
  };

  // Selected date details and status
  const selectedDateActivity = activityMap[selectedDate];
  const isSelectedDateToday = selectedDate === todayStr;
  const effectiveSelectedStatus = selectedDateActivity
    ? selectedDateActivity.status
    : isSelectedDateToday
      ? dashboardData?.todayStatus || 'pending'
      : 'pending';

  // Filtered log items based on viewMode, preset, and status filter
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      // In YEARLY view with ALL preset, filter by current selected year
      if (viewMode === 'YEARLY' && dateFilterPreset === 'ALL') {
        if (!log.scheduledDate?.startsWith(`${selectedYear}-`)) return false;
      }

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
      if (dateFilterPreset === '1_YEAR') {
        const logMs = new Date(log.scheduledDate).getTime();
        const nowMs = new Date(todayStr).getTime();
        if ((nowMs - logMs) / (1000 * 60 * 60 * 24) > 365) return false;
      }

      // 2. Status filter
      if (statusFilter === 'ON_TIME' && log.status !== 'ON_TIME' && log.status !== 'LATE')
        return false;
      if (statusFilter === 'MISSED' && log.status !== 'MISSED' && log.status !== 'SKIPPED')
        return false;

      return true;
    });
  }, [allLogs, dateFilterPreset, selectedDate, todayStr, statusFilter, viewMode, selectedYear]);

  // Label for log list header
  const filterLabel = useMemo(() => {
    if (dateFilterPreset === 'CUSTOM') return `Catatan tanggal ${formatShortDate(selectedDate)}`;
    if (dateFilterPreset === 'TODAY') return 'Catatan hari ini';
    if (viewMode === 'YEARLY') return `Semua catatan tahun ${selectedYear}`;
    if (dateFilterPreset === '1_YEAR') return 'Catatan 1 tahun terakhir (12 bulan)';
    if (dateFilterPreset === 'ALL') return 'Semua riwayat konsumsi';
    return `Filter ${dateFilterPreset.replace('_', ' ')}`;
  }, [dateFilterPreset, selectedDate, viewMode, selectedYear]);

  if (loading && !dashboardData) {
    return (
      <div className='flex items-center justify-center min-h-[50vh] w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#B8285F]' />
      </div>
    );
  }

  const streakCount = dashboardData?.user.streakCount || 0;
  const streakUnit = dashboardData?.user.streakUnit || 'Minggu';

  return (
    <div className='flex flex-col gap-5 sm:gap-6 w-full pb-8'>
      {/* 1. Header & Title Banner */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h2 className='text-xl sm:text-2xl font-extrabold text-[#1E1F24] tracking-tight'>
            Monitoring Kepatuhan TTD 🌸
          </h2>
          <p className='text-xs sm:text-sm text-[#525866] mt-0.5 leading-relaxed'>
            Pantau riwayat asupan tablet tambah darah mingguan, kalender aktivitas, dan grafik kepatuhan.
          </p>
        </div>

        {/* Live Dynamic Streak Counter Badge */}
        <div className='inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-[#F0DFE7] shadow-2xs self-start sm:self-auto'>
          <Flame size={18} className='text-amber-500 fill-amber-500' />
          <span className='text-xs font-bold text-[#1E1F24]'>
            {streakCount} {streakUnit} Streak
          </span>
        </div>
      </div>

      {/* 2. Dynamic Streak Progress Card (Live Milestone Tracker) */}
      <StreakProgressCard
        streakCount={streakCount}
        streakUnit={streakUnit}
        showDetailsLink={false}
      />

      {/* 3. Modern Dual-View Switcher: Bulanan & Tahunan */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-[#F0DFE7] shadow-2xs'>
        <div className='flex items-center bg-[#FAF6F8] p-1 rounded-xl border border-[#F0DFE7] gap-1 w-full sm:w-auto'>
          <button
            type='button'
            onClick={() => setViewMode('MONTHLY')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'MONTHLY'
                ? 'bg-[#B8285F] text-white shadow-xs'
                : 'text-[#525866] hover:text-[#1E1F24] hover:bg-white/60'
            }`}
          >
            <CalendarIcon size={15} />
            <span>Bulanan</span>
          </button>
          <button
            type='button'
            onClick={() => setViewMode('YEARLY')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'YEARLY'
                ? 'bg-[#B8285F] text-white shadow-xs'
                : 'text-[#525866] hover:text-[#1E1F24] hover:bg-white/60'
            }`}
          >
            <Grid size={15} />
            <span>Tahunan</span>
          </button>
        </div>

        {/* Subtitle / Mode Indicator */}
        <div className='px-2 text-xs text-[#525866] hidden sm:flex items-center gap-2'>
          {viewMode === 'MONTHLY' ? (
            <span>📅 Kalender &amp; grafik kepatuhan bulanan</span>
          ) : (
            <span>🗓️ Matriks 12 bulan &amp; target 52 tablet</span>
          )}
        </div>
      </div>

      {/* 4. VIEW CONTENT: CONDITIONAL RENDERING BASED ON VIEW MODE */}
      {viewMode === 'YEARLY' ? (
        /* ======================== 🗓️ TAHUNAN: MATRIKS 12 BULAN ======================== */
        <div className='flex flex-col gap-6 animate-fade-in'>
          {/* Year Activity Grid & 52-Week Progress Banner */}
          <YearGridCalendar
            currentYear={selectedYear}
            onYearChange={setSelectedYear}
            activityMap={activityMap}
            allLogs={allLogs}
            todayStr={todayStr}
            todayStatus={dashboardData?.todayStatus}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDateFromCalendar}
            onSelectMonth={handleSelectMonthFromYear}
          />

          {/* ACTIVE DATE ACTION CARD (Rendered directly under year grid when user clicks a specific date) */}
          {(dateFilterPreset === 'CUSTOM' || dateFilterPreset === 'TODAY') && (
            <div className='flex flex-col gap-2 animate-fade-in'>
              <div className='flex items-center justify-between px-1'>
                <span className='text-xs font-bold text-[#1E1F24] flex items-center gap-1.5'>
                  <Sparkles size={14} className='text-[#B8285F]' />
                  <span>Detail Tanggal Terpilih di Kalender</span>
                </span>
                <button
                  type='button'
                  onClick={() => setDateFilterPreset('ALL')}
                  className='text-xs font-semibold text-[#861A43] hover:underline cursor-pointer'
                >
                  Tutup Detail Tanggal
                </button>
              </div>

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
            </div>
          )}

          {/* LOG LIST FOR SELECTED YEAR / DATE */}
          <ConsumptionLogList
            logs={filteredLogs}
            filterLabel={filterLabel}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      ) : (
        /* ======================== 📅 BULANAN: KALENDER BULAN AKTIF & GRAFIK ======================== */
        <div className='flex flex-col gap-6 animate-fade-in'>
          {/* 1. KALENDER BULAN AKTIF (LANGSUNG TAMPIL SECARA DEFAULT) */}
          <MonthCalendarCard
            currentYear={selectedYear}
            currentMonthIndex={selectedMonthIndex}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectCurrentMonth={handleSelectCurrentMonth}
            activityMap={activityMap}
            todayStr={todayStr}
            todayStatus={dashboardData?.todayStatus}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDateFromCalendar}
            onSwitchToYearView={() => setViewMode('YEARLY')}
          />

          {/* 2. ACTIVE DATE ACTION CARD (For Today or Custom selected date) */}
          {(dateFilterPreset === 'CUSTOM' || dateFilterPreset === 'TODAY') && (
            <div className='flex flex-col gap-2 animate-fade-in'>
              <div className='flex items-center justify-between px-1'>
                <span className='text-xs font-bold text-[#1E1F24] flex items-center gap-1.5'>
                  <Sparkles size={14} className='text-[#B8285F]' />
                  <span>Detail Tanggal Terpilih di Kalender</span>
                </span>
                <button
                  type='button'
                  onClick={() => setDateFilterPreset('ALL')}
                  className='text-xs font-semibold text-[#861A43] hover:underline cursor-pointer'
                >
                  Tutup Detail Tanggal
                </button>
              </div>

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
            </div>
          )}

          {/* 3. GRAFIK EVALUASI BULANAN (TETAP ADA DI HISTORY BULANAN) */}
          <MonthlyEvaluationView
            stats={stats}
            streakCount={streakCount}
            streakUnit={streakUnit}
            hbLevel={dashboardData?.user.hbLevel}
            riskLevel={dashboardData?.user.riskLevel}
            logs={allLogs}
            selectedYear={selectedYear}
            selectedMonthIndex={selectedMonthIndex}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onSelectCurrentMonth={handleSelectCurrentMonth}
            onSwitchToYearView={() => setViewMode('YEARLY')}
            showNavigation={false}
          />

          {/* 4. FILTER BAR UNTUK DAFTAR CATATAN KONSUMSI */}
          <DateFilterBar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            dateFilterPreset={dateFilterPreset}
            onDateFilterPresetChange={setDateFilterPreset}
            activityMap={activityMap}
            todayStr={todayStr}
            todayStatus={dashboardData?.todayStatus}
            onSwitchToYearView={() => setViewMode('YEARLY')}
            showCalendarButton={false}
          />

          {/* 5. DAFTAR RIWAYAT KONSUMSI */}
          <ConsumptionLogList
            logs={filteredLogs}
            filterLabel={filterLabel}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      )}
    </div>
  );
}
