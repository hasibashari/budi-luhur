import db from '../../../config/database.js';

export interface MedicationSchedule {
  id: string;
  userId: string;
  userName: string;
  patientId?: string;
  patientName?: string;
  medicationName: string;
  dosage: string;
  frequency: '1x Seminggu' | 'Harian' | string;
  dayOfWeek?: string;
  timeSlots: string[];
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Selesai' | 'Diberhentikan';
  category: 'Pil KB Kombinasi' | 'Pil KB Progestin' | 'Suplemen Tambahan';
  instructions: string;
  lastReminderSent?: string;
  todayStatus?: 'COMPLETED' | 'PENDING' | 'NOT_YET_TIME' | 'OFF_SCHEDULE' | 'MISSED';
}

export class AdminScheduleService {
  static async getSchedules(): Promise<MedicationSchedule[]> {
    const res = await db.query<any>(`
      SELECT 
        s.id, s.user_id, s.tablet_name, s.dosage, s.frequency, s.day_of_week, s.time_slot, s.status, s.instructions, s.created_at,
        u.name as user_name
      FROM reminder_schedules s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `);
    const rows = res.rows;

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const logsRes = await db.query<any>(
      `SELECT user_id, schedule_id, status, scheduled_date, taken_at 
       FROM consumption_logs 
       WHERE scheduled_date = $1 OR scheduled_date >= CURRENT_DATE - INTERVAL '6 days'
       ORDER BY scheduled_date DESC`,
      [todayStr],
    );
    const recentLogs = logsRes.rows;

    const allSlotsRes = await db.query<any>(
      `SELECT schedule_id, time FROM schedule_time_slots ORDER BY time ASC`,
    );
    const slotsByScheduleId: Record<string, string[]> = {};
    for (const slot of allSlotsRes.rows) {
      if (!slotsByScheduleId[slot.schedule_id]) {
        slotsByScheduleId[slot.schedule_id] = [];
      }
      slotsByScheduleId[slot.schedule_id].push(slot.time);
    }

    const result: MedicationSchedule[] = [];

    for (const r of rows) {
      const customSlots = slotsByScheduleId[r.id];
      const slots = customSlots && customSlots.length > 0 ? customSlots : [r.time_slot || '20:00'];

      const isDaily =
        r.frequency === 'daily' ||
        r.frequency === 'Harian' ||
        (r.day_of_week || '').toLowerCase().includes('setiap hari') ||
        (r.day_of_week || '').toLowerCase().includes('harian');
      const isSupplement =
        (r.tablet_name || '').toLowerCase().includes('vitamin') ||
        (r.tablet_name || '').toLowerCase().includes('suplemen');
      const isProgestin = (r.tablet_name || '').toLowerCase().includes('progestin');
      const category: MedicationSchedule['category'] = isSupplement
        ? 'Suplemen Tambahan'
        : isProgestin
          ? 'Pil KB Progestin'
          : 'Pil KB Kombinasi';

      const log = isDaily
        ? recentLogs.find(
            (l: any) =>
              l.user_id === r.user_id &&
              (l.schedule_id === r.id || !l.schedule_id) &&
              (typeof l.scheduled_date === 'string'
                ? l.scheduled_date.startsWith(todayStr)
                : new Date(l.scheduled_date).toISOString().split('T')[0] === todayStr),
          )
        : recentLogs.find(
            (l: any) => l.user_id === r.user_id && (l.schedule_id === r.id || !l.schedule_id),
          );

      const isCompleted = log && (log.status === 'ON_TIME' || log.status === 'LATE');
      const todayStatus: 'COMPLETED' | 'PENDING' = isCompleted ? 'COMPLETED' : 'PENDING';

      result.push({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name || 'Akseptor Pilluna',
        patientId: r.user_id,
        patientName: r.user_name || 'Akseptor Pilluna',
        medicationName: r.tablet_name || 'Pil KB Kombinasi (28 Tablet)',
        dosage: r.dosage || '1 tablet',
        frequency: isDaily ? 'Harian' : '1x Seminggu',
        dayOfWeek: r.day_of_week || 'Setiap Hari',
        timeSlots: slots,
        startDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
        endDate: '2026-12-31',
        status: r.status,
        category,
        instructions:
          r.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
        lastReminderSent: `${r.day_of_week || 'Setiap Hari'}, ${r.time_slot || '20:00'} WIB`,
        todayStatus,
      });
    }

    return result;
  }

  static async getScheduleById(scheduleId: string): Promise<MedicationSchedule | null> {
    const res = await db.query<any>(
      `SELECT 
        s.id, s.user_id, s.tablet_name, s.dosage, s.frequency, s.day_of_week, s.time_slot, s.status, s.instructions, s.created_at,
        u.name as user_name
      FROM reminder_schedules s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = $1
      LIMIT 1`,
      [scheduleId],
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    const slotsRes = await db.query<any>(
      `SELECT time FROM schedule_time_slots WHERE schedule_id = $1 ORDER BY time ASC`,
      [scheduleId],
    );
    const slots =
      slotsRes.rows.length > 0 ? slotsRes.rows.map((s: any) => s.time) : [r.time_slot || '20:00'];

    const isDaily =
      r.frequency === 'daily' ||
      r.frequency === 'Harian' ||
      (r.day_of_week || '').toLowerCase().includes('setiap hari') ||
      (r.day_of_week || '').toLowerCase().includes('harian');
    const isSupplement =
      (r.tablet_name || '').toLowerCase().includes('vitamin') ||
      (r.tablet_name || '').toLowerCase().includes('suplemen');
    const isProgestin = (r.tablet_name || '').toLowerCase().includes('progestin');
    const category: MedicationSchedule['category'] = isSupplement
      ? 'Suplemen Tambahan'
      : isProgestin
        ? 'Pil KB Progestin'
        : 'Pil KB Kombinasi';

    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user_name || 'Akseptor Pilluna',
      patientId: r.user_id,
      patientName: r.user_name || 'Akseptor Pilluna',
      medicationName: r.tablet_name || 'Pil KB Kombinasi (28 Tablet)',
      dosage: r.dosage || '1 tablet',
      frequency: isDaily ? 'Harian' : '1x Seminggu',
      dayOfWeek: r.day_of_week || 'Setiap Hari',
      timeSlots: slots,
      startDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
      endDate: '2026-12-31',
      status: r.status,
      category,
      instructions:
        r.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
      lastReminderSent: `${r.day_of_week || 'Setiap Hari'}, ${r.time_slot || '20:00'} WIB`,
    };
  }

  static async createSchedule(data: {
    userId?: string;
    patientId?: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    dayOfWeek?: string;
    timeSlots: string[];
    category?: 'Pil KB Kombinasi' | 'Pil KB Progestin' | 'Suplemen Tambahan';
    instructions?: string;
  }) {
    const targetUserId = data.userId || data.patientId;
    if (!targetUserId) throw new Error('User tujuan wajib dipilih.');
    const newId = `sch_${Date.now().toString().slice(-6)}`;
    const mainSlot = (data.timeSlots && data.timeSlots[0]) || '20:00';
    const dayOfWeek = data.dayOfWeek || 'Setiap Hari';
    const dbFrequency =
      data.frequency === 'Harian' || data.category === 'Pil KB Kombinasi' || data.category === 'Pil KB Progestin'
        ? 'daily'
        : 'weekly';

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO reminder_schedules (
          id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, status, instructions
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Aktif', $8)`,
        [
          newId,
          targetUserId,
          data.medicationName || 'Pil KB Kombinasi (28 Tablet)',
          data.dosage || '1 tablet',
          dbFrequency,
          dayOfWeek,
          mainSlot,
          data.instructions ||
            'Minum 1 tablet setiap hari pada jam yang sama setelah makan malam atau sebelum tidur.',
        ],
      );

      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        for (const slot of data.timeSlots) {
          await client.query(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`, [
            newId,
            slot,
          ]);
        }
      }
    });

    const created = await this.getScheduleById(newId);
    return created;
  }

  static async updateSchedule(scheduleId: string, data: any) {
    const dbFrequency = data.frequency
      ? data.frequency === 'Harian' || data.category === 'Pil KB Kombinasi' || data.category === 'Pil KB Progestin'
        ? 'daily'
        : 'weekly'
      : null;

    const mainSlot = data.timeSlots && data.timeSlots.length > 0 ? data.timeSlots[0] : null;

    await db.transaction(async (client) => {
      await client.query(
        `UPDATE reminder_schedules
         SET
           tablet_name = COALESCE($1, tablet_name),
           dosage = COALESCE($2, dosage),
           status = COALESCE($3, status),
           instructions = COALESCE($4, instructions),
           day_of_week = COALESCE($5, day_of_week),
           frequency = COALESCE($6, frequency),
           time_slot = COALESCE($7, time_slot),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $8`,
        [
          data.medicationName ?? null,
          data.dosage ?? null,
          data.status ?? null,
          data.instructions ?? null,
          data.dayOfWeek ?? null,
          dbFrequency,
          mainSlot,
          scheduleId,
        ],
      );

      if (data.timeSlots && Array.isArray(data.timeSlots)) {
        await client.query(`DELETE FROM schedule_time_slots WHERE schedule_id = $1`, [scheduleId]);
        for (const slot of data.timeSlots) {
          await client.query(
            `INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`,
            [scheduleId, slot],
          );
        }
      }
    });

    return { success: true };
  }

  static async deleteSchedule(scheduleId: string) {
    await db.transaction(async (client) => {
      await client.query(`DELETE FROM schedule_time_slots WHERE schedule_id = $1`, [scheduleId]);
      await client.query(`DELETE FROM reminder_schedules WHERE id = $1`, [scheduleId]);
    });
    return { success: true };
  }
}

