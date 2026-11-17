import React, { useState, useMemo } from 'react';
import {
  Calendar,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pill,
  ArrowRight,
  Filter,
  CalendarDays,
  Sparkles,
  BarChart3,
  CalendarClock,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Link } from 'react-router-dom';
import { YearlyMonitoringData } from '../types';
import { Card } from '@/src/shared/components/ui/Card';
import { Badge } from '@/src/shared/components/ui/Badge';

export interface YearlyMonitoringViewProps {
  data: YearlyMonitoringData;
  loading?: boolean;
  isValidatorView?: boolean;
  studentName?: string;
}

export function YearlyMonitoringView({
  data,
  loading = false,
  isValidatorView = false,
  studentName,
}: YearlyMonitoringViewProps) {
  const [activeTab, setActiveTab] = useState<'historical' | 'plan'>('historical');
  const [selectedHistoricalMonth, setSelectedHistoricalMonth] = useState<string>('ALL');
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<string>('ALL');

  const { historical, plan } = data;
  const yearlySummary = historical.yearlySummary;

  // Filter historical logs by selected month
  const filteredHistoricalLogs = useMemo(() => {
    if (selectedHistoricalMonth === 'ALL') return historical.logs;
    return historical.logs.filter(log => log.scheduledDate.startsWith(selectedHistoricalMonth));
  }, [historical.logs, selectedHistoricalMonth]);

  // Filter planned upcoming dates by selected month
  const filteredUpcomingDates = useMemo(() => {
    if (selectedPlanMonth === 'ALL') return plan.upcomingDates;
    return plan.upcomingDates.filter(p => p.monthKey === selectedPlanMonth);
  }, [plan.upcomingDates, selectedPlanMonth]);

  // Chart data for historical 12 months
  const historicalChartData = useMemo(() => {
    return historical.monthlyBreakdown.map(m => ({
      name: m.shortLabel,
      fullMonth: m.monthName,
      diminum: m.takenCount,
      terlewat: m.missedCount,
      persentase: m.adherencePercentage,
    }));
  }, [historical.monthlyBreakdown]);

  // Chart data for plan 12 months
  const planChartData = useMemo(() => {
    return plan.monthlyBreakdown.map(m => ({
      name: m.shortLabel,
      fullMonth: m.monthName,
      rencanaDosis: m.plannedCount,
    }));
  }, [plan.monthlyBreakdown]);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-12 w-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600' />
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6 w-full animate-fade-in'>
      {/* 1. Header Banner & Mode Selector */}
      <div className='bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2 mb-1'>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-rose-50 text-rose-700 border border-rose-200'>
              Skala 1 Tahun Penuh 📅
            </span>
            {isValidatorView && studentName && (
              <span className='text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full'>
                Siswi: {studentName}
              </span>
            )}
          </div>
          <h3 className='text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight'>
            Monitoring Tahunan Kepatuhan Konsumsi TTD
          </h3>
          <p className='text-xs sm:text-sm text-slate-500 mt-0.5'>
            Evaluasi riwayat 12 bulan terakhir dan rencana jadwal konsumsi 12 bulan ke depan.
          </p>
        </div>

        {/* Tab Pills: Historical vs Plan */}
        <div className='flex items-center bg-slate-100 p-1 rounded-2xl shrink-0 self-start md:self-auto'>
          <button
            type='button'
            onClick={() => setActiveTab('historical')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'historical'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={16} />
            <span>Riwayat (1 Tahun Lalu)</span>
          </button>
          <button
            type='button'
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'plan'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarClock size={16} />
            <span>Rencana (1 Tahun Depan)</span>
          </button>
        </div>
      </div>

      {/* 2. TAB A: RIWAYAT 1 TAHUN KE BELAKANG */}
      {activeTab === 'historical' && (
        <div className='space-y-6 animate-fade-in'>
          {/* KPI Summary Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Card 1: Adherence Rate */}
            <div className='bg-white rounded-2xl p-5 border border-pink-100 shadow-sm'>
              <div className='flex items-center justify-between gap-2 mb-2'>
                <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                  Kepatuhan 1 Tahun
                </span>
                <TrendingUp size={18} className='text-rose-600' />
              </div>
              <div className='text-2xl sm:text-3xl font-extrabold text-slate-900'>
                {yearlySummary.adherencePercentage}%
              </div>
              <div className='mt-2'>
                <span
                  className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    yearlySummary.adherencePercentage >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : yearlySummary.adherencePercentage >= 60
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  Status: {yearlySummary.adherenceGrade}
                </span>
              </div>
            </div>

            {/* Card 2: Total Doses Taken */}
            <div className='bg-white rounded-2xl p-5 border border-pink-100 shadow-sm'>
              <div className='flex items-center justify-between gap-2 mb-2'>
                <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                  Tablet Diminum
                </span>
                <CheckCircle2 size={18} className='text-emerald-600' />
              </div>
              <div className='text-2xl sm:text-3xl font-extrabold text-emerald-700'>
                {yearlySummary.totalTaken} <span className='text-sm font-bold text-slate-500'>Dosis</span>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                Tercatat patuh diminum dalam 12 bulan terakhir.
              </p>
            </div>

            {/* Card 3: Total Missed */}
            <div className='bg-white rounded-2xl p-5 border border-pink-100 shadow-sm'>
              <div className='flex items-center justify-between gap-2 mb-2'>
                <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                  Tablet Terlewat
                </span>
                <AlertCircle size={18} className='text-amber-500' />
              </div>
              <div className='text-2xl sm:text-3xl font-extrabold text-amber-600'>
                {yearlySummary.totalMissed} <span className='text-sm font-bold text-slate-500'>Dosis</span>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                Jadwal yang terlewat / tidak diminum.
              </p>
            </div>

            {/* Card 4: Total Scheduled */}
            <div className='bg-white rounded-2xl p-5 border border-pink-100 shadow-sm'>
              <div className='flex items-center justify-between gap-2 mb-2'>
                <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                  Total Terjadwal
                </span>
                <Pill size={18} className='text-indigo-600' />
              </div>
              <div className='text-2xl sm:text-3xl font-extrabold text-slate-900'>
                {yearlySummary.totalScheduled} <span className='text-sm font-bold text-slate-500'>Dosis</span>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                Akumulasi kewajiban minum TTD 1 tahun.
              </p>
            </div>
          </div>

          {/* Historical 12 Months Adherence Trend Chart */}
          <div className='bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4'>
              <div>
                <h4 className='text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2'>
                  <BarChart3 size={18} className='text-rose-600' />
                  <span>Tren Kepatuhan Bulan ke Bulan (12 Bulan Terakhir)</span>
                </h4>
                <p className='text-xs text-slate-500 mt-0.5'>
                  Perbandingan dosis diminum tepat waktu vs terlewat setiap bulannya
                </p>
              </div>
            </div>

            <div className='h-64 sm:h-72 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={historicalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      name === 'diminum'
                        ? `${val} Dosis Diminum`
                        : `${val} Dosis Terlewat`,
                      name === 'diminum' ? 'Diminum' : 'Terlewat',
                    ]}
                    labelFormatter={(label, items) => {
                      const item = items?.[0]?.payload;
                      return item?.fullMonth || label;
                    }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #fce7f3',
                      fontSize: '12px',
                    }}
                  />
                  <Legend
                    verticalAlign='top'
                    height={36}
                    formatter={val => (val === 'diminum' ? 'Dosis Diminum' : 'Dosis Terlewat')}
                  />
                  <Bar dataKey='diminum' fill='#e11d48' radius={[6, 6, 0, 0]} name='diminum' />
                  <Bar dataKey='terlewat' fill='#f59e0b' radius={[6, 6, 0, 0]} name='terlewat' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Recapitulation Cards Grid */}
          <div className='bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm'>
            <h4 className='text-sm sm:text-base font-bold text-slate-800 mb-3 flex items-center gap-2'>
              <CalendarDays size={18} className='text-rose-600' />
              <span>Rekapitulasi Kepatuhan Per Bulan (12 Bulan Terakhir)</span>
            </h4>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3'>
              {historical.monthlyBreakdown.map(m => {
                const isOptimal = m.adherencePercentage >= 80;
                const isModerate = m.adherencePercentage >= 50 && m.adherencePercentage < 80;

                return (
                  <div
                    key={m.monthKey}
                    className={`p-3.5 rounded-2xl border text-center transition-all ${
                      m.totalScheduled === 0
                        ? 'bg-slate-50 border-slate-100 opacity-70'
                        : isOptimal
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : isModerate
                            ? 'bg-amber-50/50 border-amber-200'
                            : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <p className='text-xs font-bold text-slate-700 truncate'>{m.monthName}</p>
                    <div className='text-lg font-black mt-1 text-slate-900'>
                      {m.totalScheduled > 0 ? `${m.adherencePercentage}%` : '-'}
                    </div>
                    <div className='flex items-center justify-center gap-1.5 mt-1.5 text-[10px] text-slate-500 font-semibold'>
                      <span className='text-emerald-700'>{m.takenCount} diminum</span>
                      <span>•</span>
                      <span className='text-amber-700'>{m.missedCount} lewat</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Historical Logs Table with Month Filter */}
          <div className='bg-white rounded-3xl p-5 sm:p-6 border border-pink-100 shadow-sm'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
              <div>
                <h4 className='text-sm sm:text-base font-bold text-slate-800'>
                  Catatan Riwayat Konsumsi TTD (1 Tahun Terakhir)
                </h4>
                <p className='text-xs text-slate-500'>
                  Daftar seluruh tanggal, status minum, dan catatan konsumsi
                </p>
              </div>

              {/* Month Selector Filter */}
              <div className='flex items-center gap-2'>
                <Filter size={15} className='text-slate-400' />
                <select
                  value={selectedHistoricalMonth}
                  onChange={e => setSelectedHistoricalMonth(e.target.value)}
                  className='px-3 py-1.5 bg-slate-50 border border-pink-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer'
                >
                  <option value='ALL'>Semua Bulan (1 Tahun)</option>
                  {historical.monthlyBreakdown.map(m => (
                    <option key={m.monthKey} value={m.monthKey}>
                      {m.monthName} ({m.takenCount} diminum)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredHistoricalLogs.length === 0 ? (
              <div className='py-8 text-center text-slate-400 text-xs sm:text-sm font-medium'>
                Belum ada catatan konsumsi pada periode bulan yang dipilih.
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='border-b border-pink-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                      <th className='py-3 px-3'>Tanggal</th>
                      <th className='py-3 px-3'>Jadwal / Waktu Minum</th>
                      <th className='py-3 px-3'>Dosis & Suplemen</th>
                      <th className='py-3 px-3'>Status Kepatuhan</th>
                      <th className='py-3 px-3'>Catatan</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-pink-50/70 text-xs'>
                    {filteredHistoricalLogs.map(log => {
                      const isTaken = log.status === 'ON_TIME' || log.status === 'LATE';
                      const isMissed = log.status === 'MISSED' || log.status === 'SKIPPED';

                      return (
                        <tr key={log.id} className='hover:bg-rose-50/30 transition-colors'>
                          <td className='py-3 px-3 font-semibold text-slate-800 whitespace-nowrap'>
                            {log.scheduledDate}
                          </td>
                          <td className='py-3 px-3 text-slate-600 whitespace-nowrap'>
                            {log.takenAt ? (
                              <span className='font-bold text-emerald-700'>
                                Diminum: {log.takenAt}
                              </span>
                            ) : (
                              <span>Jadwal: {log.scheduledTime} WIB</span>
                            )}
                          </td>
                          <td className='py-3 px-3 text-slate-700 font-medium whitespace-nowrap'>
                            {log.title} ({log.dosage || '1 Tablet'})
                          </td>
                          <td className='py-3 px-3 whitespace-nowrap'>
                            {isTaken ? (
                              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200'>
                                <CheckCircle2 size={13} />
                                {log.status === 'ON_TIME' ? 'Patuh (Tepat Waktu)' : 'Diminum (Terlambat)'}
                              </span>
                            ) : isMissed ? (
                              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200'>
                                <AlertCircle size={13} />
                                Terlewat
                              </span>
                            ) : (
                              <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600'>
                                <Clock size={13} />
                                Belum Terisi
                              </span>
                            )}
                          </td>
                          <td className='py-3 px-3 text-slate-500 italic max-w-xs truncate'>
                            {log.notes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB B: RENCANA 1 TAHUN KE DEPAN */}
      {activeTab === 'plan' && (
        <div className='space-y-6 animate-fade-in'>
          {/* Active Schedule Information Card */}
          <div className='bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-md'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div>
                <span className='inline-block text-[11px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full mb-2'>
                  JADWAL PENGINGAT AKTIF 🔔
                </span>
                <h4 className='text-lg sm:text-xl font-black text-white'>
                  {plan.scheduleInfo?.tabletName || 'Tablet Tambah Darah (TTD)'}
                </h4>
                <p className='text-xs sm:text-sm text-indigo-100 mt-1 max-w-xl'>
                  {plan.scheduleInfo
                    ? `Dijadwalkan setiap ${plan.scheduleInfo.frequency.toLowerCase()} pada hari ${plan.scheduleInfo.dayOfWeek} pukul ${plan.scheduleInfo.time} WIB (${plan.scheduleInfo.dosage}).`
                    : 'Belum ada jadwal pengingat yang diaktifkan.'}
                </p>
                {plan.scheduleInfo?.instructions && (
                  <p className='text-xs text-indigo-200 mt-2 bg-white/10 p-2.5 rounded-xl backdrop-blur-xs'>
                    💡 {plan.scheduleInfo.instructions}
                  </p>
                )}
              </div>

              {!isValidatorView && (
                <Link
                  to='/user/schedule'
                  className='inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-sm shrink-0'
                >
                  <span>Sesuaikan Jadwal</span>
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>

          {/* Forward Plan KPI Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div className='bg-white rounded-2xl p-5 border border-purple-100 shadow-sm'>
              <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                Total Dosis Direncanakan
              </span>
              <div className='text-2xl sm:text-3xl font-extrabold text-indigo-700 mt-1'>
                {plan.totalPlannedDoses} <span className='text-sm font-bold text-slate-500'>Dosis</span>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                Target konsumsi TTD dalam 12 bulan mendatang.
              </p>
            </div>

            <div className='bg-white rounded-2xl p-5 border border-purple-100 shadow-sm'>
              <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                Frekuensi Konsumsi
              </span>
              <div className='text-xl sm:text-2xl font-extrabold text-slate-800 mt-1'>
                {plan.scheduleInfo?.frequency || '1x Seminggu'}
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                Hari {plan.scheduleInfo?.dayOfWeek || 'Sabtu'} pukul {plan.scheduleInfo?.time || '20:00'} WIB.
              </p>
            </div>

            <div className='bg-white rounded-2xl p-5 border border-purple-100 shadow-sm'>
              <span className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                Status Penyesuaian
              </span>
              <div className='text-lg font-bold text-emerald-600 mt-1 flex items-center gap-1.5'>
                <CheckCircle2 size={18} />
                <span>Otomatis Sinkron</span>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                Rencana ini akan menyesuaikan bila jadwal diubah.
              </p>
            </div>
          </div>

          {/* Forward Monthly Distribution Chart */}
          <div className='bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-sm'>
            <h4 className='text-sm sm:text-base font-bold text-slate-800 mb-2 flex items-center gap-2'>
              <BarChart3 size={18} className='text-indigo-600' />
              <span>Distribusi Rencana Dosis (12 Bulan Mendatang)</span>
            </h4>
            <p className='text-xs text-slate-500 mb-4'>
              Target jumlah tablet yang wajib diminum pada setiap bulan ke depan
            </p>

            <div className='h-60 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={planChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray='3 3' vertical={false} stroke='#f1f5f9' />
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} Dosis Rencana`, 'Target Rencana']}
                    labelFormatter={(label, items) => {
                      const item = items?.[0]?.payload;
                      return item?.fullMonth || label;
                    }}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e0e7ff',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey='rencanaDosis' fill='#6366f1' radius={[6, 6, 0, 0]} name='Target Rencana' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Upcoming Scheduled Dates Timeline / Table */}
          <div className='bg-white rounded-3xl p-5 sm:p-6 border border-purple-100 shadow-sm'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4'>
              <div>
                <h4 className='text-sm sm:text-base font-bold text-slate-800'>
                  Jadwal Tanggal Pengingat (12 Bulan Mendatang)
                </h4>
                <p className='text-xs text-slate-500'>
                  Kalender jadwal konsumsi TTD yang telah diprogramkan sistem
                </p>
              </div>

              {/* Month Selector for upcoming */}
              <div className='flex items-center gap-2'>
                <Filter size={15} className='text-slate-400' />
                <select
                  value={selectedPlanMonth}
                  onChange={e => setSelectedPlanMonth(e.target.value)}
                  className='px-3 py-1.5 bg-slate-50 border border-purple-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'
                >
                  <option value='ALL'>Semua Bulan (12 Bulan Depan)</option>
                  {plan.monthlyBreakdown.map(m => (
                    <option key={m.monthKey} value={m.monthKey}>
                      {m.monthName} ({m.plannedCount} dosis)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredUpcomingDates.length === 0 ? (
              <div className='py-8 text-center text-slate-400 text-xs sm:text-sm font-medium'>
                Tidak ada rencana jadwal pada bulan yang dipilih.
              </div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full text-left border-collapse'>
                  <thead>
                    <tr className='border-b border-indigo-50 text-[11px] font-bold text-slate-400 uppercase tracking-wider'>
                      <th className='py-3 px-3'>Hari & Tanggal</th>
                      <th className='py-3 px-3'>Jam Pengingat</th>
                      <th className='py-3 px-3'>Target Dosis</th>
                      <th className='py-3 px-3'>Status Rencana</th>
                      <th className='py-3 px-3'>Petunjuk Konsumsi</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-indigo-50/70 text-xs'>
                    {filteredUpcomingDates.map((item, idx) => (
                      <tr key={`${item.date}-${idx}`} className='hover:bg-indigo-50/30 transition-colors'>
                        <td className='py-3 px-3 font-semibold text-slate-800 whitespace-nowrap'>
                          <span className='font-bold text-indigo-700'>{item.dayName}</span>, {item.date}
                        </td>
                        <td className='py-3 px-3 text-slate-600 whitespace-nowrap font-medium'>
                          {item.time} WIB
                        </td>
                        <td className='py-3 px-3 text-slate-700 font-semibold whitespace-nowrap'>
                          {item.tabletName} ({item.dosage})
                        </td>
                        <td className='py-3 px-3 whitespace-nowrap'>
                          <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200'>
                            <CalendarClock size={13} />
                            Terjadwal Mendatang
                          </span>
                        </td>
                        <td className='py-3 px-3 text-slate-500 italic max-w-xs truncate'>
                          {item.instructions}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default YearlyMonitoringView;
