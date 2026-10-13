export type ReminderStatus = 'PENDING' | 'COMPLETED' | 'MISSED'
export type ReminderType = 'MEDICATION' | 'CHECKUP' | 'EXERCISE' | 'OTHER'

export interface Reminder {
  id: string
  title: string
  description?: string
  time: string // Format HH:mm
  date: string // Format YYYY-MM-DD
  status: ReminderStatus
  type: ReminderType
}

// Untuk daily progress tracker
export interface DailyProgressStats {
  total: number
  completed: number
  pending: number
  missed: number
  percentage: number
}

export interface AdminNudge {
  id: string
  patientId: string
  senderName: string
  senderRole: string
  scheduleId?: string
  medicationName?: string
  dosage?: string
  timeSlot?: string
  message: string
  channel: 'app' | 'whatsapp'
  status: 'UNREAD' | 'READ' | 'DISMISSED'
  sentAt: string
}

export interface AdherenceTrendPoint {
  day: string
  date: string
  adherence: number
  totalReminders: number
  completedReminders: number
}
