'use client';

import React from 'react';
import { Card } from '../ui/Card';

export interface MonthlyTrendItem {
  month: string;
  count: number;
  target: number;
}

export interface ConsumptionChartProps {
  data: MonthlyTrendItem[];
  totalCount?: number;
  compliancePercent?: number;
}

export function ConsumptionChart({
  data,
  totalCount = 4,
  compliancePercent = 95,
}: ConsumptionChartProps) {
  const maxTarget = 4;

  return (
    <Card padding='md' className='w-full border-stone-200'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-slate-900'>Grafik Kepatuhan Imunisasi & Suplementasi</h4>
          <p className='text-xs text-slate-500'>Histori kepatuhan kunjungan faskes 6 bulan terakhir</p>
        </div>
        <span className='text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200'>
          Standar Kemenkes RI
        </span>
      </div>

      {/* Chart Visual Area */}
      <div className='relative pt-6 pb-2'>
        {/* Dashed Target Line */}
        <div className='absolute top-6 left-0 right-0 border-b border-dashed border-emerald-300 flex justify-end'>
          <span className='text-[10px] text-emerald-700 font-bold bg-white px-1 -mt-2'>
            Target 100%
          </span>
        </div>

        {/* Vertical Bars Grid */}
        <div className='grid grid-cols-6 gap-2 sm:gap-3 items-end h-36 pt-4'>
          {data.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.count / maxTarget) * 100));
            const isFull = item.count >= item.target;

            return (
              <div key={item.month} className='flex flex-col items-center h-full justify-end group'>
                <span className='text-[11px] font-bold text-slate-900 mb-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {item.count}x
                </span>

                <div className='w-full max-w-[32px] bg-emerald-50 rounded-t-lg h-28 relative flex items-end overflow-hidden border border-emerald-100'>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isFull
                        ? 'bg-linear-to-t from-emerald-700 to-emerald-500'
                        : 'bg-linear-to-t from-emerald-600 to-teal-400'
                    }`}
                  />
                </div>

                <span
                  className={`text-xs mt-2 font-semibold ${
                    idx === data.length - 1 ? 'text-emerald-700 font-bold' : 'text-slate-500'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Metrics 2-column */}
      <div className='grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-stone-100'>
        <div className='bg-stone-50 rounded-xl p-2.5 text-center border border-stone-100'>
          <span className='text-[11px] font-medium text-slate-500 block'>Total Aktivitas Periode Ini</span>
          <span className='text-base font-bold text-slate-900'>{totalCount} Kali</span>
        </div>

        <div className='bg-emerald-50/50 rounded-xl p-2.5 text-center border border-emerald-100'>
          <span className='text-[11px] font-medium text-emerald-800 block'>Kepatuhan Rata-rata</span>
          <span className='text-base font-bold text-emerald-700'>{compliancePercent}%</span>
        </div>
      </div>
    </Card>
  );
}

export default ConsumptionChart;
