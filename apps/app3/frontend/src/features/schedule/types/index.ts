// ─── Tetanus Toxoid (TT) Schedule Types ─────────────────────────────────────

export type TTStage = 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5';

/** `pending` = belum dilaksanakan, `completed` = sudah divaksin. */
export type TTScheduleStatus = 'pending' | 'completed';

export interface TTSchedule {
  id: string;
  patientId: string;
  stage: TTStage;
  /** Nama kegiatan, mis. "Imunisasi TT2". */
  title: string;
  /** Tanggal jadwal imunisasi (YYYY-MM-DD). */
  scheduledDate: string;
  /** Jam kunjungan/pengingat (HH:mm, 24 jam). */
  time: string;
  dosage: string;
  notes?: string;
  status: TTScheduleStatus;
  isEnabled: boolean;
  remind15MinBefore: boolean;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** Payload pembuatan jadwal TT. */
export interface CreateTTSchedulePayload {
  stage: TTStage;
  scheduledDate: string;
  timeSlot: string;
  dosage?: string;
  notes?: string;
  remind15MinBefore?: boolean;
  isEnabled?: boolean;
}

/** Payload pembaruan jadwal TT. */
export interface UpdateTTSchedulePayload {
  stage?: TTStage;
  scheduledDate?: string;
  /** Alias `time` yang dikirim frontend. */
  timeSlot?: string;
  dosage?: string;
  notes?: string;
  remind15MinBefore?: boolean;
  isEnabled?: boolean;
  status?: TTScheduleStatus;
}

export interface ScheduleActionResult {
  success: boolean;
  data?: TTSchedule;
  error?: string;
}

// ─── Admin Nudge (dipakai DashboardView) ────────────────────────────────────

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

