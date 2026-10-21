import db from '../../config/database.js';
import {
  UserProfile,
  UserDashboardData,
  UserScheduleData,
  StreakResult,
} from '../../types/index.js';
import { calculateNextSchedule } from '../../utils/scheduleHelpers.js';
import { calculateChronologicalStreak } from '../../utils/streakCalculator.js';

export class UserService {
  static async calculateAndSyncUserStreak(
    userId: string,
    scheduleFrequency: 'daily' | 'weekly' = 'weekly',
  ): Promise<StreakResult> {
    const res = await db.query<{ scheduled_date: string; taken_at: string | null }>(
      `SELECT scheduled_date, taken_at 
       FROM consumption_logs 
       WHERE user_id = $1 AND status IN ('ON_TIME', 'LATE')
       ORDER BY scheduled_date DESC`,
      [userId],
    );

    const completedDates = res.rows.map((r: { scheduled_date: string }) => r.scheduled_date);
    const streakResult = await calculateChronologicalStreak(completedDates, scheduleFrequency);

    // Sync streak_count in user_profiles
    await db.query(
      `UPDATE user_profiles 
       SET streak_count = $1, last_active_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [streakResult.streakCount, userId],
    );

    return streakResult;
  }

  static async getDashboardData(userId: string): Promise<UserDashboardData | null> {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const [userRes, scheduleRes, todayLogRes, articleRes, groupRes] = await Promise.all([
      db.query<{
        name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
        friend_code: string | null;
        school_or_org: string | null;
        hb_level: number | null;
        risk_level: string | null;
        streak_count: number;
      }>(
        `SELECT u.name, u.email, u.phone, u.avatar_url,
                p.friend_code, p.school_or_org, p.hb_level, p.risk_level, p.streak_count
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = $1`,
        [userId],
      ),
      db.query<{
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
      ),
      db.query<{ status: string; taken_at: string | null }>(
        `SELECT status, taken_at 
         FROM consumption_logs 
         WHERE user_id = $1 AND scheduled_date = $2
         ORDER BY created_at DESC LIMIT 1`,
        [userId, todayStr],
      ),
      db.query<{
        id: string;
        title: string;
        category: string;
        read_time: string;
        summary: string;
        image_url: string;
      }>(
        `SELECT id, title, category, read_time, summary, image_url 
         FROM articles 
         WHERE status = 'Terbit' 
         ORDER BY is_featured DESC, published_at DESC LIMIT 1`,
      ),
      db.query<{
        id: string;
        name: string;
        group_code: string;
        streak_count: number;
        avatar_url: string | null;
      }>(
        `SELECT g.id, g.name, g.group_code, g.streak_count, g.avatar_url
         FROM buddy_groups g
         JOIN buddy_group_members gm ON g.id = gm.group_id
         WHERE gm.user_id = $1
         ORDER BY g.updated_at DESC, g.created_at DESC
         LIMIT 1`,
        [userId],
      ),
    ]);

    const userRow = userRes.rows[0];
    if (!userRow) return null;

    let activeSchedule: UserScheduleData | null = null;
    let schedFrequencyType: 'daily' | 'weekly' = 'weekly';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      schedFrequencyType = sch.frequency === 'daily' ? 'daily' : 'weekly';
      const dayOfWeek = sch.day_of_week || 'Sabtu';
      const timeSlot = sch.time_slot || '20:00';
      const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

      activeSchedule = {
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
        instructions:
          sch.instructions ||
          'Minum 1 tablet seminggu sekali setelah makan malam atau sebelum tidur.',
        nextDate,
        daysRemaining,
      };
    }

    const streakResult = await this.calculateAndSyncUserStreak(userId, schedFrequencyType);

    let todayStatus: 'recorded' | 'missed' | 'pending' = 'pending';
    let todayRecordedTime: string | undefined;

    if (todayLogRes.rows.length > 0) {
      const log = todayLogRes.rows[0];
      if (log.status === 'ON_TIME' || log.status === 'LATE') {
        todayStatus = 'recorded';
        todayRecordedTime = log.taken_at || '20:00 WIB';
      } else if (log.status === 'MISSED' || log.status === 'SKIPPED') {
        todayStatus = 'missed';
      }
    } else if (activeSchedule && activeSchedule.isEnabled) {
      // Evaluate if today is scheduled and if the time has passed tolerance window (60 mins)
      const now = new Date();
      const currentDayName = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        weekday: 'long',
      }).format(now);

      const isScheduledToday =
        activeSchedule.frequency === 'Harian' ||
        activeSchedule.dayOfWeek.toLowerCase() === currentDayName.toLowerCase();

      if (isScheduledToday) {
        const currentTimeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Asia/Jakarta',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(now);

        const [currH, currM] = currentTimeStr.split(':').map(Number);
        const [schH, schM] = activeSchedule.time.split(':').map(Number);
        const nowMinutes = (currH || 0) * 60 + (currM || 0);
        const schedMinutes = (schH || 20) * 60 + (schM || 0);

        // Tolerance: 60 minutes after scheduled time
        const toleranceMinutes = 60;

        if (nowMinutes > schedMinutes + toleranceMinutes) {
          todayStatus = 'missed';

          // Persist the auto-missed log into consumption_logs if not already present
          const autoLogId = `log_auto_${Date.now().toString().slice(-6)}_${Math.random().toString(36).substring(2, 6)}`;
          await db.query(
            `INSERT INTO consumption_logs (
              id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, status, notes, taken_by
            ) VALUES ($1, $2, $3, $4, 'TTD', $5, $6, $7, 'MISSED', 'Otomatis terlewat karena melewati batas jam jadwal', 'System')
            ON CONFLICT (id) DO NOTHING`,
            [
              autoLogId,
              userId,
              activeSchedule.id,
              activeSchedule.tabletName,
              activeSchedule.dosage,
              todayStr,
              activeSchedule.time,
            ],
          );
        }
      }
    }

    const article = articleRes.rows[0];
    const group = groupRes.rows[0];

    return {
      user: {
        id: userId,
        name: userRow.name,
        email: userRow.email,
        phone: userRow.phone || '',
        avatarUrl: userRow.avatar_url || '',
        streakCount: streakResult.streakCount,
        streakUnit: streakResult.streakUnit,
        consecutiveDates: streakResult.consecutiveDates,
        hbLevel: userRow.hb_level,
        schoolOrOrg: userRow.school_or_org,
        riskLevel: userRow.risk_level,
        friendCode: userRow.friend_code || undefined,
      },
      todayStatus,
      todayRecordedTime,
      activeSchedule,
      featuredArticle: article
        ? {
            id: article.id,
            title: article.title,
            category: article.category,
            readTime: article.read_time,
            summary: article.summary,
            imageUrl: article.image_url,
          }
        : null,
      activeBuddy: null,
      primaryGroup: group
        ? {
            id: group.id,
            name: group.name,
            groupCode: group.group_code,
            streakCount: group.streak_count,
            memberCount: 1,
            membersSummary: [userRow.name],
            weeklyCompletedCount: todayStatus === 'recorded' ? 1 : 0,
            weeklyTotalCount: 1,
            weeklyCompletionRate: todayStatus === 'recorded' ? 100 : 0,
            avatarUrl: group.avatar_url || undefined,
          }
        : null,
    };
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const res = await db.query<any>(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.date_of_birth,
              p.blood_type, p.height, p.weight, p.school_or_org, p.hb_level,
              p.streak_count, p.friend_code, p.risk_level, p.level_title, p.status, p.notes
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId],
    );

    const row = res.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone || '',
      avatarUrl: row.avatar_url || '',
      dateOfBirth: row.date_of_birth
        ? typeof row.date_of_birth === 'string'
          ? row.date_of_birth.split('T')[0]
          : new Date(row.date_of_birth).toISOString().split('T')[0]
        : undefined,
      bloodType: row.blood_type || undefined,
      height: row.height !== null ? Number(row.height) : undefined,
      weight: row.weight !== null ? Number(row.weight) : undefined,
      schoolOrOrg: row.school_or_org || undefined,
      hbLevel: row.hb_level !== null ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
      friendCode: row.friend_code || undefined,
      riskLevel: row.risk_level || undefined,
      levelTitle: row.level_title || undefined,
      status: row.status || undefined,
      notes: row.notes || undefined,
    };
  }

  static async updateProfile(userId: string, data: any) {
    await db.transaction(async client => {
      // 1. Update users table
      const userUpdates: string[] = [];
      const userParams: any[] = [];
      let idx = 1;

      if (data.name !== undefined) {
        userUpdates.push(`name = $${idx++}`);
        userParams.push(data.name);
      }
      if (data.phone !== undefined) {
        userUpdates.push(`phone = $${idx++}`);
        userParams.push(data.phone || null);
      }
      if (data.avatarUrl !== undefined) {
        userUpdates.push(`avatar_url = $${idx++}`);
        userParams.push(data.avatarUrl || null);
      }
      if (data.dateOfBirth !== undefined) {
        userUpdates.push(`date_of_birth = $${idx++}`);
        userParams.push(data.dateOfBirth || null);
      }

      if (userUpdates.length > 0) {
        userUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
        userParams.push(userId);
        await client.query(
          `UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${idx}`,
          userParams,
        );
      }

      // 2. Update user_profiles table
      const profileUpdates: string[] = [];
      const profileParams: any[] = [];
      idx = 1;

      if (data.schoolOrOrg !== undefined) {
        profileUpdates.push(`school_or_org = $${idx++}`);
        profileParams.push(data.schoolOrOrg || null);
      }
      if (data.hbLevel !== undefined) {
        profileUpdates.push(`hb_level = $${idx++}`);
        profileParams.push(
          data.hbLevel !== null && data.hbLevel !== '' ? Number(data.hbLevel) : null,
        );

        // Auto evaluate hb_status and risk_level
        const hb = Number(data.hbLevel);
        let hbStatus: string | null = hb > 0 ? 'Normal' : null;
        let riskLevel: string | null = hb > 0 ? 'Rendah' : null;
        if (hb > 0 && hb < 8.0) {
          hbStatus = 'Anemia Berat';
          riskLevel = 'Tinggi';
        } else if (hb >= 8.0 && hb < 11.0) {
          hbStatus = 'Anemia Sedang';
          riskLevel = 'Tinggi';
        } else if (hb >= 11.0 && hb < 12.0) {
          hbStatus = 'Anemia Ringan';
          riskLevel = 'Sedang';
        } else if (hb > 15.5) {
          hbStatus = 'Tinggi';
          riskLevel = 'Sedang';
        }
        profileUpdates.push(`hb_status = $${idx++}`);
        profileParams.push(hbStatus);
        profileUpdates.push(`risk_level = $${idx++}`);
        profileParams.push(riskLevel);
      }
      if (data.bloodType !== undefined) {
        profileUpdates.push(`blood_type = $${idx++}`);
        profileParams.push(data.bloodType || null);
      }
      if (data.height !== undefined) {
        profileUpdates.push(`height = $${idx++}`);
        profileParams.push(data.height ? Number(data.height) : null);
      }
      if (data.weight !== undefined) {
        profileUpdates.push(`weight = $${idx++}`);
        profileParams.push(data.weight ? Number(data.weight) : null);
      }

      if (profileUpdates.length > 0) {
        profileParams.push(userId);
        await client.query(
          `UPDATE user_profiles SET ${profileUpdates.join(', ')} WHERE user_id = $${idx}`,
          profileParams,
        );
      }
    });

    return { success: true, message: 'Profil berhasil diperbarui.' };
  }

  static async saveInitialSetup(userId: string, data: any) {
    if (!data.schoolOrOrg || !data.schoolOrOrg.trim()) {
      return { success: false, error: 'Nama sekolah / institusi wajib diisi.' };
    }

    await db.transaction(async client => {
      // 1. Update user date_of_birth if provided (lives on users table)
      if (data.dateOfBirth) {
        await client.query(
          `UPDATE users SET date_of_birth = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [data.dateOfBirth, userId],
        );
      }

      // 2. Update user profile
      const hb = data.hbLevel ? Number(data.hbLevel) : null;
      let hbStatus: string | null = hb ? 'Normal' : null;
      let riskLevel: string | null = hb ? 'Rendah' : null;
      if (hb && hb < 11.0) {
        hbStatus = hb < 8.0 ? 'Anemia Berat' : 'Anemia Sedang';
        riskLevel = 'Tinggi';
      } else if (hb && hb < 12.0) {
        hbStatus = 'Anemia Ringan';
        riskLevel = 'Sedang';
      } else if (hb && hb > 15.5) {
        hbStatus = 'Tinggi';
        riskLevel = 'Sedang';
      }

      await client.query(
        `UPDATE user_profiles
         SET school_or_org = $1,
             blood_type = $2,
             height = $3,
             weight = $4,
             hb_level = $5,
             hb_status = $6,
             risk_level = $7,
             last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $8`,
        [
          data.schoolOrOrg || null,
          data.bloodType || null,
          data.height ? Number(data.height) : null,
          data.weight ? Number(data.weight) : null,
          hb,
          hbStatus,
          riskLevel,
          userId,
        ],
      );
    });

    return { success: true, message: 'Setup profil awal berhasil disimpan.' };
  }
}
