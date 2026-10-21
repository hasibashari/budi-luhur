import db from '../../config/database.js';
import { UserService } from '../users/user.service.js';
import { calculateChronologicalStreak } from '../../utils/streakCalculator.js';
import { BuddyService } from '../buddy/buddy.service.js';

export class ConsumptionService {
  static async recordConsumption(
    userId: string,
    targetDate?: string,
    status: 'recorded' | 'missed' | 'pending' = 'recorded',
    notes?: string,
  ) {
    const finalTargetDate =
      (targetDate && targetDate.trim()) || new Date().toLocaleDateString('en-CA');
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const nowTimeStr = timeFormatter.format(new Date()) + ' WIB';

    // Get active schedule
    const schedRes = await db.query<{
      id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
    }>(
      `SELECT id, tablet_name, dosage, frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
      [userId],
    );
    const activeSched = schedRes.rows[0];
    const schedId = activeSched?.id || null;
    const title = activeSched?.tablet_name || 'Tablet Tambah Darah (TTD)';
    const dosage = activeSched?.dosage || '1 Tablet';
    const schedFreq = (activeSched?.frequency as 'daily' | 'weekly') || 'weekly';

    if (status === 'pending') {
      await db.query(`DELETE FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2`, [
        userId,
        finalTargetDate,
      ]);
    } else {
      const dbStatus = status === 'recorded' ? 'ON_TIME' : 'MISSED';

      const existingLogRes = await db.query<{ id: string }>(
        `SELECT id FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2 ORDER BY created_at DESC LIMIT 1`,
        [userId, finalTargetDate],
      );

      if (existingLogRes.rows.length > 0) {
        await db.query(
          `UPDATE consumption_logs
           SET status = $1, taken_at = $2, notes = $3
           WHERE id = $4`,
          [
            dbStatus,
            dbStatus === 'ON_TIME' ? nowTimeStr : null,
            notes || null,
            existingLogRes.rows[0].id,
          ],
        );
      } else {
        const newLogId = `log_${Date.now().toString().slice(-6)}`;
        await db.query(
          `INSERT INTO consumption_logs (
            id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
          ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, '20:00', $7, $8, $9, 'Self')`,
          [
            newLogId,
            userId,
            schedId,
            title,
            dosage,
            finalTargetDate,
            dbStatus === 'ON_TIME' ? nowTimeStr : null,
            dbStatus,
            notes || null,
          ],
        );
      }
    }

    // Recalculate streak
    const streakResult = await UserService.calculateAndSyncUserStreak(userId, schedFreq);

    // Sync group streaks
    const userGroupsRes = await db.query<{ group_id: string }>(
      `SELECT group_id FROM buddy_group_members WHERE user_id = $1`,
      [userId],
    );
    for (const row of userGroupsRes.rows) {
      await BuddyService.calculateAndSyncGroupStreak(row.group_id);
    }

    return {
      success: true,
      newStreak: streakResult.streakCount,
      todayStatus: status,
    };
  }

  static async recordAutoMissedLog(
    userId: string,
    targetDate: string,
    scheduleId?: string,
    title: string = 'Tablet Tambah Darah (TTD)',
    dosage: string = '1 Tablet',
    notes: string = 'Otomatis terlewat karena melewati batas jam jadwal',
  ) {
    const existingLogRes = await db.query<{ id: string; status: string }>(
      `SELECT id, status FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2 LIMIT 1`,
      [userId, targetDate],
    );

    if (existingLogRes.rows.length > 0) {
      return { success: true, id: existingLogRes.rows[0].id, alreadyExists: true };
    }

    const newLogId = `log_auto_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
    await db.query(
      `INSERT INTO consumption_logs (
        id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, status, notes, taken_by
      ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, '20:00', 'MISSED', $7, 'System')`,
      [newLogId, userId, scheduleId || null, title, dosage, targetDate, notes],
    );

    // Sync streak when an unrecorded date is auto-marked as missed
    const schedRes = await db.query<{ frequency: string }>(
      `SELECT frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
      [userId],
    );
    const schedFreq = (schedRes.rows[0]?.frequency as 'daily' | 'weekly') || 'weekly';
    await UserService.calculateAndSyncUserStreak(userId, schedFreq);

    return { success: true, id: newLogId, alreadyExists: false };
  }

  static async getMonitoringSummary(userId: string) {
    const [logsRes, schedRes] = await Promise.all([
      db.query<any>(
        `SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
         FROM consumption_logs
         WHERE user_id = $1
         ORDER BY scheduled_date DESC, scheduled_time DESC`,
        [userId],
      ),
      db.query<{ frequency: string }>(
        `SELECT frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
        [userId],
      ),
    ]);

    const schedFreq = (schedRes.rows[0]?.frequency as 'daily' | 'weekly') || 'weekly';
    const rows = logsRes.rows;

    const activityMap: Record<string, any> = {};
    const completedDates: string[] = [];
    let onTimeCount = 0;
    let lateCount = 0;
    let missedCount = 0;

    const logs = rows.map((r: any) => {
      const dateStr =
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date.split('T')[0]
          : new Date(r.scheduled_date).toISOString().split('T')[0];

      const isCompleted = r.status === 'ON_TIME' || r.status === 'LATE';
      if (isCompleted) {
        completedDates.push(dateStr);
        if (r.status === 'ON_TIME') onTimeCount++;
        else lateCount++;
      } else if (r.status === 'MISSED' || r.status === 'SKIPPED') {
        missedCount++;
      }

      const info = {
        id: r.id,
        status: isCompleted ? 'recorded' : r.status === 'MISSED' ? 'missed' : 'pending',
        rawStatus: r.status,
        title: r.title,
        category: r.category,
        dosage: r.dosage || undefined,
        scheduledDate: dateStr,
        scheduledTime: r.scheduled_time,
        takenAt: r.taken_at || undefined,
        notes: r.notes || undefined,
      };

      if (!activityMap[dateStr]) {
        activityMap[dateStr] = info;
      }

      return {
        id: r.id,
        reminderId: r.schedule_id || undefined,
        title: r.title,
        category: r.category || 'MEDICATION',
        dosage: r.dosage || undefined,
        scheduledDate: dateStr,
        scheduledTime: r.scheduled_time,
        takenAt: r.taken_at || undefined,
        status: r.status,
        notes: r.notes || undefined,
        takenBy: r.taken_by || 'Self',
      };
    });

    const total = rows.length;
    const completedCount = onTimeCount + lateCount;
    const adherenceRate = total > 0 ? Math.round((completedCount / total) * 100) : 100;
    const streakResult = await calculateChronologicalStreak(completedDates, schedFreq);

    return {
      logs,
      activityMap,
      stats: {
        adherenceRate,
        currentStreakDays: streakResult.streakCount,
        totalCompleted: completedCount,
        totalOnTime: onTimeCount,
        totalLate: lateCount,
        totalMissed: missedCount,
        totalScheduled: total,
      },
    };
  }

  static async getLogs(
    userId: string,
    range: string = 'ALL',
    category: string = 'ALL',
    status: string = 'ALL',
    dateFilter?: string,
  ) {
    let sql = `
      SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by 
      FROM consumption_logs 
      WHERE user_id = $1
    `;
    const params: unknown[] = [userId];
    let paramIndex = 2;

    if (dateFilter && dateFilter.trim() !== '') {
      sql += ` AND scheduled_date = $${paramIndex++}`;
      params.push(dateFilter.trim());
    } else if (range !== 'ALL') {
      const days = range === '7_DAYS' ? 7 : range === '14_DAYS' ? 14 : 30;
      sql += ` AND scheduled_date >= CURRENT_DATE - INTERVAL '${days} days'`;
    }

    if (category !== 'ALL') {
      sql += ` AND category = $${paramIndex++}`;
      params.push(category);
    }

    if (status !== 'ALL') {
      sql += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    sql += ` ORDER BY scheduled_date DESC, scheduled_time DESC`;

    const res = await db.query<any>(sql, params);

    return res.rows.map((r: any) => ({
      id: r.id,
      reminderId: r.schedule_id || undefined,
      title: r.title,
      category: r.category || 'MEDICATION',
      dosage: r.dosage || undefined,
      scheduledDate:
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date.split('T')[0]
          : new Date(r.scheduled_date).toISOString().split('T')[0],
      scheduledTime: r.scheduled_time,
      takenAt: r.taken_at || undefined,
      status: r.status,
      notes: r.notes || undefined,
      takenBy: r.taken_by || 'Self',
    }));
  }
}
