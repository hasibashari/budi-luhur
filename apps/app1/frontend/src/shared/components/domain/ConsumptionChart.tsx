'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../ui/Card';

export interface ConsumptionTrendItem {
  label: string;
  completed: number;
  scheduled: number;
  completionRate: number;
}

export interface ConsumptionChartProps {
  data: ConsumptionTrendItem[];
  totalCount: number;
  compliancePercent: number;
  loading?: boolean;
}

export function ConsumptionChart({
  data,
  totalCount,
  compliancePercent,
  loading = false,
}: ConsumptionChartProps) {
  return (
    <Card padding='md' className='w-full'>
      <div className='mb-4'>
        <h4 className='text-sm sm:text-base font-bold text-[#1e293b]'>Grafik Konsumsi TTD</h4>
        <p className='text-xs text-[#64748b]'>Kepatuhan berdasarkan catatan konsumsi aktual</p>
      </div>
      {loading ? (
        <div className='h-56 animate-pulse rounded-xl bg-slate-100' />
      ) : data.length === 0 ? (
        <div className='h-56 flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-sm text-slate-500'>
          Belum ada data konsumsi untuk ditampilkan.
        </div>
      ) : (
        <div className='h-56 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='consumption-fill' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#e11d48' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#e11d48' stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#fce7f3' />
              <XAxis dataKey='label' tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={value => {
                  const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                  return [`${Number.isFinite(numericValue) ? numericValue : 0}%`, 'Kepatuhan'];
                }}
                labelFormatter={label => `Tanggal ${label}`}
                contentStyle={{ borderRadius: 12, borderColor: '#fce7f3', fontSize: 12 }}
              />
              <Area
                type='monotone'
                dataKey='completionRate'
                name='Kepatuhan'
                stroke='#e11d48'
                strokeWidth={2}
                fill='url(#consumption-fill)'
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className='grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-[#fce7f3]'>
        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-[#64748b] block'>Total Selesai</span>
          <span className='text-base font-bold text-[#1e293b]'>{totalCount} Kali</span>
        </div>
        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-[#64748b] block'>Kepatuhan</span>
          <span className='text-base font-bold text-[#10b981]'>{compliancePercent}%</span>
        </div>
      </div>
    </Card>
  );
}
