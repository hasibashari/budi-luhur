'use client';

import React from 'react';
import { Flame, CalendarCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '@/src/shared/components/ui/Card';
import { ConsumptionChart } from '@/src/shared/components/domain/ConsumptionChart';
import { ConsumptionStats } from '../types';

export interface MonthlyEvaluationViewProps {
  stats: ConsumptionStats | null;
  streakCount: number;
  streakUnit: string;
  hbLevel?: number | null;
  riskLevel?: string | null;
}

export function MonthlyEvaluationView({
  stats,
  streakCount,
  streakUnit,
  riskLevel = 'Rendah',
}: MonthlyEvaluationViewProps) {
  return (
    <div className='flex flex-col gap-6 animate-fade-in'>
      {/* Monthly Bar Chart Component */}
      <ConsumptionChart
        data={[
          { month: 'Mei', count: 28, target: 28 },
          { month: 'Jun', count: 28, target: 28 },
          { month: 'Jul', count: 26, target: 28 },
          { month: 'Agt', count: 28, target: 28 },
          { month: 'Sep', count: 28, target: 28 },
          { month: 'Okt', count: Math.min(28, stats?.totalCompleted || 28), target: 28 },
        ]}
        totalCount={stats?.totalCompleted || 28}
        compliancePercent={stats?.adherenceRate || 98}
      />

      {/* 4-Grid Responsive Milestone Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3.5'>
        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2 border border-orange-100'>
            <Flame size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Streak Kepatuhan</span>
          <span className='text-sm sm:text-base font-extrabold text-orange-600'>
            {streakCount} {streakUnit}
          </span>
        </Card>

        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 border border-teal-100'>
            <CalendarCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>
            Total Pil Diminum
          </span>
          <span className='text-sm sm:text-base font-extrabold text-slate-800'>
            {stats?.totalCompleted || 0} Butir
          </span>
        </Card>

        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-2 border border-teal-100'>
            <ShieldCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Tingkat Proteksi</span>
          <span className='text-sm sm:text-base font-extrabold text-teal-700'>
            {(stats?.adherenceRate || 95) >= 80 ? 'Optimal (99%)' : 'Perlu Konsistensi'}
          </span>
        </Card>

        <Card padding='md' className='text-center border-slate-200/80 shadow-xs bg-white'>
          <div className='w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2 border border-slate-200'>
            <Sparkles size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Status Risiko Hamil</span>
          <span className='text-sm sm:text-base font-extrabold text-slate-800'>
            {riskLevel === 'Rendah' ? 'Sangat Rendah (<1%)' : 'Perlu Konsultasi Bidan'}
          </span>
        </Card>
      </div>
    </div>
  );
}
