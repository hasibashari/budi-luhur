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
      (targetDate && targetDate.trim()) ||
      new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
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
    const adherenceRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;
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

  static async getYearlyMonitoring(userId: string) {
    const INDO_MONTHS = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0 - 11

    // 1. Fetch user active schedule
    const schedRes = await db.query<{
      id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
      day_of_week: string;
      time_slot: string;
      instructions: string;
      status: string;
      is_enabled: boolean;
    }>(
      `SELECT id, tablet_name, dosage, frequency, day_of_week, time_slot, instructions, status, is_enabled
       FROM reminder_schedules
       WHERE user_id = $1 AND status = 'Aktif'
       LIMIT 1`,
      [userId],
    );
    const activeSched = schedRes.rows[0] || null;

    // 2. Fetch past 12 months consumption logs (from 365 days ago until today)
    const logsRes = await db.query<any>(
      `SELECT id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
       FROM consumption_logs
       WHERE user_id = $1 AND scheduled_date >= (CURRENT_DATE - INTERVAL '365 days')
       ORDER BY scheduled_date DESC, scheduled_time DESC`,
      [userId],
    );

    const logs = logsRes.rows.map((r: any) => {
      const dateStr =
        typeof r.scheduled_date === 'string'
          ? r.scheduled_date.split('T')[0]
          : new Date(r.scheduled_date).toISOString().split('T')[0];
      return {
        id: r.id,
        reminderId: r.schedule_id || undefined,
        title: r.title,
        category: r.category || 'TTD',
        dosage: r.dosage || '1 Tablet',
        scheduledDate: dateStr,
        scheduledTime: r.scheduled_time || '20:00',
        takenAt: r.taken_at || undefined,
        status: r.status,
        notes: r.notes || undefined,
        takenBy: r.taken_by || 'Self',
      };
    });

    // Generate 12 past months array (from 11 months ago to current month)
    const past12Months: Array<{
      monthKey: string;
      year: number;
      monthIndex: number;
      monthName: string;
      shortLabel: string;
      takenCount: number;
      missedCount: number;
      pendingCount: number;
      totalScheduled: number;
      adherencePercentage: number;
    }> = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
      const monthName = `${INDO_MONTHS[m]} ${y}`;
      const shortLabel = `${INDO_MONTHS[m].slice(0, 3)} '${String(y).slice(-2)}`;

      past12Months.push({
        monthKey,
        year: y,
        monthIndex: m,
        monthName,
        shortLabel,
        takenCount: 0,
        missedCount: 0,
        pendingCount: 0,
        totalScheduled: 0,
        adherencePercentage: 100,
      });
    }

    const monthMap = new Map(past12Months.map(item => [item.monthKey, item]));

    let yearlyTotalTaken = 0;
    let yearlyTotalMissed = 0;
    let yearlyTotalPending = 0;

    for (const log of logs) {
      const logMonthKey = log.scheduledDate.slice(0, 7);
      const mItem = monthMap.get(logMonthKey);
      if (mItem) {
        mItem.totalScheduled += 1;
        if (log.status === 'ON_TIME' || log.status === 'LATE') {
          mItem.takenCount += 1;
          yearlyTotalTaken += 1;
        } else if (log.status === 'MISSED' || log.status === 'SKIPPED') {
          mItem.missedCount += 1;
          yearlyTotalMissed += 1;
        } else {
          mItem.pendingCount += 1;
          yearlyTotalPending += 1;
        }
      }
    }

    // Calculate adherence percentage for each past month
    for (const mItem of past12Months) {
      if (mItem.totalScheduled > 0) {
        mItem.adherencePercentage = Math.round((mItem.takenCount / mItem.totalScheduled) * 100);
      } else {
        mItem.adherencePercentage = 0;
      }
    }

    const yearlyTotalScheduled = yearlyTotalTaken + yearlyTotalMissed + yearlyTotalPending;
    const yearlyAdherencePercentage =
      yearlyTotalScheduled > 0
        ? Math.round((yearlyTotalTaken / yearlyTotalScheduled) * 100)
        : 100;

    let adherenceGrade = 'Optimal (A)';
    if (yearlyAdherencePercentage < 60) {
      adherenceGrade = 'Perlu Perhatian (C)';
    } else if (yearlyAdherencePercentage < 80) {
      adherenceGrade = 'Cukup Baik (B)';
    }

    // 3. Project 12 Months Forward (Upcoming Consumption Plan)
    const upcomingDates: Array<{
      date: string;
      dayName: string;
      time: string;
      tabletName: string;
      dosage: string;
      instructions: string;
      status: 'UPCOMING_PLANNED';
      monthKey: string;
    }> = [];

    const future12Months: Array<{
      monthKey: string;
      monthName: string;
      shortLabel: string;
      plannedCount: number;
    }> = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(currentYear, currentMonth + i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
      const monthName = `${INDO_MONTHS[m]} ${y}`;
      const shortLabel = `${INDO_MONTHS[m].slice(0, 3)} '${String(y).slice(-2)}`;

      future12Months.push({
        monthKey,
        monthName,
        shortLabel,
        plannedCount: 0,
      });
    }

    const futureMonthMap = new Map(future12Months.map(item => [item.monthKey, item]));

    if (activeSched && activeSched.is_enabled) {
      const targetFrequency = activeSched.frequency || 'weekly';
      const targetDayName = (activeSched.day_of_week || 'Sabtu').toLowerCase();
      const schedTime = activeSched.time_slot || '20:00';
      const tabletName = activeSched.tablet_name || 'Tablet Tambah Darah (TTD)';
      const dosage = activeSched.dosage || '1 Tablet';
      const instructions =
        activeSched.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.';

      // Generate next 365 days
      for (let dayOffset = 1; dayOffset <= 365; dayOffset++) {
        const futureDate = new Date(now);
        futureDate.setDate(now.getDate() + dayOffset);
        const dayOfWeekIndex = futureDate.getDay();
        const dayName = INDO_DAYS[dayOfWeekIndex];

        const isMatchingDay =
          targetFrequency === 'daily' || dayName.toLowerCase() === targetDayName;

        if (isMatchingDay) {
          const dateStr = futureDate.toLocaleDateString('en-CA');
          const monthKey = dateStr.slice(0, 7);

          upcomingDates.push({
            date: dateStr,
            dayName,
            time: schedTime,
            tabletName,
            dosage,
            instructions,
            status: 'UPCOMING_PLANNED',
            monthKey,
          });

          const futureMItem = futureMonthMap.get(monthKey);
          if (futureMItem) {
            futureMItem.plannedCount += 1;
          }
        }
      }
    }

    return {
      historical: {
        yearlySummary: {
          totalTaken: yearlyTotalTaken,
          totalMissed: yearlyTotalMissed,
          totalPending: yearlyTotalPending,
          totalScheduled: yearlyTotalScheduled,
          adherencePercentage: yearlyAdherencePercentage,
          adherenceGrade,
        },
        monthlyBreakdown: past12Months,
        logs,
      },
      plan: {
        scheduleInfo: activeSched
          ? {
              frequency: activeSched.frequency === 'daily' ? 'Setiap Hari' : '1x Seminggu',
              dayOfWeek: activeSched.day_of_week,
              time: activeSched.time_slot,
              tabletName: activeSched.tablet_name,
              dosage: activeSched.dosage,
              instructions: activeSched.instructions,
            }
          : null,
        totalPlannedDoses: upcomingDates.length,
        monthlyBreakdown: future12Months,
        upcomingDates,
      },
    };
  }
}
