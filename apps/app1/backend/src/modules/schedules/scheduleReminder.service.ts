import db from '../../config/database.js';
import { NotificationService } from '../notifications/notification.service.js';
import { UserService } from '../users/user.service.js';

export class ScheduleReminderService {
  private static intervalHandle: NodeJS.Timeout | null = null;

  static startScheduler() {
    if (this.intervalHandle) return;
    if (process.env.NODE_ENV === 'test') return;

    console.log('⏰ [FEMORY] Schedule Reminder & Auto-Missed Service started.');

    // Run reconciliation for past schedules on startup
    this.reconcilePastSchedules().catch(err => {
      console.error('[ReminderScheduler] Error during initial past schedules reconciliation:', err);
    });

    // Check schedules every 60 seconds
    this.intervalHandle = setInterval(() => {
      this.checkAndSendReminders().catch(err => {
        console.error('[ReminderScheduler] Error running reminder check:', err);
      });
    }, 60 * 1000);
  }

  static stopScheduler() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  static async checkAndSendReminders() {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
    const currentDayName = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
    }).format(now);

    const currentTimeStr = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(now);

    const [currH, currM] = currentTimeStr.split(':').map(Number);
    const nowMinutes = (currH || 0) * 60 + (currM || 0);

    // Query all active and enabled schedules
    const schedulesRes = await db.query<{
      id: string;
      user_id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
      day_of_week: string;
      time_slot: string;
      remind_15min_before: boolean;
      user_name: string;
    }>(
      `SELECT s.id, s.user_id, s.tablet_name, s.dosage, s.frequency, 
              s.day_of_week, s.time_slot, s.remind_15min_before, u.name as user_name
       FROM reminder_schedules s
       JOIN users u ON s.user_id = u.id
       WHERE s.status = 'Aktif' AND s.is_enabled = TRUE`,
    );

    for (const sch of schedulesRes.rows) {
      const isScheduledToday =
        sch.frequency === 'daily' ||
        sch.day_of_week.toLowerCase() === currentDayName.toLowerCase();

      if (!isScheduledToday) continue;

      // Check if user has already recorded consumption today
      const existingLogRes = await db.query<{ id: string; status: string }>(
        `SELECT id, status FROM consumption_logs 
         WHERE user_id = $1 AND scheduled_date = $2 
         ORDER BY created_at DESC LIMIT 1`,
        [sch.user_id, todayStr],
      );

      const latestLog = existingLogRes.rows[0];
      const hasTaken = latestLog && (latestLog.status === 'ON_TIME' || latestLog.status === 'LATE');
      if (hasTaken) continue;

      const [schH, schM] = sch.time_slot.split(':').map(Number);
      const schedMinutes = (schH || 20) * 60 + (schM || 0);
      const diffMinutes = nowMinutes - schedMinutes;

      // 1. Exact Scheduled Time Reminder (window: 0 to 4 minutes)
      if (diffMinutes >= 0 && diffMinutes <= 4) {
        const nudgeCheck = await db.query<{ id: string }>(
          `SELECT id FROM admin_nudges 
           WHERE user_id = $1 AND schedule_id = $2 
             AND title = 'Pengingat Minum TTD 🌸'
             AND created_at >= CURRENT_DATE
           LIMIT 1`,
          [sch.user_id, sch.id],
        );

        if (nudgeCheck.rows.length === 0) {
          const nudgeId = `nudge_auto_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
          const tabletName = sch.tablet_name || 'Tablet Tambah Darah (TTD)';

          await db.query(
            `INSERT INTO admin_nudges (
              id, user_id, schedule_id, title, message, channel, status
            ) VALUES ($1, $2, $3, 'Pengingat Minum TTD 🌸', $4, 'app', 'UNREAD')`,
            [
              nudgeId,
              sch.user_id,
              sch.id,
              `Waktunya minum ${tabletName}! Minum 1 tablet sekarang dengan air putih untuk cegah anemia.`,
            ],
          );

          await NotificationService.sendToUser(sch.user_id, {
            title: 'Waktunya Minum TTD! 🌸',
            body: `Waktunya minum ${tabletName}. Buka FEMORY untuk mencatat konsumsimu!`,
            url: '/user/dashboard',
          });
        }
      }

      // 2. Early Reminder (15 minutes before)
      if (sch.remind_15min_before && diffMinutes >= -15 && diffMinutes <= -11) {
        const earlyCheck = await db.query<{ id: string }>(
          `SELECT id FROM admin_nudges 
           WHERE user_id = $1 AND schedule_id = $2 
             AND title = '15 Menit Menuju Minum TTD 🌸'
             AND created_at >= CURRENT_DATE
           LIMIT 1`,
          [sch.user_id, sch.id],
        );

        if (earlyCheck.rows.length === 0) {
          const nudgeId = `nudge_early_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
          const tabletName = sch.tablet_name || 'Tablet Tambah Darah (TTD)';

          await db.query(
            `INSERT INTO admin_nudges (
              id, user_id, schedule_id, title, message, channel, status
            ) VALUES ($1, $2, $3, '15 Menit Menuju Minum TTD 🌸', $4, 'app', 'UNREAD')`,
            [
              nudgeId,
              sch.user_id,
              sch.id,
              `Persiapkan ${tabletName}. Waktu minum terjadwal dalam 15 menit (${sch.time_slot} WIB).`,
            ],
          );

          await NotificationService.sendToUser(sch.user_id, {
            title: '15 Menit Menuju Minum TTD 🌸',
            body: `Persiapkan ${tabletName}. Jadwal minummu dalam 15 menit.`,
            url: '/user/dashboard',
          });
        }
      }

      // 3. Auto-Missed Reconciliation (Tolerance window: 60 minutes after schedule)
      if (diffMinutes > 60 && !latestLog) {
        const newLogId = `log_auto_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
        await db.query(
          `INSERT INTO consumption_logs (
            id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, status, notes, taken_by
          ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, $7, 'MISSED', 'Otomatis terlewat karena melewati batas jam jadwal (toleransi 60 menit)', 'System')
          ON CONFLICT (id) DO NOTHING`,
          [
            newLogId,
            sch.user_id,
            sch.id,
            sch.tablet_name || 'Tablet Tambah Darah (TTD)',
            sch.dosage || '1 Tablet',
            todayStr,
            sch.time_slot,
          ],
        );

        const schedFreq = (sch.frequency as 'daily' | 'weekly') || 'weekly';
        await UserService.calculateAndSyncUserStreak(sch.user_id, schedFreq);
      }
    }
  }

  static async reconcilePastSchedules() {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    // Look back up to 14 days for any missed schedule days
    const schedulesRes = await db.query<{
      id: string;
      user_id: string;
      tablet_name: string;
      dosage: string;
      frequency: string;
      day_of_week: string;
      time_slot: string;
      created_at: Date;
    }>(
      `SELECT id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, created_at
       FROM reminder_schedules
       WHERE status = 'Aktif' AND is_enabled = TRUE`,
    );

    const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (const sch of schedulesRes.rows) {
      const schedCreatedDate = new Date(sch.created_at).toLocaleDateString('en-CA');
      let changed = false;

      // Check each of the past 14 days
      for (let i = 1; i <= 14; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() - i);
        const checkDateStr = checkDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

        if (checkDateStr < schedCreatedDate) break;

        const dayName = DAY_NAMES[checkDate.getDay()];
        const isScheduled =
          sch.frequency === 'daily' ||
          sch.day_of_week.toLowerCase() === dayName.toLowerCase();

        if (isScheduled) {
          const logCheck = await db.query<{ id: string }>(
            `SELECT id FROM consumption_logs WHERE user_id = $1 AND scheduled_date = $2 LIMIT 1`,
            [sch.user_id, checkDateStr],
          );

          if (logCheck.rows.length === 0) {
            const newLogId = `log_past_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
            await db.query(
              `INSERT INTO consumption_logs (
                id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, status, notes, taken_by
              ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, $7, 'MISSED', 'Otomatis terlewat (jadwal lampau tanpa catatan)', 'System')
              ON CONFLICT (id) DO NOTHING`,
              [
                newLogId,
                sch.user_id,
                sch.id,
                sch.tablet_name || 'Tablet Tambah Darah (TTD)',
                sch.dosage || '1 Tablet',
                checkDateStr,
                sch.time_slot,
              ],
            );
            changed = true;
          }
        }
      }

      if (changed) {
        const schedFreq = (sch.frequency as 'daily' | 'weekly') || 'weekly';
        await UserService.calculateAndSyncUserStreak(sch.user_id, schedFreq);
      }
    }
  }
}
