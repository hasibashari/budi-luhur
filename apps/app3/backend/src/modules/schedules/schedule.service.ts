import db from '../../config/database.js';
import { randomUUID } from 'crypto';
import { UserScheduleData } from '../../types/index.js';
import { calculateNextSchedule } from '../../utils/scheduleHelpers.js';

// ─── Domain TT ────────────────────────────────────────────────────────────────

export type TTStage = 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5';

export interface TTScheduleRow {
  id: string;
  patientId: string;
  stage: TTStage;
  title: string;
  scheduledDate: string;
  time: string;
  dosage: string;
  notes: string | null;
  status: 'pending' | 'completed';
  isEnabled: boolean;
  remind15MinBefore: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTTScheduleInput {
  stage: TTStage;
  scheduledDate: string;
  timeSlot: string;
  dosage?: string;
  notes?: string;
  remind15MinBefore?: boolean;
  isEnabled?: boolean;
}

export interface UpdateTTScheduleInput {
  stage?: TTStage;
  scheduledDate?: string;
  time?: string;
  timeSlot?: string;
  dosage?: string;
  notes?: string;
  isEnabled?: boolean;
  remind15MinBefore?: boolean;
  status?: 'pending' | 'completed';
}

const TT_STAGES: readonly TTStage[] = ['TT1', 'TT2', 'TT3', 'TT4', 'TT5'];
const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

function toDateKey(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

function dayNameFromDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return 'Sabtu';
  return INDO_DAYS[date.getUTCDay()];
}

function normalizeStage(value: unknown): TTStage {
  const stage = String(value || 'TT1').toUpperCase() as TTStage;
  return TT_STAGES.includes(stage) ? stage : 'TT1';
}

function mapTTRow(row: any): TTScheduleRow {
  const stage = normalizeStage(row.tt_level);
  return {
    id: row.id,
    patientId: row.user_id,
    stage,
    title: row.tablet_name || `Imunisasi ${stage}`,
    scheduledDate: toDateKey(row.scheduled_date),
    time: row.time_slot || '09:00',
    dosage: row.dosage || '1 dosis (0.5 mL)',
    notes: row.instructions ?? null,
    status: row.status === 'Selesai' ? 'completed' : 'pending',
    isEnabled: row.is_enabled ?? true,
    remind15MinBefore: row.remind_15min_before ?? true,
    completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : '',
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : '',
  };
}

export class ScheduleService {
  // ─── CRUD Jadwal Imunisasi TT ──────────────────────────────────────────────

  /** Ambil semua jadwal TT aktif milik user. */
  static async getSchedules(userId: string): Promise<TTScheduleRow[]> {
    const res = await db.query<any>(
      `SELECT id, user_id, tablet_name, dosage, time_slot, is_enabled, remind_15min_before,
              tt_level, scheduled_date, completed_at, instructions, status, created_at, updated_at
       FROM reminder_schedules
       WHERE user_id = $1 AND status <> 'Diberhentikan'
       ORDER BY scheduled_date ASC NULLS LAST, created_at ASC`,
      [userId],
    );
    return res.rows.map(mapTTRow);
  }

  /** Buat jadwal imunisasi TT baru. */
  static async createSchedule(
    userId: string,
    input: CreateTTScheduleInput,
  ): Promise<TTScheduleRow> {
    const id = `sch_${randomUUID()}`;
    const stage = normalizeStage(input.stage);
    const scheduledDate = toDateKey(input.scheduledDate);
    const timeSlot = input.timeSlot || '09:00';
    const dosage = input.dosage || '1 dosis (0.5 mL)';
    const notes = input.notes || '';
    const dayOfWeek = dayNameFromDate(scheduledDate);

    await db.query(
      `INSERT INTO reminder_schedules (
         id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot,
         is_enabled, remind_15min_before, tt_level, scheduled_date, instructions, status
       ) VALUES ($1, $2, $3, $4, 'weekly', $5, $6, $7, $8, $9, $10, $11, 'Aktif')`,
      [
        id,
        userId,
        `Imunisasi ${stage}`,
        dosage,
        dayOfWeek,
        timeSlot,
        input.isEnabled ?? true,
        input.remind15MinBefore ?? true,
        stage,
        scheduledDate || null,
        notes,
      ],
    );

    await db.query(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`, [
      id,
      timeSlot,
    ]);

    const res = await db.query<any>(
      `SELECT id, user_id, tablet_name, dosage, time_slot, is_enabled, remind_15min_before,
              tt_level, scheduled_date, completed_at, instructions, status, created_at, updated_at
       FROM reminder_schedules WHERE id = $1`,
      [id],
    );
    return mapTTRow(res.rows[0]);
  }

  /** Perbarui jadwal TT (hanya milik user terkait). */
  static async updateTTSchedule(
    scheduleId: string,
    userId: string,
    data: UpdateTTScheduleInput,
  ): Promise<{ success: boolean; data?: TTScheduleRow; error?: string }> {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.stage !== undefined) {
      const stage = normalizeStage(data.stage);
      updates.push(`tt_level = $${idx++}`, `tablet_name = $${idx++}`);
      params.push(stage, `Imunisasi ${stage}`);
    }
    if (data.scheduledDate !== undefined) {
      const dateKey = toDateKey(data.scheduledDate);
      updates.push(`scheduled_date = $${idx++}`, `day_of_week = $${idx++}`);
      params.push(dateKey || null, dayNameFromDate(dateKey));
    }
    const newTime = data.time ?? data.timeSlot;
    if (newTime !== undefined) {
      updates.push(`time_slot = $${idx++}`);
      params.push(newTime);
    }
    if (data.dosage !== undefined) {
      updates.push(`dosage = $${idx++}`);
      params.push(data.dosage);
    }
    if (data.notes !== undefined) {
      updates.push(`instructions = $${idx++}`);
      params.push(data.notes);
    }
    if (data.isEnabled !== undefined) {
      updates.push(`is_enabled = $${idx++}`);
      params.push(data.isEnabled);
    }
    if (data.remind15MinBefore !== undefined) {
      updates.push(`remind_15min_before = $${idx++}`);
      params.push(data.remind15MinBefore);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${idx++}`, `completed_at = $${idx++}`);
      params.push(data.status === 'completed' ? 'Selesai' : 'Aktif');
      params.push(data.status === 'completed' ? new Date() : null);
    }

    if (updates.length === 0) {
      return { success: true };
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(scheduleId, userId);

    const result = await db.query(
      `UPDATE reminder_schedules SET ${updates.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx}`,
      params,
    );

    if (((result as any).rowCount ?? 0) === 0) {
      return { success: false, error: 'Jadwal tidak ditemukan.' };
    }

    const res = await db.query<any>(
      `SELECT id, user_id, tablet_name, dosage, time_slot, is_enabled, remind_15min_before,
              tt_level, scheduled_date, completed_at, instructions, status, created_at, updated_at
       FROM reminder_schedules WHERE id = $1`,
      [scheduleId],
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'Jadwal tidak ditemukan.' };
    }

    return { success: true, data: mapTTRow(res.rows[0]) };
  }

  /** Hapus jadwal TT (soft delete). */
  static async deleteSchedule(
    scheduleId: string,
    userId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const result = await db.query(
      `UPDATE reminder_schedules
       SET status = 'Diberhentikan', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [scheduleId, userId],
    );

    if (((result as any).rowCount ?? 0) === 0) {
      return { success: false, error: 'Jadwal tidak ditemukan.' };
    }
    return { success: true };
  }

  // ─── Jadwal Umum ─────────────────────────────────────────────────────────────

  static async getUserSchedule(userId: string): Promise<UserScheduleData | null> {
    const res = await db.query<{
      id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
      day_of_week: string;
      time_slot: string;
      is_enabled: boolean;
      remind_15min_before: boolean;
      reminder_timing: string;
      channel_push: boolean;
      channel_whatsapp: boolean;
      channel_email: boolean;
      instructions: string | null;
      tt_level: string | null;
    }>(
      `SELECT id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before,
              reminder_timing, channel_push, channel_whatsapp, channel_email, instructions, tt_level
       FROM reminder_schedules
       WHERE user_id = $1 AND status = 'Aktif'
       ORDER BY created_at DESC LIMIT 1`,
      [userId],
    );

    if (res.rows.length === 0) return null;
    const sch = res.rows[0];
    const dayOfWeek = sch.day_of_week || 'Sabtu';
    const timeSlot = sch.time_slot || '20:00';
    const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

    return {
      id: sch.id,
      patientId: userId,
      tabletName: sch.tablet_name || 'Vaksin Tetanus Toxoid (TT)',
      dosage: sch.dosage || '1 dosis (0.5 mL)',
      frequency: sch.frequency === 'daily' ? 'Harian' : 'Sesuai Jadwal',
      category: sch.tt_level ? `Imunisasi ${sch.tt_level}` : 'Imunisasi TT',
      dayOfWeek,
      time: timeSlot,
      isEnabled: sch.is_enabled,
      remind15MinBefore: sch.remind_15min_before,
      reminderTiming: sch.reminder_timing,
      channelPush: sch.channel_push,
      channelWhatsapp: sch.channel_whatsapp,
      channelEmail: sch.channel_email,
      instructions:
        sch.instructions ||
        'Kunjungi fasilitas kesehatan (Puskesmas/Klinik) untuk penyuntikan vaksin TT.',
      nextDate,
      daysRemaining,
    };
  }

  static async updateScheduleSettings(scheduleId: string, data: any) {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    if (data.dayOfWeek !== undefined) {
      updates.push(`day_of_week = $${idx++}`);
      params.push(data.dayOfWeek);
    }
    if (data.time !== undefined) {
      updates.push(`time_slot = $${idx++}`);
      params.push(data.time);
    }
    if (data.frequency !== undefined) {
      const freq = data.frequency.includes('Hari') ? 'daily' : 'weekly';
      updates.push(`frequency = $${idx++}`);
      params.push(freq);
    }
    if (data.isEnabled !== undefined) {
      updates.push(`is_enabled = $${idx++}`);
      params.push(data.isEnabled);
    }
    if (data.remind15MinBefore !== undefined) {
      updates.push(`remind_15min_before = $${idx++}`);
      params.push(data.remind15MinBefore);
    }
    if (data.reminderTiming !== undefined) {
      updates.push(`reminder_timing = $${idx++}`);
      params.push(data.reminderTiming);
    }
    if (data.channelPush !== undefined) {
      updates.push(`channel_push = $${idx++}`);
      params.push(data.channelPush);
    }
    if (data.channelWhatsapp !== undefined) {
      updates.push(`channel_whatsapp = $${idx++}`);
      params.push(data.channelWhatsapp);
    }
    if (data.channelEmail !== undefined) {
      updates.push(`channel_email = $${idx++}`);
      params.push(data.channelEmail);
    }

    if (updates.length === 0) return { success: true };

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(scheduleId);

    await db.query(
      `UPDATE reminder_schedules SET ${updates.join(', ')} WHERE id = $${idx}`,
      params,
    );

    return { success: true, message: 'Jadwal berhasil diperbarui.' };
  }

  static async getActiveNudge(userId: string) {
    const res = await db.query<{
      id: string;
      user_id: string;
      sender_id: string | null;
      sender_name: string | null;
      schedule_id: string | null;
      title: string;
      message: string;
      channel: string;
      status: string;
      created_at: Date;
    }>(
      `SELECT n.id, n.user_id, n.sender_id, u.name as sender_name, n.schedule_id, 
              n.title, n.message, n.channel, n.status, n.created_at
       FROM admin_nudges n
       LEFT JOIN users u ON n.sender_id = u.id
       WHERE n.user_id = $1 AND n.status = 'UNREAD'
       ORDER BY n.created_at DESC LIMIT 1`,
      [userId],
    );

    if (res.rows.length === 0) return null;
    const row = res.rows[0];

    return {
      id: row.id,
      patientId: row.user_id,
      senderName: row.sender_name || 'Petugas Faskes',
      senderRole: 'Tenaga Kesehatan',
      scheduleId: row.schedule_id || undefined,
      medicationName: 'Imunisasi Tetanus Toxoid (TT)',
      dosage: '1 dosis (0.5 mL)',
      timeSlot: '09:00',
      message: row.message,
      channel: (row.channel as 'app' | 'whatsapp') || 'app',
      status: row.status as 'UNREAD' | 'READ' | 'DISMISSED',
      sentAt:
        row.created_at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
  }

  static async dismissNudge(nudgeId: string) {
    await db.query(`UPDATE admin_nudges SET status = 'DISMISSED' WHERE id = $1`, [nudgeId]);
    return { success: true };
  }
}
