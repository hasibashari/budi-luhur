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
  totalCount = 28,
  compliancePercent = 98,
}: ConsumptionChartProps) {
  const maxTarget = 28;

  return (
    <Card padding='md' className='w-full border-slate-200/80 shadow-xs bg-white'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-slate-800'>Grafik Kepatuhan Minum Pil KB</h4>
          <p className='text-xs text-slate-500'>Histori kepatuhan konsumsi 6 bulan terakhir</p>
        </div>
        <span className='text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-full'>
          Target: Rutin Tiap Hari
        </span>
      </div>

      {/* Chart Visual Area */}
      <div className='relative pt-6 pb-2'>
        {/* Dashed Target Line */}
        <div className='absolute top-6 left-0 right-0 border-b border-dashed border-teal-300 flex justify-end'>
          <span className='text-[10px] text-teal-700 font-bold bg-white/95 px-1.5 -mt-2 rounded'>
            Target 100% Proteksi
          </span>
        </div>

        {/* Vertical Bars Grid */}
        <div className='grid grid-cols-6 gap-2 sm:gap-3 items-end h-36 pt-4'>
          {data.map((item, idx) => {
            const heightPercent = Math.min(100, Math.round((item.count / maxTarget) * 100));
            const isFull = item.count >= item.target;

            return (
              <div key={item.month} className='flex flex-col items-center h-full justify-end group'>
                <span className='text-[11px] font-bold text-slate-800 mb-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {item.count} butir
                </span>

                <div className='w-full max-w-[32px] bg-slate-100 border border-slate-200 rounded-t-lg h-28 relative flex items-end overflow-hidden'>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isFull
                        ? 'bg-gradient-to-t from-teal-700 to-teal-500'
                        : 'bg-gradient-to-t from-teal-500 to-teal-300'
                    }`}
                  />
                </div>

                <span
                  className={`text-xs mt-2 font-semibold ${
                    idx === data.length - 1 ? 'text-teal-700 font-bold' : 'text-slate-500'
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
      <div className='grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-slate-100'>
        <div className='bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-slate-500 block'>Total Pil Bulan Ini</span>
          <span className='text-base font-bold text-slate-800'>{totalCount} Butir</span>
        </div>

        <div className='bg-teal-50/60 border border-teal-100 rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-teal-800 block'>Kepatuhan Rata-rata</span>
          <span className='text-base font-bold text-teal-700'>{compliancePercent}%</span>
        </div>
      </div>
    </Card>
  );
}
