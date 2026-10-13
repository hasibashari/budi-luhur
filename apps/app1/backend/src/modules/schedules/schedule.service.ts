import db from '../../config/database.js';
import { UserScheduleData } from '../../types/index.js';
import { calculateNextSchedule } from '../../utils/scheduleHelpers.js';

export class ScheduleService {
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
      instructions: string | null;
    }>(
      `SELECT id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions
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
      tabletName: sch.tablet_name || 'Tablet Tambah Darah (TTD)',
      dosage: sch.dosage || '1 tablet, 1x seminggu',
      frequency: sch.frequency === 'daily' ? 'Harian' : 'Mingguan',
      category: sch.frequency === 'daily' ? 'Terapi Anemia' : 'TTD Rutin',
      dayOfWeek,
      time: timeSlot,
      isEnabled: sch.is_enabled,
      remind15MinBefore: sch.remind_15min_before,
      instructions: sch.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
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
