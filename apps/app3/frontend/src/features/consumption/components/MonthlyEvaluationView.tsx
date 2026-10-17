'use client';

import React from 'react';
import { ShieldCheck, CalendarCheck, Activity, Award } from 'lucide-react';
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
      {/* Monthly Chart Component */}
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
        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <ShieldCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Disiplin Kunjungan</span>
          <span className='text-sm sm:text-base font-bold text-slate-900'>
            {streakCount} {streakUnit}
          </span>
        </Card>

        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <CalendarCheck size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>
            Aktivitas Terverifikasi
          </span>
          <span className='text-sm sm:text-base font-bold text-slate-900'>
            {stats?.totalCompleted || 0} Sesi
          </span>
        </Card>

        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Activity size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Kadar Hb Darah</span>
          <span className={`text-sm sm:text-base font-bold ${hbLevel ? 'text-emerald-700' : 'text-slate-500'}`}>
            {hbLevel ? `${hbLevel} g/dL` : 'Belum Tes'}
          </span>
        </Card>

        <Card padding='md' className='text-center border-stone-200'>
          <div className='w-9 h-9 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-2 shadow-xs'>
            <Award size={18} />
          </div>
          <span className='text-[11px] text-slate-500 block font-medium'>Status Kesiapan</span>
          <span className='text-sm sm:text-base font-bold text-emerald-700'>
            {riskLevel === 'Rendah' ? 'Optimal (Siap Nikah)' : 'Perlu Pendampingan'}
          </span>
        </Card>
      </div>
    </div>
  );
}

export default MonthlyEvaluationView;
