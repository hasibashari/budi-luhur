import db from '../../../config/database.js';
import {
  UserProfile,
  UserDashboardData,
  UserScheduleData,
  StreakResult,
} from '../../../types/index.js';
import { calculateNextSchedule } from '../../../utils/scheduleHelpers.js';
import { calculateChronologicalStreak } from '../../../utils/streakCalculator.js';
import { ImmunizationRecord, IMMUNIZATION_SELECT } from './immunization.service.js';

export class UserProfileService {
  static async calculateAndSyncUserStreak(
    userId: string,
    scheduleFrequency: 'daily' | 'weekly' = 'weekly',
    persist: boolean = true,
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

    if (persist) {
      // Sync streak_count in user_profiles only on write operations
      await db.query(
        `UPDATE user_profiles 
         SET streak_count = $1, last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [streakResult.streakCount, userId],
      );
    }

    return streakResult;
  }

  static async getDashboardData(userId: string): Promise<UserDashboardData | null> {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const [userRes, immunizationRes, scheduleRes, todayLogRes, articleRes, streakLogsRes] =
      await Promise.all([
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
          wedding_date: string | null;
          tt_status: string | null;
          kua_status: string | null;
          partner_name: string | null;
          notes: string | null;
        }>(
          `SELECT u.name, u.email, u.phone, u.avatar_url,
                  p.friend_code, p.school_or_org, p.hb_level, p.risk_level, p.streak_count,
                  p.wedding_date, p.tt_status, p.kua_status, p.partner_name, p.notes
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.id = $1`,
          [userId],
        ),
        db.query<ImmunizationRecord>(
          `${IMMUNIZATION_SELECT}
           WHERE user_id = $1 AND verification_status <> 'REJECTED' AND deleted_at IS NULL
           ORDER BY vaccine_date ASC, dose_level ASC`,
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
          reminder_timing: string;
          channel_push: boolean;
          channel_whatsapp: boolean;
          channel_email: boolean;
          instructions: string | null;
        }>(
          `SELECT id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before,
                  reminder_timing, channel_push, channel_whatsapp, channel_email, instructions
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
          author_name?: string;
          author_role?: string;
        }>(
          `SELECT id, title, category, read_time, summary, image_url, author_name, author_role 
           FROM articles 
           WHERE status = 'Terbit' 
           ORDER BY is_featured DESC, published_at DESC LIMIT 1`,
        ),
        db.query<{ scheduled_date: string; taken_at: string | null }>(
          `SELECT scheduled_date, taken_at 
           FROM consumption_logs 
           WHERE user_id = $1 AND status IN ('ON_TIME', 'LATE')
           ORDER BY scheduled_date DESC`,
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
        tabletName: sch.tablet_name || 'Vaksin Tetanus Toxoid (TT)',
        dosage: sch.dosage || '1 dosis (0.5 mL)',
        frequency: sch.frequency === 'daily' ? 'Harian' : 'Sesuai Jadwal',
        category: 'Imunisasi TT',
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

    const completedDates = streakLogsRes.rows.map(r => r.scheduled_date);
    const streakResult = await calculateChronologicalStreak(completedDates, schedFrequencyType);

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
    }

    const article = articleRes.rows[0];

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
        weddingDate: userRow.wedding_date || undefined,
        ttStatus: userRow.tt_status || 'TT0',
        kuaStatus: userRow.kua_status || undefined,
        partnerName: userRow.partner_name || undefined,
        notes: userRow.notes || undefined,
      },
      immunizationRecords: immunizationRes.rows,
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
            author: article.author_name
              ? {
                  name: article.author_name,
                  role: article.author_role || 'Tim Medis Kemenkes',
                }
              : undefined,
          }
        : null,
      activeBuddy: null,
      primaryGroup: null,
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
      dateOfBirth: row.date_of_birth ? row.date_of_birth.toISOString().split('T')[0] : undefined,
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
      }
      if (data.riskLevel !== undefined) {
        profileUpdates.push(`risk_level = $${idx++}`);
        profileParams.push(data.riskLevel || 'Rendah');
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
      if (data.partnerName !== undefined) {
        profileUpdates.push(`partner_name = $${idx++}`);
        profileParams.push(data.partnerName || null);
      }
      if (data.weddingDate !== undefined) {
        profileUpdates.push(`wedding_date = $${idx++}`);
        profileParams.push(data.weddingDate || null);
      }
      if (data.ttStatus !== undefined) {
        profileUpdates.push(`tt_status = $${idx++}`);
        profileParams.push(data.ttStatus || 'TT0');
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
      const riskLevel = data.riskLevel || 'Rendah';

      await client.query(
        `UPDATE user_profiles
         SET school_or_org = $1,
             blood_type = $2,
             height = $3,
             weight = $4,
             hb_level = $5,
             risk_level = $6,
             partner_name = $7,
             wedding_date = $8,
             tt_status = $9,
             last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $10`,
        [
          data.schoolOrOrg || null,
          data.bloodType || null,
          data.height ? Number(data.height) : null,
          data.weight ? Number(data.weight) : null,
          hb,
          riskLevel,
          data.partnerName || null,
          data.weddingDate || null,
          data.ttStatus || 'TT0',
          userId,
        ],
      );
    });

    return { success: true, message: 'Setup profil awal berhasil disimpan.' };
  }
}
