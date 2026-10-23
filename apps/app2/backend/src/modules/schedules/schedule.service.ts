import { randomUUID } from 'crypto';
import db from '../../config/database.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DailyScheduleRow {
  id: string;
  patientId: string;
  title: string;
  time: string;
  isEnabled: boolean;
  notes: string | null;
  remind15MinBefore: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScheduleInput {
  title: string;
  timeSlot: string;
  isEnabled?: boolean;
  notes?: string;
  remind15MinBefore?: boolean;
  frequency?: string;
}

export interface UpdateScheduleInput {
  title?: string;
  time?: string;
  timeSlot?: string;
  isEnabled?: boolean;
  notes?: string;
  remind15MinBefore?: boolean;
  dayOfWeek?: string;
  frequency?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function mapRow(row: any): DailyScheduleRow {
  return {
    id: row.id,
    patientId: row.user_id,
    title: row.tablet_name || row.title || 'Jadwal Harian',
    time: row.time_slot || '20:00',
    isEnabled: row.is_enabled ?? true,
    notes: row.instructions || null,
    remind15MinBefore: row.remind_15min_before ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ScheduleService {
  /**
   * Ambil semua jadwal harian milik user (status Aktif).
   */
  static async getDailySchedules(userId: string): Promise<DailyScheduleRow[]> {
    const res = await db.query<any>(
      `SELECT id, user_id, tablet_name, time_slot, is_enabled, remind_15min_before, instructions, created_at, updated_at
       FROM reminder_schedules
       WHERE user_id = $1 AND status = 'Aktif'
       ORDER BY created_at ASC`,
      [userId],
    );
    return res.rows.map(mapRow);
  }

  /**
   * Buat jadwal harian baru.
   */
  static async createSchedule(userId: string, input: CreateScheduleInput): Promise<DailyScheduleRow> {
    const id = randomUUID();
    const {
      title,
      timeSlot,
      isEnabled = true,
      notes = '',
      remind15MinBefore = true,
      frequency = 'daily',
    } = input;

    await db.query(
      `INSERT INTO reminder_schedules
         (id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status)
       VALUES ($1, $2, $3, '1 unit', $4, 'Setiap Hari', $5, $6, $7, $8, 'Aktif')`,
      [id, userId, title, frequency, timeSlot, isEnabled, remind15MinBefore, notes || ''],
    );

    const res = await db.query<any>(
      `SELECT id, user_id, tablet_name, time_slot, is_enabled, remind_15min_before, instructions, created_at, updated_at
       FROM reminder_schedules WHERE id = $1`,
      [id],
    );
    return mapRow(res.rows[0]);
  }

  /**
   * Perbarui jadwal berdasarkan ID.
   */
  static async updateSchedule(scheduleId: string, data: UpdateScheduleInput) {
    const updates: string[] = [];
    const params: any[] = [];
    let idx = 1;

    // Support both `title` and `tablet_name`
    if (data.title !== undefined) {
      updates.push(`tablet_name = $${idx++}`);
      params.push(data.title);
    }
    // Support both `time` and `timeSlot`
    const newTime = data.time ?? data.timeSlot;
    if (newTime !== undefined) {
      updates.push(`time_slot = $${idx++}`);
      params.push(newTime);
    }
    if (data.isEnabled !== undefined) {
      updates.push(`is_enabled = $${idx++}`);
      params.push(data.isEnabled);
    }
    if (data.remind15MinBefore !== undefined) {
      updates.push(`remind_15min_before = $${idx++}`);
      params.push(data.remind15MinBefore);
    }
    if (data.notes !== undefined) {
      updates.push(`instructions = $${idx++}`);
      params.push(data.notes);
    }
    if (data.dayOfWeek !== undefined) {
      updates.push(`day_of_week = $${idx++}`);
      params.push(data.dayOfWeek);
    }
    if (data.frequency !== undefined) {
      const freq = data.frequency.toLowerCase().includes('hari') ? 'daily' : data.frequency;
      updates.push(`frequency = $${idx++}`);
      params.push(freq);
    }

    if (updates.length === 0) return { success: true, message: 'Tidak ada perubahan.' };

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(scheduleId);

    await db.query(
      `UPDATE reminder_schedules SET ${updates.join(', ')} WHERE id = $${idx}`,
      params,
    );

    // Return updated row
    const res = await db.query<any>(
      `SELECT id, user_id, tablet_name, time_slot, is_enabled, remind_15min_before, instructions, created_at, updated_at
       FROM reminder_schedules WHERE id = $1`,
      [scheduleId],
    );

    if (res.rows.length === 0) {
      return { success: false, error: 'Jadwal tidak ditemukan.' };
    }

    return { success: true, data: mapRow(res.rows[0]) };
  }

  /**
   * Hapus jadwal secara soft delete (set status = 'Diberhentikan').
   */
  static async deleteSchedule(scheduleId: string, userId: string) {
    const res = await db.query(
      `UPDATE reminder_schedules SET status = 'Diberhentikan', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND user_id = $2`,
      [scheduleId, userId],
    );
    const affected = (res as any).rowCount ?? 0;
    if (affected === 0) {
      return { success: false, error: 'Jadwal tidak ditemukan atau tidak bisa dihapus.' };
    }
    return { success: true };
  }

  // ─── Admin Nudge ────────────────────────────────────────────────────────────

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
      senderName: row.sender_name || 'Fasilitator Medis FEMORY',
      senderRole: 'Fasilitator Kesehatan UKS',
      scheduleId: row.schedule_id || undefined,
      medicationName: 'Tablet Tambah Darah (TTD)',
      dosage: '1 tablet',
      timeSlot: '20:00',
      message: row.message,
      channel: (row.channel as 'app' | 'whatsapp') || 'app',
      status: row.status as 'UNREAD' | 'READ' | 'DISMISSED',
      sentAt: row.created_at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    };
  }

  static async dismissNudge(nudgeId: string) {
    await db.query(`UPDATE admin_nudges SET status = 'DISMISSED' WHERE id = $1`, [nudgeId]);
    return { success: true };
  }
}
