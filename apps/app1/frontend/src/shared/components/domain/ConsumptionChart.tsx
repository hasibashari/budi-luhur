'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { WeeklyAdherencePoint } from '@/src/features/monitoring/utils/weeklyAdherence';

export interface ConsumptionTrendItem {
  label: string;
  completed: number;
  scheduled: number;
  completionRate: number;
}

export interface ConsumptionChartProps {
  data?: ConsumptionTrendItem[];
  weeklyData?: WeeklyAdherencePoint[];
  totalCount?: number;
  compliancePercent?: number;
  loading?: boolean;
}

interface ChartBarItem {
  week: number;
  label: string;
  fullLabel: string;
  dateRange: string;
  percentage: number;
  displayPercentage: string;
  completedCount: number;
  missedCount: number;
  cumulativeCompleted: number;
  delta: number | null;
  isUpcoming: boolean;
  status: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'UPCOMING';
}

export function ConsumptionChart({
  weeklyData,
  totalCount = 0,
  compliancePercent,
  loading = false,
}: ConsumptionChartProps) {
  // Target bulanan: ambil dari weeklyData jika tersedia, default 4
  const targetCount = useMemo(() => {
    if (weeklyData && weeklyData.length > 0) {
      if (weeklyData[0]?.targetDoses) {
        return weeklyData[0].targetDoses;
      }
      const activePoints = weeklyData.filter(w => !w.isInactive);
      if (activePoints.length > 0) {
        return activePoints.length;
      }
    }
    return 4;
  }, [weeklyData]);

  // Hitung initial active week dari minggu saat ini atau minggu terakhir yang aktif
  const initialWeek = useMemo(() => {
    if (weeklyData && weeklyData.length > 0) {
      // Prioritaskan minggu saat ini (isCurrent)
      const currentPoint = weeklyData.find(w => w.isCurrent);
      if (currentPoint) {
        return currentPoint.week;
      }
      // Atau minggu terakhir yang bukan upcoming
      const pastWeeks = weeklyData.filter(w => !w.isUpcoming && w.percentage !== null);
      if (pastWeeks.length > 0) {
        return pastWeeks[pastWeeks.length - 1].week;
      }
    }
    return Math.min(targetCount, Math.max(1, totalCount));
  }, [totalCount, weeklyData, targetCount]);

  const [activeWeek, setActiveWeek] = useState<number>(initialWeek);

  // Sync saat data external berubah
  useEffect(() => {
    setActiveWeek(initialWeek);
  }, [initialWeek]);

  // Siapkan dataset diagram batang untuk 4 minggu (M1 - M4)
  const chartBars: ChartBarItem[] = useMemo(() => {
    // 1. Jika weeklyData aktual tersedia
    if (weeklyData && weeklyData.length === 4) {
      return weeklyData.map(w => {
        const pct = w.percentage ?? 0;
        return {
          week: w.week,
          label: w.label,
          fullLabel: w.fullLabel,
          dateRange: w.dateRange,
          percentage: pct,
          displayPercentage: w.isUpcoming ? '-' : `${pct}%`,
          completedCount: w.completedCount,
          missedCount: w.missedCount,
          cumulativeCompleted: w.cumulativeCompleted,
          delta: w.delta,
          isUpcoming: w.isUpcoming,
          status: w.status,
        };
      });
    }

    // 2. Fallback progresif 4 minggu dari totalCount
    const defaultRanges = ['1 - 7', '8 - 14', '15 - 21', '22 - Akhir'];
    return [1, 2, 3, 4].map(w => {
      const isPastOrDone = totalCount >= w;
      const isUpcoming = totalCount < w;
      const pct = isPastOrDone ? Math.round((w / targetCount) * 100) : 0;
      return {
        week: w,
        label: `M${w}`,
        fullLabel: `Minggu ${w}`,
        dateRange: defaultRanges[w - 1],
        percentage: pct,
        displayPercentage: isUpcoming ? '-' : `${pct}%`,
        completedCount: isPastOrDone ? 1 : 0,
        missedCount: 0,
        cumulativeCompleted: Math.min(w, totalCount),
        delta: null,
        isUpcoming,
        status: (pct >= 60 ? 'OPTIMAL' : pct >= 30 ? 'MODERATE' : isUpcoming ? 'UPCOMING' : 'LOW') as any,
      };
    });
  }, [weeklyData, totalCount, targetCount]);

  // Data ringkasan untuk minggu yang sedang aktif/dipilih
  const activeSummary = useMemo(() => {
    if (activeWeek === 0) {
      return {
        completedDoses: 0,
        percentage: 0,
        statusText: `0 / ${targetCount} Dosis`,
        delta: null,
        label: 'Awal Bulan',
        isUpcoming: false,
      };
    }

    const currentItem = chartBars.find(b => b.week === activeWeek);

    // Ambil data dosis selesai aktual dari currentItem atau totalCount
    const completedDoses = currentItem
      ? currentItem.cumulativeCompleted
      : Math.min(totalCount, targetCount);

    const isUpcoming = currentItem ? currentItem.isUpcoming : false;

    // Persentase kepatuhan: gunakan nilai dari currentItem, atau hitung dari completedDoses / targetCount
    const percentage =
      currentItem?.percentage ??
      (targetCount > 0 ? Math.round((completedDoses / targetCount) * 100) : 0);

    let statusText = `0 / ${targetCount} Dosis`;
    if (isUpcoming) {
      statusText = 'Jadwal Belum Tiba';
    } else if (completedDoses >= targetCount && targetCount > 0) {
      statusText = `Lengkap (${targetCount}/${targetCount} Dosis)`;
    } else if (completedDoses > 0) {
      statusText = `Dosis ${completedDoses} dari ${targetCount} Terpenuhi`;
    }

    return {
      completedDoses,
      percentage,
      statusText,
      delta: currentItem?.delta ?? null,
      label: currentItem?.fullLabel || `Minggu ${activeWeek}`,
      dateRange: currentItem?.dateRange,
      isUpcoming,
    };
  }, [activeWeek, chartBars, targetCount, totalCount]);

  const handleSelectWeek = (week: number) => {
    if (activeWeek === week) {
      setActiveWeek(0); // Toggle reset
    } else {
      setActiveWeek(week);
    }
  };

  // Custom Tooltip Recharts untuk Diagram Batang
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: ChartBarItem = payload[0].payload;
      return (
        <div className='bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-[#fce7f3] shadow-lg shadow-rose-500/10 text-xs min-w-[170px]'>
          <div className='flex items-center justify-between gap-2 border-b border-slate-100 pb-1.5 mb-2'>
            <span className='font-bold text-[#1e293b] flex items-center gap-1.5'>
              <Calendar size={13} className='text-[#e11d48]' />
              <span>{data.fullLabel}</span>
            </span>
            <span className='text-[10px] text-slate-400 font-medium'>{data.dateRange}</span>
          </div>

          {data.isUpcoming ? (
            <p className='text-slate-400 italic text-[11px] py-1'>Jadwal belum tiba</p>
          ) : (
            <div className='space-y-1.5'>
              <div className='flex items-center justify-between'>
                <span className='text-slate-500'>Kepatuhan:</span>
                <span className='font-extrabold text-[#1e293b]'>{data.percentage}%</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-slate-500'>Diminum:</span>
                <span className='font-semibold text-emerald-600'>{data.completedCount} tablet</span>
              </div>
              {data.missedCount > 0 && (
                <div className='flex items-center justify-between'>
                  <span className='text-slate-500'>Terlewat:</span>
                  <span className='font-semibold text-rose-500'>{data.missedCount} tablet</span>
                </div>
              )}
              {data.delta !== null && (
                <div className='flex items-center justify-between pt-1 border-t border-slate-100'>
                  <span className='text-slate-500'>Tren Delta:</span>
                  <span
                    className={`font-bold flex items-center gap-0.5 ${
                      data.delta > 0
                        ? 'text-emerald-600'
                        : data.delta < 0
                          ? 'text-rose-500'
                          : 'text-slate-400'
                    }`}
                  >
                    {data.delta > 0 ? (
                      <TrendingUp size={12} />
                    ) : data.delta < 0 ? (
                      <TrendingDown size={12} />
                    ) : (
                      <Minus size={12} />
                    )}
                    <span>{data.delta > 0 ? `+${data.delta}%` : `${data.delta}%`}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding='md' className='w-full'>
      {/* 1. Header & Info */}
      <div className='flex items-start justify-between gap-2 mb-3'>
        <div>
          <div className='flex items-center gap-1.5'>
            <h4 className='text-sm sm:text-base font-bold text-[#1e293b]'>
              Grafik Kepatuhan TTD Bulanan
            </h4>
            <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'>
              {targetCount}x / Bulan
            </span>
          </div>
          <p className='text-xs text-[#64748b] mt-0.5'>
            Perubahan persentase kepatuhan mingguan (dari kecil ke atas menuju 100%)
          </p>
        </div>
      </div>

      {/* 3. Diagram Batang (Vertical Bar Chart - Recharts) */}
      {loading ? (
        <div className='h-52 animate-pulse rounded-xl bg-slate-100' />
      ) : (
        <div className='h-52 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart
              data={chartBars}
              margin={{ top: 22, right: 12, left: -18, bottom: 0 }}
              onClick={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  const clickedWeek = state.activePayload[0].payload.week;
                  handleSelectWeek(clickedWeek);
                }
              }}
              className='cursor-pointer select-none'
            >
              <CartesianGrid strokeDasharray='3 3' stroke='#fce7f3' vertical={false} />
              <XAxis
                dataKey='label'
                tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                axisLine={{ stroke: '#fce7f3' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={value => `${value}%`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#fce7f3' }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* Garis target ideal 100% */}
              <ReferenceLine
                y={100}
                stroke='#cbd5e1'
                strokeDasharray='4 4'
                label={{
                  value: 'Target 100%',
                  position: 'insideTopRight',
                  fill: '#94a3b8',
                  fontSize: 10,
                }}
              />
              <Bar
                dataKey='percentage'
                name='Kepatuhan'
                radius={[6, 6, 0, 0]}
                maxBarSize={44}
                animationDuration={600}
                animationEasing='ease-out'
              >
                {/* Teks persentase langsung di atas puncak setiap batang */}
                <LabelList
                  dataKey='displayPercentage'
                  position='top'
                  fill='#64748b'
                  fontSize={11}
                  fontWeight={700}
                  offset={6}
                />
                {chartBars.map((entry, index) => {
                  const isSelected = activeWeek === entry.week;
                  let fillColor = '#e11d48'; // Primary FEMORY rose

                  if (entry.isUpcoming) {
                    fillColor = '#e2e8f0'; // Gray Upcoming
                  } else if (entry.percentage >= 60) {
                    fillColor = '#10b981'; // Emerald High
                  } else if (entry.percentage >= 30) {
                    fillColor = '#e11d48'; // Rose Moderate
                  } else {
                    fillColor = '#f59e0b'; // Amber Low
                  }

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={fillColor}
                      fillOpacity={isSelected ? 1 : 0.85}
                      stroke={isSelected ? '#881337' : 'none'}
                      strokeWidth={isSelected ? 1.5 : 0}
                      className='transition-all duration-200'
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 4. Kartu Rangkuman di Bawah Grafik */}
      <div className='grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-[#fce7f3]'>
        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center transition-all'>
          <span className='text-[11px] font-medium text-[#64748b] block mb-0.5'>Total Selesai</span>
          <span className='text-base sm:text-lg font-bold text-[#1e293b]'>
            {activeSummary.completedDoses}{' '}
            <span className='text-xs font-semibold text-[#64748b]'>/ {targetCount} Kali</span>
          </span>
          <span className='text-[10px] text-rose-500 font-medium block mt-0.5'>
            {activeSummary.completedDoses >= targetCount
              ? 'Target Terpenuhi'
              : `${Math.max(0, targetCount - activeSummary.completedDoses)} kali lagi`}
          </span>
        </div>

        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center transition-all'>
          <span className='text-[11px] font-medium text-[#64748b] block mb-0.5'>
            Kepatuhan Bulanan
          </span>
          <span
            className={`text-base sm:text-lg font-bold transition-colors ${
              activeSummary.percentage >= 80
                ? 'text-[#10b981]'
                : activeSummary.percentage >= 40
                  ? 'text-[#e11d48]'
                  : 'text-amber-600'
            }`}
          >
            {activeSummary.isUpcoming ? '-' : `${activeSummary.percentage}%`}
          </span>
          <span className='text-[10px] text-slate-500 font-medium block mt-0.5 flex items-center justify-center gap-1'>
            {activeSummary.percentage >= 80 && !activeSummary.isUpcoming && (
              <Sparkles size={11} className='text-emerald-500' />
            )}
            <span>{activeSummary.statusText}</span>
          </span>
        </div>
      </div>
    </Card>
  );
}
