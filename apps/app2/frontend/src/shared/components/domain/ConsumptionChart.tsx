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
    <Card padding='md' className='w-full'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h4 className='text-sm sm:text-base font-bold text-[#1e293b]'>Grafik Konsumsi TTD</h4>
          <p className='text-xs text-[#64748b]'>Histori kepatuhan 6 bulan terakhir</p>
        </div>
        <span className='text-xs font-bold text-[#e11d48] bg-[#ffe4e6] px-2.5 py-1 rounded-full'>
          Target: 4x / bln
        </span>
      </div>

      {/* Chart Visual Area */}
      <div className='relative pt-6 pb-2'>
        {/* Dashed Target Line */}
        <div className='absolute top-6 left-0 right-0 border-b border-dashed border-rose-300 flex justify-end'>
          <span className='text-[10px] text-rose-500 font-bold bg-white/90 px-1 -mt-2'>
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
                <span className='text-[11px] font-bold text-[#1e293b] mb-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                  {item.count}x
                </span>

                <div className='w-full max-w-[32px] bg-rose-100 rounded-t-lg h-28 relative flex items-end overflow-hidden'>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isFull
                        ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                        : 'bg-gradient-to-t from-rose-500 to-rose-300'
                    }`}
                  />
                </div>

                <span
                  className={`text-xs mt-2 font-semibold ${
                    idx === data.length - 1 ? 'text-[#e11d48] font-bold' : 'text-[#64748b]'
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
      <div className='grid grid-cols-2 gap-2.5 mt-4 pt-3 border-t border-[#fce7f3]'>
        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-[#64748b] block'>Total Bulan Ini</span>
          <span className='text-base font-bold text-[#1e293b]'>{totalCount} Kali</span>
        </div>

        <div className='bg-[#fff5f7] rounded-xl p-2.5 text-center'>
          <span className='text-[11px] font-medium text-[#64748b] block'>Kepatuhan Rata-rata</span>
          <span className='text-base font-bold text-[#10b981]'>{compliancePercent}%</span>
        </div>
      </div>
    </Card>
  );
}
