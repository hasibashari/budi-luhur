export type ConsumptionStatus = 'ON_TIME' | 'LATE' | 'MISSED' | 'SKIPPED'

export type ConsumptionCategory = 'MEDICATION' | 'CHECKUP' | 'EXERCISE' | 'OTHER'

export interface ConsumptionLog {
  id: string
  reminderId?: string
  title: string
  category: ConsumptionCategory
  dosage?: string
  scheduledDate: string // YYYY-MM-DD
  scheduledTime: string // HH:mm
  takenAt?: string // HH:mm (Waktu aktual diminum/dilakukan)
  status: ConsumptionStatus
  notes?: string
  takenBy?: string
}

export interface ConsumptionStats {
  adherenceRate: number // 0 - 100 percentage
  currentStreakDays: number
  totalCompleted: number
  totalOnTime: number
  totalLate: number
  totalMissed: number
  totalScheduled: number
}

export type DateRangeFilter = '7_DAYS' | '14_DAYS' | '30_DAYS' | 'ALL'
export type CategoryFilter = 'ALL' | ConsumptionCategory
export type StatusFilter = 'ALL' | ConsumptionStatus

export interface MonthlyAdherenceBreakdown {
  monthKey: string; // '2026-01'
  year: number;
  monthIndex: number;
  monthName: string; // 'Januari 2026'
  shortLabel: string; // 'Jan '26'
  takenCount: number;
  missedCount: number;
  pendingCount: number;
  totalScheduled: number;
  adherencePercentage: number;
}

export interface UpcomingPlanDate {
  date: string;
  dayName: string;
  time: string;
  tabletName: string;
  dosage: string;
  instructions: string;
  status: 'UPCOMING_PLANNED';
  monthKey: string;
}

export interface UpcomingMonthlyBreakdown {
  monthKey: string;
  monthName: string;
  shortLabel: string;
  plannedCount: number;
}

export interface YearlyMonitoringData {
  historical: {
    yearlySummary: {
      totalTaken: number;
      totalMissed: number;
      totalPending: number;
      totalScheduled: number;
      adherencePercentage: number;
      adherenceGrade: string;
    };
    monthlyBreakdown: MonthlyAdherenceBreakdown[];
    logs: ConsumptionLog[];
  };
  plan: {
    scheduleInfo: {
      frequency: string;
      dayOfWeek: string;
      time: string;
      tabletName: string;
      dosage: string;
      instructions: string;
    } | null;
    totalPlannedDoses: number;
    monthlyBreakdown: UpcomingMonthlyBreakdown[];
    upcomingDates: UpcomingPlanDate[];
  };
}
