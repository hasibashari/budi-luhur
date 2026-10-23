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
