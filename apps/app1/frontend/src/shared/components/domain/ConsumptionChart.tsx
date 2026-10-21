'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { Card } from '../ui/Card';

export interface ConsumptionTrendItem {
  label: string;
  completed: number;
  scheduled: number;
  completionRate: number;
}

export interface ConsumptionChartProps {
  data?: ConsumptionTrendItem[];
  totalCount?: number;
  compliancePercent?: number;
  loading?: boolean;
}

interface MonthlyWeekPoint {
  week: number;
  label: string;
  target: number;
  actual: number | null;
}

export function ConsumptionChart({ totalCount = 0, loading = false }: ConsumptionChartProps) {
  // Initialize active week based on current totalCount (0 to 4 times per month)
  const initialWeek = useMemo(() => {
    return Math.min(4, Math.max(0, totalCount));
  }, [totalCount]);

  const [activeWeek, setActiveWeek] = useState<number>(initialWeek);

  // Sync if external totalCount changes
  useEffect(() => {
    setActiveWeek(initialWeek);
  }, [initialWeek]);

  // Construct the 4-week cumulative chart data
  const chartData: MonthlyWeekPoint[] = useMemo(() => {
    const weeks = [
      { week: 0, label: 'Awal', target: 0 },
      { week: 1, label: 'Minggu 1', target: 25 },
      { week: 2, label: 'Minggu 2', target: 50 },
      { week: 3, label: 'Minggu 3', target: 75 },
      { week: 4, label: 'Minggu 4', target: 100 },
    ];

    return weeks.map(item => {
      if (activeWeek === 0) {
        // Flat at the bottom (0%)
        return {
          ...item,
          actual: 0,
        };
      }

      if (item.week <= activeWeek) {
        return {
          ...item,
          actual: item.target,
        };
      }

      return {
        ...item,
        actual: null,
      };
    });
  }, [activeWeek]);

  const currentPercent = activeWeek * 25;

  const handleSelectWeek = (week: number) => {
    if (activeWeek === week) {
      setActiveWeek(0); // Toggle back to 0 if clicked again
    } else {
      setActiveWeek(week);
    }
  };

  const handleAdvanceStep = () => {
    setActiveWeek(prev => (prev >= 4 ? 0 : prev + 1));
  };

  return (
    <Card padding='md' className='w-full'>
      <div className='flex items-start justify-between gap-2 mb-3'>
        <div>
          <div className='flex items-center gap-1.5'>
            <h4 className='text-sm sm:text-base font-bold text-[#1e293b]'>
              Grafik Kepatuhan TTD Bulanan
            </h4>
            <span className='px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fff1f2] text-[#e11d48] border border-[#fecdd3]'>
              4x / Bulan
            </span>
          </div>
          <p className='text-xs text-[#64748b] mt-0.5'>
            Klik per minggu untuk melihat kenaikan dari 0% hingga 100%
          </p>
        </div>

        {activeWeek > 0 && (
          <button
            type='button'
            onClick={() => setActiveWeek(0)}
            className='text-[11px] font-semibold text-slate-400 hover:text-[#e11d48] transition-colors inline-flex items-center gap-1 cursor-pointer pt-0.5 shrink-0'
            title='Reset ke 0%'
          >
            <RotateCcw size={12} />
            <span>Reset (0%)</span>
          </button>
        )}
      </div>

      {/* 4 Interactive Week Buttons (Step-by-Step) */}
      <div className='grid grid-cols-4 gap-2 mb-3.5'>
        {[1, 2, 3, 4].map(week => {
          const isCompleted = activeWeek >= week;
          const isCurrent = activeWeek === week;
          const percent = week * 25;
          return (
            <button
              key={week}
              type='button'
              onClick={() => handleSelectWeek(week)}
              className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                isCurrent
                  ? 'bg-[#e11d48] border-[#e11d48] text-white shadow-md shadow-rose-500/25'
                  : isCompleted
                    ? 'bg-rose-50 border-rose-200 text-[#e11d48] hover:bg-rose-100/70'
                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
              }`}
            >
              <div className='flex items-center justify-center gap-1 text-xs font-bold leading-tight'>
                {isCompleted && (
                  <CheckCircle2 size={13} className={isCurrent ? 'text-white' : 'text-[#e11d48]'} />
                )}
                <span>M{week}</span>
              </div>
              <span
                className={`text-[10px] font-medium block mt-0.5 ${
                  isCurrent ? 'text-rose-100' : 'text-slate-400'
                }`}
              >
                {percent}%
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className='h-52 animate-pulse rounded-xl bg-slate-100' />
      ) : (
        <div className='h-52 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart
              data={chartData}
              margin={{ top: 12, right: 12, left: -18, bottom: 0 }}
              onClick={handleAdvanceStep}
              className='cursor-pointer select-none'
            >
              <defs>
                <linearGradient id='consumption-fill' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#e11d48' stopOpacity={0.4} />
                  <stop offset='95%' stopColor='#e11d48' stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#fce7f3' />
              <XAxis
                dataKey='label'
                tick={{ fontSize: 10.5, fill: '#64748b', fontWeight: 500 }}
                axisLine={{ stroke: '#fce7f3' }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={value => `${value}%`}
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#fce7f3' }}
              />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (value === null || value === undefined) return ['Belum dicapai', 'Status'];
                  const labelName = name === 'actual' ? 'Kepatuhan Aktual' : 'Target Bulanan';
                  return [`${value}%`, labelName];
                }}
                labelFormatter={label => `${label}`}
                contentStyle={{
                  borderRadius: 12,
                  borderColor: '#fce7f3',
                  fontSize: 12,
                  boxShadow: '0 4px 12px rgba(225, 29, 72, 0.08)',
                }}
              />
              {/* Target Baseline Track (Dashed 100% line) */}
              <Area
                type='monotone'
                dataKey='target'
                name='Target'
                stroke='#cbd5e1'
                strokeWidth={1.5}
                strokeDasharray='4 4'
                fill='none'
                dot={false}
                isAnimationActive={false}
              />
              {/* Actual Filled Area (Rises on week clicks) */}
              <Area
                type='monotone'
                dataKey='actual'
                name='Kepatuhan'
                stroke='#e11d48'
                strokeWidth={3}
                fill='url(#consumption-fill)'
                dot={{ r: 4, fill: '#e11d48', stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6.5, fill: '#e11d48', stroke: '#fff', strokeWidth: 2.5 }}
                connectNulls={false}
                isAnimationActive={true}
                animationDuration={700}
                animationEasing='ease-out'
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Summary Footer Cards */}
      <div className='grid grid-cols-2 gap-2.5 mt-3.5 pt-3 border-t border-[#fce7f3]'>
        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center transition-all'>
          <span className='text-[11px] font-medium text-[#64748b] block mb-0.5'>Total Selesai</span>
          <span className='text-base sm:text-lg font-bold text-[#1e293b]'>
            {activeWeek} <span className='text-xs font-semibold text-[#64748b]'>/ 4 Kali</span>
          </span>
          <span className='text-[10px] text-rose-500 font-medium block mt-0.5'>
            {activeWeek === 4 ? 'Target Terpenuhi' : `${4 - activeWeek} kali lagi`}
          </span>
        </div>
        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center transition-all'>
          <span className='text-[11px] font-medium text-[#64748b] block mb-0.5'>
            Kepatuhan Bulanan
          </span>
          <span
            className={`text-base sm:text-lg font-bold transition-colors ${
              currentPercent === 100
                ? 'text-[#10b981]'
                : currentPercent >= 50
                  ? 'text-[#e11d48]'
                  : 'text-amber-600'
            }`}
          >
            {currentPercent}%
          </span>
          <span className='text-[10px] text-slate-500 font-medium block mt-0.5 flex items-center justify-center gap-1'>
            {currentPercent === 100 && <Sparkles size={11} className='text-emerald-500' />}
            <span>
              {activeWeek === 0
                ? '0 / 4 Dosis'
                : activeWeek === 1
                  ? 'Dosis 1 Terpenuhi'
                  : activeWeek === 2
                    ? 'Dosis 2 Terpenuhi'
                    : activeWeek === 3
                      ? 'Dosis 3 Terpenuhi'
                      : 'Lengkap (4/4 Dosis)'}
            </span>
          </span>
        </div>
      </div>
    </Card>
  );
}
