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
    <Card padding='md' className='w-full border-stone-200'>
      <div className='mb-4'>
        <h4 className='text-sm sm:text-base font-bold text-slate-900'>Grafik Kepatuhan Imunisasi & Suplementasi</h4>
        <p className='text-xs text-slate-500'>Kepatuhan berdasarkan catatan aktual</p>
      </div>
      {loading ? (
        <div className='h-56 animate-pulse rounded-xl bg-stone-100' />
      ) : data.length === 0 ? (
        <div className='h-56 flex items-center justify-center rounded-xl border border-dashed border-stone-200 text-sm text-slate-500'>
          Belum ada data konsumsi untuk ditampilkan.
        </div>
      ) : (
        <div className='h-56 w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id='consumption-fill-preluna' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='#059669' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='#059669' stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#d1fae5' />
              <XAxis dataKey='label' tick={{ fontSize: 10, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip
                formatter={value => {
                  const numericValue = Array.isArray(value) ? Number(value[0] ?? 0) : Number(value ?? 0);
                  return [`${Number.isFinite(numericValue) ? numericValue : 0}%`, 'Kepatuhan'];
                }}
                labelFormatter={label => `Tanggal ${label}`}
                contentStyle={{ borderRadius: 12, borderColor: '#d1fae5', fontSize: 12 }}
              />
              <Area type='monotone' dataKey='completionRate' name='Kepatuhan' stroke='#059669' strokeWidth={2} fill='url(#consumption-fill-preluna)' />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className='grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-stone-100'>
        <div className='bg-emerald-50 rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-slate-500 block'>Total Selesai</span>
          <span className='text-base font-bold text-slate-900'>{totalCount} Kali</span>
        </div>
        <div className='bg-emerald-50 rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-slate-500 block'>Kepatuhan</span>
          <span className='text-base font-bold text-emerald-700'>{compliancePercent}%</span>
        </div>
      </div>
    </Card>
  );
}
