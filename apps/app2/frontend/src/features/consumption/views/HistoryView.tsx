import { useState, useMemo  } from 'react';
import { Link } from 'react-router-dom';
import { Flame, CalendarClock, Clock, ArrowRight } from 'lucide-react';
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

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setDateFilterPreset('CUSTOM');
  };

  // Unified PostgreSQL data fetching & realtime mutations hook
  const { dashboardData, activityMap, allLogs, stats, loading, isUpdatingDate, updateDateStatus } =
    useMonitoringData(userId);

  const hasActiveSchedule = Boolean(
    dashboardData?.activeSchedule && dashboardData.activeSchedule.isEnabled,
  );
  const activeScheduleId = dashboardData?.activeSchedule?.id;
  const scheduleStartDate = dashboardData?.activeSchedule?.startDate;

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
      if (dateFilterPreset === 'CUSTOM' && log.scheduledDate !== selectedDate) return false;
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
    if (dateFilterPreset === '30_DAYS') return '30 hari terakhir';
    if (dateFilterPreset === 'CUSTOM') return `Catatan tanggal ${formatShortDate(selectedDate)}`;
    return `Filter ${dateFilterPreset}`;
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
            {hasActiveSchedule ? `${streakCount} ${streakUnit} Disiplin` : 'Siap Memulai'}
          </span>
        </div>
      </div>

      {/* 2. Setup Prompt Banner when schedule has not been created */}
      {!hasActiveSchedule && (
        <div className='p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-50 via-teal-50/50 to-white border border-teal-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div className='flex items-start gap-3.5'>
            <div className='w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 shadow-2xs'>
              <CalendarClock size={22} />
            </div>
            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <h4 className='text-sm sm:text-base font-bold text-teal-950'>
                  Jadwal Pengingat Pil KB Belum Dikonfigurasi
                </h4>
                <span className='px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-100 text-teal-800 border border-teal-200'>
                  Langkah Awal
                </span>
              </div>
              <p className='text-xs text-slate-600 mt-1 leading-relaxed max-w-xl'>
                Tentukan jam minum pil harian Anda untuk mengaktifkan pelacakan <strong>Kalender Blister 28 Butir</strong> dan <strong>Grafik Kepatuhan</strong>.
              </p>
            </div>
          </div>
          <Link
            to='/user/schedule'
            className='inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-teal-600/20 shrink-0 self-start sm:self-auto'
          >
            <Clock size={15} />
            <span>Atur Jam Minum</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* 3. Visual Kemasan Fisik Blister Pack 28 Butir (4 baris x 7 butir) */}
      <FullBlisterPackCalendar
        activityMap={activityMap}
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        todayStr={todayStr}
        todayStatus={dashboardData?.todayStatus}
        hasActiveSchedule={hasActiveSchedule}
        startDate={scheduleStartDate}
      />

      <div className='flex flex-col gap-5 animate-fade-in'>
        {/* ACTIVE DATE QUICK ACTION CARD (Focused on Selected Date) */}
        {hasActiveSchedule && (
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

        <MonthlyEvaluationView
          stats={stats}
          streakCount={streakCount}
          streakUnit={streakUnit}
          riskLevel={dashboardData?.user.riskLevel}
          logs={allLogs}
          activityMap={activityMap}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          todayStr={todayStr}
          hasActiveSchedule={hasActiveSchedule}
          startDate={scheduleStartDate}
          activeScheduleId={activeScheduleId}
        />

        {/* COMPACT FILTER BAR WITH CALENDAR POPOVER */}
        <DateFilterBar
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
          dateFilterPreset={dateFilterPreset}
          onDateFilterPresetChange={setDateFilterPreset}
          activityMap={activityMap}
          todayStr={todayStr}
          todayStatus={dashboardData?.todayStatus}
        />

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
