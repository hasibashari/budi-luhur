'use client';

import React from 'react';
import { Flame, CalendarCheck, Activity, Sparkles } from 'lucide-react';
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
  hbLevel,
  riskLevel = 'Rendah',
}: MonthlyEvaluationViewProps) {
  return (
    <div className='flex flex-col gap-6 animate-fade-in'>
      {/* Monthly Bar Chart Component */}
      <ConsumptionChart
        data={[
          { month: 'Mei', count: 4, target: 4 },
          { month: 'Jun', count: 4, target: 4 },
          { month: 'Jul', count: 3, target: 4 },
          { month: 'Agt', count: 4, target: 4 },
          { month: 'Sep', count: 4, target: 4 },
          { month: 'Okt', count: Math.min(4, stats?.totalCompleted || 4), target: 4 },
        ]}
        totalCount={stats?.totalCompleted || 4}
        compliancePercent={stats?.adherenceRate || 95}
      />

      {/* 4-Grid Responsive Milestone Metrics */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3.5'>
        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Flame size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>Streak Kepatuhan</span>
          <span className='text-sm sm:text-base font-extrabold text-[#e11d48]'>
            {streakCount} {streakUnit}
          </span>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-rose-100 text-[#e11d48] flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <CalendarCheck size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>
            Total Tablet Diminum
          </span>
          <span className='text-sm sm:text-base font-extrabold text-[#1e293b]'>
            {stats?.totalCompleted || 0} Tablet
          </span>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Activity size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>Kadar Hb</span>
          <span className={`text-sm sm:text-base font-extrabold ${hbLevel ? 'text-[#10b981]' : 'text-slate-500'}`}>
            {hbLevel ? `${hbLevel} g/dL` : 'Belum Tes'}
          </span>
        </Card>

        <Card padding='md' className='text-center'>
          <div className='w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Sparkles size={18} />
          </div>
          <span className='text-[11px] text-[#64748b] block font-medium'>Status Kebugaran</span>
          <span className='text-sm sm:text-base font-extrabold text-[#9333ea]'>
            {riskLevel === 'Rendah' ? 'Bebas Anemia' : 'Perlu Pendampingan'}
          </span>
        </Card>
      </div>
    </div>
  );
}
