import db from '../../config/database.js';
import { UserService } from '../users/user.service.js';
import { calculateChronologicalStreak } from '../../utils/streakCalculator.js';

function formatDbDateKey(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val.split('T')[0];
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = String(val.getMonth() + 1).padStart(2, '0');
    const day = String(val.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String(val);
}

export class ConsumptionService {
  static async recordConsumption(
    userId: string,
    targetDate: string,
    status: 'recorded' | 'missed' | 'pending',
    notes?: string,
  ) {
    const timeFormatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const nowTimeStr = timeFormatter.format(new Date()) + ' WIB';
    const finalTargetDate =
      targetDate ||
      new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date());

    // Get active schedule
    const schedRes = await db.query<{ id: string; tablet_name: string; dosage: string; frequency: string; category?: string }>(
      `SELECT id, tablet_name, dosage, frequency FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
      [userId],
    );
    const activeSched = schedRes.rows[0];
    const schedId = activeSched?.id || null;
    const title = activeSched?.tablet_name || 'Pil KB Kombinasi (28 Tablet)';
    const dosage = activeSched?.dosage || '1 Tablet';
    const schedFreq = (activeSched?.frequency as 'daily' | 'weekly') || 'daily';
    const category = activeSched?.category || 'Pil KB';

    if (status === 'pending') {
      await db.query(
        `DELETE FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2`,
        [userId, finalTargetDate],
      );
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
          [dbStatus, dbStatus === 'ON_TIME' ? nowTimeStr : null, notes || null, existingLogRes.rows[0].id],
        );
      } else {
        const newLogId = `log_${Date.now().toString().slice(-6)}`;
        await db.query(
          `INSERT INTO consumption_logs (
            id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, '20:00', $8, $9, $10, 'Self')`,
          [
            newLogId,
            userId,
            schedId,
            title,
            category,
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

    return {
      success: true,
      newStreak: streakResult.streakCount,
      todayStatus: status,
    };
  }

  static async getMonitoringSummary(userId: string) {
    const [logsRes, schedRes] = await Promise.all([
      db.query<any>(
        `SELECT id, schedule_id, title, category, dosage, scheduled_date::text AS scheduled_date, scheduled_time, taken_at, status, notes, taken_by, created_at
         FROM consumption_logs
         WHERE user_id = $1
         ORDER BY scheduled_date DESC, scheduled_time DESC`,
        [userId],
      ),
      db.query<{ id: string; frequency: string; created_at: Date | string }>(
        `SELECT id, frequency, created_at FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif' LIMIT 1`,
        [userId],
      ),
    ]);

    const activeSched = schedRes.rows[0];
    const activeSchedId = activeSched?.id;
    const activeSchedCreatedAt = activeSched?.created_at ? new Date(activeSched.created_at) : null;
    const schedFreq = (activeSched?.frequency as 'daily' | 'weekly') || 'weekly';
    const rows = logsRes.rows;

    const activityMap: Record<string, any> = {};
    const completedDates: string[] = [];
    let onTimeCount = 0;
    let lateCount = 0;
    let missedCount = 0;

    const logs = rows.map((r: any) => {
      const dateStr = formatDbDateKey(r.scheduled_date);

      // Check whether this log was recorded under a previous deleted schedule before the active schedule was created
      const isFromOldSchedule = Boolean(
        activeSchedId &&
        r.schedule_id &&
        r.schedule_id !== activeSchedId &&
        activeSchedCreatedAt &&
        r.created_at &&
        new Date(r.created_at) < activeSchedCreatedAt
      );

      const isCompleted = (r.status === 'ON_TIME' || r.status === 'LATE') && !isFromOldSchedule;
      if (isCompleted) {
        completedDates.push(dateStr);
        if (r.status === 'ON_TIME') onTimeCount++;
        else lateCount++;
      } else if ((r.status === 'MISSED' || r.status === 'SKIPPED') && !isFromOldSchedule) {
        missedCount++;
      }

      const info = {
        id: r.id,
        scheduleId: r.schedule_id || undefined,
        status: isCompleted ? 'recorded' : r.status === 'MISSED' && !isFromOldSchedule ? 'missed' : 'pending',
        rawStatus: r.status,
        title: r.title,
        category: r.category,
        dosage: r.dosage || undefined,
        scheduledDate: dateStr,
        scheduledTime: r.scheduled_time,
        takenAt: r.taken_at || undefined,
        notes: r.notes || undefined,
      };

      if (!isFromOldSchedule && !activityMap[dateStr]) {
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
      SELECT id, schedule_id, title, category, dosage, scheduled_date::text AS scheduled_date, scheduled_time, taken_at, status, notes, taken_by 
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
      scheduledDate: formatDbDateKey(r.scheduled_date),
      scheduledTime: r.scheduled_time,
      takenAt: r.taken_at || undefined,
      status: r.status,
      notes: r.notes || undefined,
      takenBy: r.taken_by || 'Self',
    }));
  }
}
