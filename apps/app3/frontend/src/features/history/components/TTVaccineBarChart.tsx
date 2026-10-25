'use client';

import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ImmunizationRecord } from '@/src/features/user/types';
import { TTSchedule } from '@/src/features/schedule/types';
import { ConsumptionLog } from '../types';
import { TT_DOSAGE_LEVELS } from '@/src/shared/constants/domain.constants';

export interface TTVaccineBarChartProps {
  records?: ImmunizationRecord[];
  schedules?: TTSchedule[];
  logs?: ConsumptionLog[];
  loading?: boolean;
}

interface DoseBarItem {
  stage: 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5';
  label: string;
  name: string;
  protectionPeriod: string;
  isCompleted: boolean;
  isPending: boolean;
  value: number; // 0 to 100
  color: string;
  date?: string;
  faskes?: string;
  statusLabel: string;
}

export function TTVaccineBarChart({
  records = [],
  schedules = [],
  logs = [],
  loading = false,
}: TTVaccineBarChartProps) {
  const [activeTab, setActiveTab] = useState<'dosage' | 'visits'>('dosage');

  // 1. Hitung data diagram batang untuk 5 dosis TT
  const dosageData = useMemo<DoseBarItem[]>(() => {
    const stages: Array<'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5'> = [
      'TT1',
      'TT2',
      'TT3',
      'TT4',
      'TT5',
    ];

    return stages.map(stage => {
      const info = TT_DOSAGE_LEVELS[stage];
      // Cek apakah ada di riwayat imunisasi
      const record = records.find(r => r.doseLevel === stage);
      // Cek apakah ada jadwal yang selesai
      const schedule = schedules.find(s => s.stage === stage);

      const isVerified = record?.verificationStatus === 'VERIFIED';
      const isPending = record?.verificationStatus === 'PENDING';
      const isScheduleCompleted = schedule?.status === 'completed';

      const isCompleted = isVerified || isScheduleCompleted;

      let value = 0;
      let color = '#e2e8f0'; // abu-abu kosong jika belum
      let statusLabel = 'Belum Dosis';

      if (isCompleted) {
        value = 100; // Saat selesai, diagram batang muncul 100%
        color = '#059669'; // Emerald hijau
        statusLabel = isVerified ? 'Terverifikasi' : 'Selesai';
      } else if (isPending) {
        value = 75; // Menunggu validasi faskes
        color = '#f59e0b'; // Amber
        statusLabel = 'Menunggu Validasi';
      }

      return {
        stage,
        label: stage,
        name: info?.name || `Imunisasi ${stage}`,
        protectionPeriod: info?.protectionDuration || '-',
        isCompleted,
        isPending,
        value,
        color,
        date:
          record?.vaccineDate ||
          (schedule?.status === 'completed' ? schedule.scheduledDate : undefined),
        faskes: record?.faskesName || undefined,
        statusLabel,
      };
    });
  }, [records, schedules]);

  // Hitung ringkasan capaian
  const completedCount = dosageData.filter(d => d.isCompleted).length;
  const pendingCount = dosageData.filter(d => d.isPending).length;
  const completionPercentage = Math.round((completedCount / 5) * 100);

  // Status proteksi aktif tertinggi
  const highestCompletedStage = [...dosageData].reverse().find(d => d.isCompleted);

  // 2. Data diagram batang untuk tren sesi kunjungan / logs
  const visitTrendData = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    const byDate = new Map<string, { completed: number; scheduled: number }>();
    logs.forEach(log => {
      const current = byDate.get(log.scheduledDate) || { completed: 0, scheduled: 0 };
      current.scheduled += 1;
      if (log.status === 'ON_TIME' || log.status === 'LATE') current.completed += 1;
      byDate.set(log.scheduledDate, current);
    });

    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-10)
      .map(([date, item]) => {
        const rate = item.scheduled > 0 ? Math.round((item.completed / item.scheduled) * 100) : 0;
        return {
          label: date.slice(5),
          date,
          completed: item.completed,
          scheduled: item.scheduled,
          value: rate,
          color: rate === 100 ? '#059669' : rate > 0 ? '#f59e0b' : '#e2e8f0',
        };
      });
  }, [logs]);

  // Tooltip custom untuk diagram dosis TT
  const DosageTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const item: DoseBarItem = payload[0].payload;

    return (
      <div className='p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200 text-xs min-w-[200px]'>
        <div className='flex items-center justify-between gap-2 border-b border-stone-100 pb-2 mb-2'>
          <span className='font-bold text-slate-900'>
            {item.stage} • {item.name}
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              item.isCompleted
                ? 'bg-emerald-100 text-emerald-800'
                : item.isPending
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-stone-100 text-slate-500'
            }`}
          >
            {item.statusLabel}
          </span>
        </div>
        <div className='space-y-1 text-slate-600 text-[11px]'>
          <p>
            <span className='text-slate-400'>Masa Proteksi:</span> {item.protectionPeriod}
          </p>
          {item.date && (
            <p>
              <span className='text-slate-400'>Tanggal:</span> {item.date}
            </p>
          )}
          {item.faskes && (
            <p>
              <span className='text-slate-400'>Faskes:</span> {item.faskes}
            </p>
          )}
          <p className='font-semibold pt-1 text-slate-900'>
            Capaian: <span className='text-emerald-700 font-bold'>{item.value}%</span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <Card padding='md' className='w-full border-stone-200 bg-white shadow-xs'>
      {/* Header & Mode Switcher */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 mb-4'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0'>
              <BarChart2 size={16} />
            </div>
            <h4 className='text-sm sm:text-base font-bold text-slate-900'>
              {activeTab === 'dosage' ? 'Progres Imunisasi TT' : 'Riwayat Kunjungan'}
            </h4>
          </div>
          <p className='text-xs text-slate-500 mt-0.5'>
            {activeTab === 'dosage' ? 'Tahapan dosis TT1 s/d TT5' : 'Kehadiran sesi imunisasi'}
          </p>
        </div>

        {/* Tab Switcher jika ada data log */}
        {visitTrendData.length > 0 && (
          <div className='flex items-center bg-stone-100 p-1 rounded-xl self-start sm:self-auto text-xs'>
            <button
              type='button'
              onClick={() => setActiveTab('dosage')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'dosage'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              5 Dosis TT
            </button>
            <button
              type='button'
              onClick={() => setActiveTab('visits')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeTab === 'visits'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Riwayat Kunjungan
            </button>
          </div>
        )}
      </div>

      {/* Main Bar Chart Container */}
      {loading ? (
        <div className='h-56 animate-pulse rounded-2xl bg-stone-100' />
      ) : activeTab === 'dosage' ? (
        <div className='w-full'>
          <div className='h-56 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={dosageData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                <XAxis
                  dataKey='label'
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#334155' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  tickFormatter={value => `${value}%`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip content={<DosageTooltip />} cursor={{ fill: '#f8fafc' }} />
                <ReferenceLine
                  y={100}
                  stroke='#cbd5e1'
                  strokeDasharray='3 3'
                  label={{
                    value: 'Selesai 100%',
                    position: 'insideTopRight',
                    fill: '#94a3b8',
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
                <Bar
                  dataKey='value'
                  name='Capaian Dosis'
                  radius={[8, 8, 0, 0]}
                  maxBarSize={44}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing='ease-out'
                >
                  {dosageData.map((entry, index) => (
                    <Cell
                      key={`bar-${index}`}
                      fill={entry.color}
                      className='transition-all duration-300 hover:opacity-85'
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        /* Sesi Kunjungan Bar Chart */
        <div className='w-full'>
          <div className='h-56 w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart data={visitTrendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f1f5f9' vertical={false} />
                <XAxis
                  dataKey='label'
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 50, 100]}
                  tickFormatter={value => `${value}%`}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Kepatuhan']}
                  labelFormatter={lbl => `Tanggal ${lbl}`}
                  contentStyle={{ borderRadius: 12, borderColor: '#d1fae5', fontSize: 12 }}
                />
                <Bar
                  dataKey='value'
                  name='Kepatuhan'
                  radius={[6, 6, 0, 0]}
                  maxBarSize={36}
                  isAnimationActive={true}
                >
                  {visitTrendData.map((entry, idx) => (
                    <Cell key={`visit-bar-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ringkasan Cepat (5-Detik Glanceable) */}
      <div className='mt-3.5 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2.5'>
        <div className='bg-stone-50 rounded-2xl p-2.5 sm:p-3 text-center border border-stone-200/70'>
          <span className='text-[11px] font-semibold text-slate-500 block mb-0.5'>
            Dosis Selesai
          </span>
          <div className='flex items-baseline justify-center gap-1'>
            <span className='text-xl sm:text-2xl font-black text-slate-900'>{completedCount}</span>
            <span className='text-xs sm:text-sm font-bold text-slate-400'>/ 5</span>
          </div>
        </div>

        <div
          className={`rounded-2xl p-2.5 sm:p-3 text-center border ${
            completedCount >= 2
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <span className='text-[11px] font-semibold opacity-75 block mb-0.5'>Syarat Nikah</span>
          <span className='text-sm sm:text-base font-black block truncate'>
            {completedCount >= 5 ? 'Kebal Penuh' : completedCount >= 2 ? 'Siap Nikah' : 'Perlu TT2'}
          </span>
        </div>
      </div>
    </Card>
  );
}

export default TTVaccineBarChart;
