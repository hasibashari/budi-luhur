'use client';

import { TTVaccineBarChart } from './TTVaccineBarChart';
import { ConsumptionLog, ConsumptionStats } from '../types';
import { ImmunizationRecord } from '@/src/features/user/types';
import { TTSchedule } from '@/src/features/schedule/types';

export interface MonthlyEvaluationViewProps {
  stats?: ConsumptionStats | null;
  streakCount?: number;
  streakUnit?: string;
  logs: ConsumptionLog[];
  records?: ImmunizationRecord[];
  schedules?: TTSchedule[];
}

export function MonthlyEvaluationView({
  logs,
  records = [],
  schedules = [],
}: MonthlyEvaluationViewProps) {
  return (
    <div className='animate-fade-in'>
      {/* TTVaccineBarChart Diagram Batang */}
      <TTVaccineBarChart records={records} schedules={schedules} logs={logs} />
    </div>
  );
}

export default MonthlyEvaluationView;
