import React, { useMemo } from 'react';
import { History, Clock, Edit3 } from 'lucide-react';
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
} from './symptomHealth.types';

export interface SymptomHistoryTabProps {
  logs: DailyHealthLog[];
  onEditLog: (logDate: string) => void;
}

export const SymptomHistoryTab: React.FC<SymptomHistoryTabProps> = ({ logs, onEditLog }) => {
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

  if (logs.length === 0) {
    return (
      <div className='text-center py-10 px-4'>
        <History className='w-10 h-10 text-slate-300 mx-auto mb-2' />
        <p className='text-sm font-bold text-slate-700'>Belum Ada Riwayat Catatan</p>
        <p className='text-xs text-slate-500 mt-1'>
          Catatan harian yang Anda simpan akan muncul di sini.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {/* GRAFIK TREN KONDISI HARIAN (AREA CHART) */}
      <section
        aria-label='Grafik tren kondisi kesehatan'
        className='rounded-2xl border border-primary-soft bg-primary-subtle/60 p-3.5 sm:p-5'
      >
        <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <h3 className='text-sm font-extrabold text-ink sm:text-base'>Tren Kondisi Harian</h3>
            <p className='text-[11px] text-muted sm:text-xs'>
              Skor gabungan mood, nyeri, pendarahan, dan efek samping · 14 catatan terakhir
            </p>
          </div>
          <div className='flex gap-2 text-[10px] sm:text-xs'>
            <span className='rounded-lg bg-surface px-2.5 py-1 text-body shadow-2xs'>
              Terbaru <strong className='text-primary'>{latestHealthScore}</strong>
            </span>
            <span className='rounded-lg bg-surface px-2.5 py-1 text-body shadow-2xs'>
              Rata-rata <strong className='text-primary'>{averageHealthScore}</strong>
            </span>
          </div>
        </div>

        {/* Container Grafik Recharts */}
        <div className='h-52 w-full sm:h-60 text-primary'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
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
                strokeOpacity={0.15}
              />

              <XAxis
                dataKey='shortDate'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: '#64748b' }}
                dy={8}
                interval='preserveStartEnd'
              />

              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
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
                      <div className='rounded-xl border border-primary-soft bg-surface px-3 py-2 shadow-md'>
                        <p className='text-[11px] font-bold text-slate-700'>{data.fullDate}</p>
                        <p className='text-xs font-extrabold text-primary mt-0.5'>
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
                  r: 3.5,
                  fill: '#ffffff',
                  stroke: 'currentColor',
                  strokeWidth: 2,
                }}
                activeDot={{
                  r: 5.5,
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
      {logs.map(log => {
        const moodLabel = MOOD_OPTIONS.find(m => m.id === log.mood)?.label;
        const painLabel = PAIN_OPTIONS.find(p => p.id === log.pain)?.label;
        const bleedLabel = BLEEDING_OPTIONS.find(b => b.id === log.bleeding)?.label;

        return (
          <div
            key={log.id}
            className='flex flex-col justify-between gap-3 rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary-soft sm:flex-row sm:items-center sm:p-4'
          >
            <div className='space-y-2 flex-1 min-w-0'>
              {/* Tanggal & Jam Simpan */}
              <div className='flex items-center justify-between sm:justify-start gap-3'>
                <span className='text-xs sm:text-sm font-extrabold text-slate-900'>
                  {formatIndonesianDate(log.logDate)}
                </span>
                <span className='text-[11px] text-slate-400 flex items-center gap-1'>
                  <Clock className='w-3 h-3' />
                  {log.updatedAt}
                </span>
              </div>

              {/* Ringkasan Badge Kondisi */}
              <div className='flex flex-wrap gap-1.5'>
                <Badge variant='primary' size='sm'>
                  Mood: {moodLabel}
                </Badge>
                <Badge variant='neutral' size='sm'>
                  Nyeri: {painLabel}
                </Badge>
                <Badge variant='primary' size='sm'>
                  Pendarahan: {bleedLabel}
                </Badge>
                <span className='px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200'>
                  BB: {log.weightKg} kg ({log.weightStatus})
                </span>
              </div>

              {/* Catatan Tambahan */}
              {log.notes && (
                <p className='text-xs text-slate-600 italic bg-slate-50 px-3 py-2 rounded-xl border border-slate-100'>
                  "{log.notes}"
                </p>
              )}
            </div>

            {/* Tombol Lihat / Edit */}
            <Button
              type='button'
              variant='soft'
              size='sm'
              shape='rounded'
              icon={<Edit3 className='w-3.5 h-3.5' />}
              onClick={() => onEditLog(log.logDate)}
              className='shrink-0 self-end sm:self-center font-bold text-xs'
            >
              Detail / Ubah
            </Button>
          </div>
        );
      })}
    </div>
  );
};
