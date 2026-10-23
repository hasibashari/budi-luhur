// ─── Admin Nudge Types (tetap digunakan oleh DashboardView) ──────────────────

export interface AdminNudge {
  id: string;
  patientId: string;
  senderName: string;
  senderRole: string;
  scheduleId?: string;
  medicationName?: string;
  dosage?: string;
  timeSlot?: string;
  message: string;
  channel: 'app' | 'whatsapp';
  status: 'UNREAD' | 'READ' | 'DISMISSED';
  sentAt: string;
}

// ─── Daily Schedule type definition untuk App 2 (jadwal harian - bukan mingguan)
export interface DailySchedule {
  id: string;
  patientId: string;
  title: string;         // Nama kegiatan / pengingat
  time: string;          // Format HH:mm (24 jam)
  isEnabled: boolean;    // Status aktif/nonaktif
  notes?: string;        // Catatan opsional
  remind15MinBefore: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Payload untuk membuat jadwal baru
export interface CreateDailySchedulePayload {
  title: string;
  timeSlot: string;      // Format HH:mm
  isEnabled?: boolean;
  notes?: string;
  remind15MinBefore?: boolean;
}

// Payload untuk memperbarui jadwal
export interface UpdateDailySchedulePayload {
  title?: string;
  time?: string;     // Field dari DB (time_slot)
  timeSlot?: string; // Alias yang dikirim dari frontend
  isEnabled?: boolean;
  notes?: string;
  remind15MinBefore?: boolean;
}

// Response dari API action
export interface ScheduleActionResult {
  success: boolean;
  data?: DailySchedule;
  error?: string;
}
