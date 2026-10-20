'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

export function ConsumptionChart({ data, totalCount, compliancePercent, loading = false }: ConsumptionChartProps) {
  return (
    <Card padding='md' className='w-full border-slate-200/80 shadow-xs bg-white'>
      <div className='mb-4'>
        <h4 className='text-sm sm:text-base font-bold text-slate-800'>Grafik Kepatuhan Minum Pil KB</h4>
        <p className='text-xs text-slate-500'>Kepatuhan berdasarkan catatan konsumsi aktual</p>
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
                <linearGradient id='consumption-fill-pilluna' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#0d9488' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#0d9488' stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#ccfbf1' />
              <XAxis dataKey='label' tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={value => {
                  const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                  return [`${Number.isFinite(numericValue) ? numericValue : 0}%`, 'Kepatuhan'];
                }}
                labelFormatter={label => `Tanggal ${label}`}
                contentStyle={{ borderRadius: 12, borderColor: '#ccfbf1', fontSize: 12 }}
              />
              <Area type='monotone' dataKey='completionRate' name='Kepatuhan' stroke='#0d9488' strokeWidth={2} fill='url(#consumption-fill-pilluna)' />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className='grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100'>
        <div className='bg-teal-50 rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-slate-500 block'>Total Selesai</span>
          <span className='text-base font-bold text-slate-800'>{totalCount} Kali</span>
        </div>
        <div className='bg-teal-50 rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-slate-500 block'>Kepatuhan</span>
          <span className='text-base font-bold text-teal-700'>{compliancePercent}%</span>
        </div>
      </div>
    </Card>
  );
}
