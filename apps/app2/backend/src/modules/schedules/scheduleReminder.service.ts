import db from '../../config/database.js';
import { NotificationService } from '../notifications/notification.service.js';

const TIMEZONE = 'Asia/Jakarta';

/** Notifikasi tepat waktu ditoleransi selama 5 menit. */
const EXACT_WINDOW_MINUTES = 5;
/** Pengingat awal 15 menit sebelumnya (cron tiap 1 menit). */
const EARLY_MIN_MINUTES = 15;
const EARLY_MAX_MINUTES = 12;

export const APP2_REMINDER_URL = '/app2/user/dashboard';

const EXACT_TITLE = 'Pengingat Harian Pil KB 💊';
const EARLY_TITLE = '15 Menit Menuju Pengingat ⏰';

interface ScheduleRow {
  id: string;
  user_id: string;
  tablet_name: string;
  dosage: string;
  frequency: string;
  day_of_week: string;
  time_slot: string;
  remind_15min_before: boolean;
  instructions: string | null;
  user_name: string;
}

interface CronResult {
  checked: number;
  exactSent: number;
  earlySent: number;
}

/**
 * Scheduler pengingat jadwal harian App 2 (Pilluna).
 *
 * - `startScheduler()` dipakai pada proses long-running (dev / server biasa).
 * - Pada Vercel (serverless) scheduler tidak bisa memakai `setInterval`,
 *   jadi gunakan endpoint cron `GET /api/v1/notifications/cron-reminders`.
 */
export class ScheduleReminderService {
  private static intervalHandle: NodeJS.Timeout | null = null;

  static startScheduler() {
    if (this.intervalHandle) return;
    if (process.env.NODE_ENV === 'test' || process.env.VERCEL) return;

    console.log('⏰ [Pilluna] Daily Schedule Reminder Service started.');
    this.intervalHandle = setInterval(() => {
      this.checkAndSendReminders().catch(error => {
        console.error('[ReminderScheduler] Error running reminder check:', error);
      });
    }, 60 * 1000);
  }

  static stopScheduler() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private static getWibNow(now: Date = new Date()) {
    const dateKey = new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(now);
    const timeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);
    const [hour, minute] = timeStr.split(':').map(Number);
    const dayName = new Intl.DateTimeFormat('id-ID', {
      timeZone: TIMEZONE,
      weekday: 'long',
    }).format(now);

    return {
      dateKey,
      minutes: (hour || 0) * 60 + (minute || 0),
      dayName,
    };
  }

  static async checkAndSendReminders(): Promise<CronResult> {
    const now = new Date();
    const { dateKey, minutes: nowMinutes, dayName } = this.getWibNow(now);

    const schedulesRes = await db.query<ScheduleRow>(
      `SELECT s.id, s.user_id, s.tablet_name, s.dosage, s.frequency,
              s.day_of_week, s.time_slot, s.remind_15min_before, s.instructions,
              u.name AS user_name
       FROM reminder_schedules s
       JOIN users u ON s.user_id = u.id
       WHERE s.status = 'Aktif' AND s.is_enabled = TRUE`,
    );

    let exactSent = 0;
    let earlySent = 0;

    for (const schedule of schedulesRes.rows) {
      const isScheduledToday =
        schedule.frequency === 'daily' ||
        (schedule.day_of_week || '').toLowerCase().includes(dayName.toLowerCase());

      if (!isScheduledToday) continue;

      const [scheduleHour, scheduleMinute] = (schedule.time_slot || '20:00')
        .split(':')
        .map(Number);
      const scheduleMinutes = (scheduleHour || 20) * 60 + (scheduleMinute || 0);
      const diff = nowMinutes - scheduleMinutes;

      const isExactWindow = diff >= 0 && diff <= EXACT_WINDOW_MINUTES;
      const isEarlyWindow =
        schedule.remind_15min_before &&
        diff >= -EARLY_MIN_MINUTES &&
        diff <= -EARLY_MAX_MINUTES;

      if (!isExactWindow && !isEarlyWindow) continue;

      // Sudah mencatat minum hari ini → jangan ganggu lagi.
      const logRes = await db.query<{ status: string }>(
        `SELECT status FROM consumption_logs
         WHERE user_id = $1 AND scheduled_date = $2
         ORDER BY created_at DESC LIMIT 1`,
        [schedule.user_id, dateKey],
      );
      const latestStatus = logRes.rows[0]?.status;
      if (latestStatus === 'ON_TIME' || latestStatus === 'LATE') continue;

      const kind = isExactWindow ? 'exact' : 'early';
      const title = kind === 'exact' ? EXACT_TITLE : EARLY_TITLE;

      // Anti-duplikat: satu nudge per jadwal per jenis per hari (berbasis WIB).
      const duplicateRes = await db.query<{ id: string }>(
        `SELECT id FROM admin_nudges
         WHERE user_id = $1 AND schedule_id = $2 AND title = $3
           AND created_at >= (date_trunc('day', now() AT TIME ZONE '${TIMEZONE}') AT TIME ZONE '${TIMEZONE}')
         LIMIT 1`,
        [schedule.user_id, schedule.id, title],
      );
      if (duplicateRes.rows.length > 0) continue;

      const tabletName = schedule.tablet_name || 'Pil KB';
      const message =
        kind === 'exact'
          ? `Waktunya ${tabletName} pukul ${schedule.time_slot} WIB. Buka Pilluna dan catat sekarang.`
          : `Pengingat ${tabletName} dalam 15 menit (${schedule.time_slot} WIB). Siapkan sekarang.`;

      const nudgeId = `nudge_auto_${Date.now().toString(36)}_${Math.random()
        .toString(36)
        .slice(2, 6)}`;

      await db.query(
        `INSERT INTO admin_nudges (id, user_id, schedule_id, title, message, channel, status)
         VALUES ($1, $2, $3, $4, $5, 'app', 'UNREAD')`,
        [nudgeId, schedule.user_id, schedule.id, title, message],
      );

      await NotificationService.sendToUser(schedule.user_id, {
        title: kind === 'exact' ? `Waktunya ${tabletName}! 💊` : `15 Menit Lagi: ${tabletName} ⏰`,
        body: message,
        url: APP2_REMINDER_URL,
        tag: `daily_${schedule.id}_${dateKey}_${kind}`,
      });

      if (kind === 'exact') exactSent += 1;
      else earlySent += 1;
    }

    return { checked: schedulesRes.rows.length, exactSent, earlySent };
  }
}
