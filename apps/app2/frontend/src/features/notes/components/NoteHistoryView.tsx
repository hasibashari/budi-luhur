import React, { useMemo, useState } from 'react';
import { History, Clock, Edit3, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Badge } from '@/src/shared/components/ui/Badge';
import { Button } from '@/src/shared/components/ui/Button';
import {
  DailyHealthLog,
  formatIndonesianDate,
  getHealthScore,
  MOOD_OPTIONS,
  PAIN_OPTIONS,
  BLEEDING_OPTIONS,
} from '../types/notes.types';

export interface NoteHistoryViewProps {
  logs: DailyHealthLog[];
  onEditLog: (logDate: string) => void;
  onAddNewLog?: () => void;
}

// Backward compatibility alias
export type SymptomHistoryTabProps = NoteHistoryViewProps;

type HistoryFilter = 'semua' | 'ada_keluhan' | 'nyeri' | 'pendarahan';

export const NoteHistoryView: React.FC<NoteHistoryViewProps> = ({
  logs,
  onEditLog,
  onAddNewLog,
}) => {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('semua');

  // Format data langsung agar siap dikonsumsi oleh Recharts
  const chartData = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.logDate.localeCompare(b.logDate))
        .slice(-14)
        .map(log => {
          const formattedDate = formatIndonesianDate(log.logDate);
          return {
            id: log.id,
            logDate: log.logDate,
            fullDate: formattedDate,
            // Mengambil tanggal & bulan singkat untuk sumbu X (misal: "20 Okt")
            shortDate: formattedDate.split(' ').slice(0, 2).join(' '),
            score: getHealthScore(log),
          };
        }),
    [logs],
  );

  const averageHealthScore =
    chartData.length > 0
      ? Math.round(chartData.reduce((total, item) => total + item.score, 0) / chartData.length)
      : 0;

  const latestHealthScore = chartData[chartData.length - 1]?.score || 0;

  // Filter riwayat catatan
  const filteredLogs = useMemo(() => {
    if (activeFilter === 'semua') return logs;
    if (activeFilter === 'ada_keluhan') {
      return logs.filter(
        item =>
          item.pain !== 'tidak_ada' ||
          item.bleeding !== 'tidak_ada' ||
          (item.sideEffects && !item.sideEffects.includes('tidak_ada')),
      );
    }
    if (activeFilter === 'nyeri') {
      return logs.filter(item => item.pain !== 'tidak_ada');
    }
    if (activeFilter === 'pendarahan') {
      return logs.filter(item => item.bleeding !== 'tidak_ada');
    }
    return logs;
  }, [logs, activeFilter]);

  if (logs.length === 0) {
    return (
      <div className='text-center py-10 px-4 rounded-3xl border border-dashed border-border bg-surface-soft/40'>
        <div className='w-12 h-12 rounded-2xl bg-primary-subtle text-primary flex items-center justify-center mx-auto mb-3 shadow-xs'>
          <History className='w-6 h-6' />
        </div>
        <p className='text-sm sm:text-base font-extrabold text-ink'>Belum Ada Riwayat Catatan</p>
        <p className='text-xs text-muted mt-1 max-w-sm mx-auto'>
          Catat kondisi tubuh, adaptasi pil KB, atau gejala efek samping Anda untuk mulai melihat grafik tren kesehatan.
        </p>
        {onAddNewLog && (
          <Button
            type='button'
            variant='primary'
            size='md'
            shape='pill'
            onClick={onAddNewLog}
            className='mt-4 font-bold min-h-[44px]'
          >
            Mulai Catat Hari Ini
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* GRAFIK TREN KONDISI HARIAN (AREA CHART) */}
      <section
        aria-label='Grafik tren kondisi kesehatan'
        className='rounded-3xl border border-primary-soft bg-primary-subtle/50 p-3.5 sm:p-5'
      >
        <div className='mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h3 className='text-sm font-extrabold text-ink sm:text-base'>Tren Kondisi Harian</h3>
            <p className='text-[11px] text-muted sm:text-xs'>
              Skor kondisi tubuh · 14 catatan terakhir
            </p>
          </div>
          <div className='flex gap-2 text-[10px] sm:text-xs'>
            <span className='rounded-xl bg-surface px-2.5 py-1 text-body font-semibold shadow-2xs border border-primary-soft/50'>
              Terbaru <strong className='text-primary'>{latestHealthScore}</strong>
            </span>
            <span className='rounded-xl bg-surface px-2.5 py-1 text-body font-semibold shadow-2xs border border-primary-soft/50'>
              Rata-rata <strong className='text-primary'>{averageHealthScore}</strong>
            </span>
          </div>
        </div>

        {/* Container Grafik Recharts Responsif */}
        <div className='h-44 sm:h-56 w-full text-primary'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData} margin={{ top: 8, right: 6, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='healthScoreGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='currentColor' stopOpacity={0.35} />
                  <stop offset='95%' stopColor='currentColor' stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                stroke='currentColor'
                strokeOpacity={0.12}
              />

              <XAxis
                dataKey='shortDate'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                dy={6}
                interval='preserveStartEnd'
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 50, 100]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#94a3b8' }}
              />

              <Tooltip
                cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className='rounded-xl border border-primary-soft bg-surface px-3 py-2 shadow-md text-xs'>
                        <p className='text-[11px] font-bold text-slate-700'>{data.fullDate}</p>
                        <p className='font-extrabold text-primary mt-0.5'>
                          Skor Kondisi: {data.score}/100
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type='monotone'
                dataKey='score'
                stroke='currentColor'
                strokeWidth={2.5}
                fillOpacity={1}
                fill='url(#healthScoreGradient)'
                dot={{
                  r: 3,
                  fill: '#ffffff',
                  stroke: 'currentColor',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5,
                  fill: 'currentColor',
                  stroke: '#ffffff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* DAFTAR RIWAYAT CATATAN */}
      <div className='pt-2'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3 px-1'>
          <h3 className='text-sm sm:text-base font-extrabold text-ink flex items-center gap-2'>
            <span>Riwayat Catatan Harian</span>
            <span className='rounded-full bg-primary-subtle px-2 py-0.5 text-[11px] font-bold text-primary border border-primary-soft'>
              {filteredLogs.length}
            </span>
          </h3>

          {/* MOBILE FILTER PILLS */}
          <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none'>
            <button
              type='button'
              role='button'
              onClick={() => setActiveFilter('semua')}
              className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer touch-manipulation ${
                activeFilter === 'semua'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-soft text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua
            </button>
            <button
              type='button'
              role='button'
              onClick={() => setActiveFilter('ada_keluhan')}
              className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer touch-manipulation ${
                activeFilter === 'ada_keluhan'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-soft text-slate-600 hover:bg-slate-200'
              }`}
            >
              Ada Keluhan
            </button>
            <button
              type='button'
              role='button'
              onClick={() => setActiveFilter('nyeri')}
              className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer touch-manipulation ${
                activeFilter === 'nyeri'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-soft text-slate-600 hover:bg-slate-200'
              }`}
            >
              Nyeri
            </button>
            <button
              type='button'
              role='button'
              onClick={() => setActiveFilter('pendarahan')}
              className={`min-h-[36px] px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer touch-manipulation ${
                activeFilter === 'pendarahan'
                  ? 'bg-primary text-white shadow-2xs'
                  : 'bg-surface-soft text-slate-600 hover:bg-slate-200'
              }`}
            >
              Pendarahan
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className='text-center py-8 px-4 rounded-2xl border border-dashed border-border bg-slate-50/50'>
            <AlertTriangle className='w-6 h-6 text-slate-400 mx-auto mb-2' />
            <p className='text-xs sm:text-sm font-bold text-slate-700'>
              Tidak ada catatan pada kategori ini.
            </p>
            <button
              type='button'
              onClick={() => setActiveFilter('semua')}
              className='mt-2 text-xs font-extrabold text-primary hover:underline cursor-pointer'
            >
              Tampilkan Semua Catatan
            </button>
          </div>
        ) : (
          <div data-testid='note-history-list' className='space-y-3'>
            {filteredLogs.map(log => {
              const moodLabel = MOOD_OPTIONS.find(m => m.id === log.mood)?.label;
              const painLabel = PAIN_OPTIONS.find(p => p.id === log.pain)?.label;
              const bleedLabel = BLEEDING_OPTIONS.find(b => b.id === log.bleeding)?.label;

              const isPainWarning = log.pain === 'sedang' || log.pain === 'berat';
              const isBleedWarning = log.bleeding === 'flek' || log.bleeding === 'haid_banyak';
              const hasSideEffects = log.sideEffects && !log.sideEffects.includes('tidak_ada');

              return (
                <div
                  key={log.id}
                  className='flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 sm:p-4 transition-all hover:border-primary-soft hover:shadow-xs'
                >
                  <div className='space-y-2 flex-1 min-w-0'>
                    {/* Tanggal & Jam Simpan */}
                    <div className='flex items-center justify-between gap-2'>
                      <span className='text-xs sm:text-sm font-extrabold text-slate-900'>
                        {formatIndonesianDate(log.logDate)}
                      </span>
                      <span className='text-[11px] text-slate-400 flex items-center gap-1 shrink-0'>
                        <Clock className='w-3 h-3' />
                        {log.updatedAt}
                      </span>
                    </div>

                    {/* Ringkasan Badge Kondisi dengan Kontras Severity */}
                    <div className='flex flex-wrap gap-1.5'>
                      <Badge variant='primary' size='sm'>
                        Mood: {moodLabel}
                      </Badge>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isPainWarning
                            ? 'bg-amber-50 text-amber-900 border-amber-300'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        Nyeri: {painLabel}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isBleedWarning
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-teal-50 text-teal-800 border-teal-200'
                        }`}
                      >
                        Pendarahan: {bleedLabel}
                      </span>

                      <span className='px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-700 border border-slate-200'>
                        BB: {log.weightKg} kg ({log.weightStatus})
                      </span>

                      {hasSideEffects && (
                        <span className='px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-800 border border-purple-200'>
                          Efek: {log.sideEffects.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Catatan Tambahan */}
                    {log.notes && (
                      <p className='text-xs text-slate-600 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 leading-relaxed'>
                        "{log.notes}"
                      </p>
                    )}
                  </div>

                  {/* Tombol Lihat / Edit Touch Target */}
                  <div className='flex items-center justify-end pt-1 sm:pt-0'>
                    <Button
                      type='button'
                      variant='soft'
                      size='sm'
                      shape='rounded'
                      icon={<Edit3 className='w-3.5 h-3.5' />}
                      onClick={() => onEditLog(log.logDate)}
                      className='min-h-[40px] px-3.5 font-bold text-xs self-stretch sm:self-auto touch-manipulation'
                    >
                      Detail / Ubah
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// Backward compatibility alias
export const SymptomHistoryTab = NoteHistoryView;

export default NoteHistoryView;
