import { randomUUID } from 'crypto';
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
  static async calculateUserStreakReadOnly(
    userId: string,
    scheduleFrequency: 'daily' | 'weekly' = 'daily',
  ): Promise<StreakResult & { completedDates: string[] }> {
    const res = await db.query<{ scheduled_date: string; taken_at: string | null }>(
      `SELECT scheduled_date, taken_at 
       FROM consumption_logs 
       WHERE user_id = $1 AND status IN ('ON_TIME', 'LATE')
       ORDER BY scheduled_date DESC`,
      [userId],
    );

    const completedDates = res.rows.map((r: { scheduled_date: string }) =>
      typeof r.scheduled_date === 'string'
        ? r.scheduled_date.split('T')[0]
        : String(r.scheduled_date),
    );
    const streakResult = await calculateChronologicalStreak(completedDates, scheduleFrequency);

    return { ...streakResult, completedDates };
  }

  static async calculateAndSyncUserStreak(
    userId: string,
    scheduleFrequency: 'daily' | 'weekly' = 'daily',
  ): Promise<StreakResult & { completedDates: string[] }> {
    const result = await this.calculateUserStreakReadOnly(userId, scheduleFrequency);

    // Sync streak_count in user_profiles on mutation
    await db.query(
      `UPDATE user_profiles 
       SET streak_count = $1, last_active_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [result.streakCount, userId],
    );

    return result;
  }

  static async getDashboardData(userId: string): Promise<UserDashboardData | null> {
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const [userRes, scheduleRes, todayLogRes, articleRes] = await Promise.all([
      db.query<{
        name: string;
        email: string;
        phone: string | null;
        avatar_url: string | null;
        friend_code: string | null;
        school_or_org: string | null;
        risk_level: string | null;
        streak_count: number;
        pill_type?: string | null;
      }>(
        `SELECT u.name, u.email, u.phone, u.avatar_url,
                p.friend_code, p.school_or_org, p.risk_level, p.streak_count, p.pill_type
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
        created_at?: string | Date;
      }>(
        `SELECT id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, created_at
         FROM reminder_schedules
         WHERE user_id = $1 AND status = 'Aktif'
         ORDER BY created_at DESC LIMIT 1`,
        [userId],
      ),
      db.query<{
        status: string;
        taken_at: string | null;
        schedule_id?: string | null;
        created_at?: string | Date;
      }>(
        `SELECT status, taken_at, schedule_id, created_at 
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
    ]);

    const userRow = userRes.rows[0];
    if (!userRow) return null;

    let activeSchedule: UserScheduleData | null = null;
    let schedFrequencyType: 'daily' | 'weekly' = 'daily';

    if (scheduleRes.rows.length > 0) {
      const sch = scheduleRes.rows[0];
      const isDaily = sch.frequency?.toLowerCase().includes('hari') || sch.frequency === 'daily';
      schedFrequencyType = isDaily ? 'daily' : 'weekly';
      const dayOfWeek = sch.day_of_week || 'Sabtu';
      const timeSlot = sch.time_slot || '20:00';
      const { nextDate, daysRemaining } = calculateNextSchedule(dayOfWeek, timeSlot);

      activeSchedule = {
        id: sch.id,
        patientId: userId,
        tabletName: sch.tablet_name || 'Pil KB Kombinasi (28 Tablet)',
        dosage: sch.dosage || '1 tablet setiap hari',
        frequency: sch.frequency === 'daily' ? 'Harian' : '1x Seminggu',
        category: sch.frequency === 'daily' ? 'Pil KB Kombinasi' : 'Suplemen Tambahan',
        dayOfWeek,
        time: timeSlot,
        isEnabled: sch.is_enabled,
        remind15MinBefore: sch.remind_15min_before,
        instructions:
          sch.instructions ||
          'Minum 1 tablet setiap hari pada jam yang sama setelah makan malam atau sebelum tidur.',
        nextDate,
        daysRemaining,
        createdAt: sch.created_at ? new Date(sch.created_at).toISOString() : undefined,
        startDate: sch.created_at
          ? new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(
              new Date(sch.created_at),
            )
          : undefined,
      };
    }

    const streakResult = await this.calculateUserStreakReadOnly(userId, schedFrequencyType);

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
        completedDates: streakResult.completedDates || streakResult.consecutiveDates,
        schoolOrOrg: userRow.school_or_org,
        riskLevel: userRow.risk_level,
        friendCode: userRow.friend_code || undefined,
        pillType: userRow.pill_type || 'Pil KB Kombinasi',
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
      primaryGroup: null,
    };
  }

  static async getProfile(userId: string): Promise<UserProfile | null> {
    const res = await db.query<any>(
      `SELECT u.id, u.name, u.email, u.phone, u.avatar_url, u.date_of_birth,
              p.blood_type, p.height, p.weight, p.school_or_org, p.pill_type,
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
      pillType: row.pill_type || 'Pil KB Kombinasi',
      schoolOrOrg: row.school_or_org || undefined,
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
      if (data.pillType !== undefined) {
        profileUpdates.push(`pill_type = $${idx++}`);
        profileParams.push(data.pillType || 'Pil KB Kombinasi');
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

      const pillType = data.pillType || 'Pil KB Kombinasi';

      // 2. Update user profile
      await client.query(
        `UPDATE user_profiles
         SET school_or_org = $1,
             blood_type = $2,
             height = $3,
             weight = $4,
             pill_type = $5,
             last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $6`,
        [
          data.schoolOrOrg || null,
          data.bloodType || null,
          data.height ? Number(data.height) : null,
          data.weight ? Number(data.weight) : null,
          pillType,
          userId,
        ],
      );

      // 3. Create or update initial reminder schedule (only if explicitly provided)
      if (data.schedule && data.schedule.timeSlot) {
        const schedId = `sch_${randomUUID()}`;
        const tabletName =
          data.schedule?.tabletName ||
          (pillType === 'Mini Pil'
            ? 'Mini Pil / Progestin (28 Tablet)'
            : 'Pil KB Kombinasi (28 Tablet)');
        const instructions =
          data.schedule?.instructions ||
          (pillType === 'Mini Pil'
            ? 'Minum 1 tablet setiap hari pada jam yang sama persis (toleransi keterlambatan maksimal 3 jam).'
            : 'Minum 1 tablet setiap hari pada jam yang sama setelah makan malam atau sebelum tidur.');
        const timeSlot = data.schedule.timeSlot;
        const dayOfWeek = data.schedule?.dayOfWeek || 'Setiap Hari';

        await client.query(
          `INSERT INTO reminder_schedules (
            id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $9, 'Aktif')`,
          [
            schedId,
            userId,
            tabletName,
            data.schedule?.dosage || '1 tablet',
            data.schedule?.frequency || 'daily',
            dayOfWeek,
            timeSlot,
            data.schedule?.remind15MinBefore ?? true,
            instructions,
          ],
        );

        await client.query(`INSERT INTO schedule_time_slots (schedule_id, time) VALUES ($1, $2)`, [
          schedId,
          timeSlot,
        ]);
      }

      // 4. Save Screening Answers & Verification Document if provided
      if (data.document || data.screening) {
        const doc = data.document || {};
        const documentType = doc.documentType || 'KTP';
        const fileName = doc.fileName || 'dokumen-persyaratan';
        const fileType = doc.fileType || 'image/jpeg';
        const fileSize = Number(doc.fileSize) || 0;
        const fileData = doc.fileData || '';

        const verifId = `vrf_${randomUUID()}`;
        const screeningAnswers = data.screening || {};

        await client.query(
          `INSERT INTO user_verifications (
            id, user_id, status, screening_answers, document_type, document_file_name,
            document_file_type, document_file_size, document_file_data, updated_at
          ) VALUES ($1, $2, 'Pending', $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
          ON CONFLICT (user_id) DO UPDATE SET
            status = 'Pending',
            screening_answers = EXCLUDED.screening_answers,
            document_type = EXCLUDED.document_type,
            document_file_name = EXCLUDED.document_file_name,
            document_file_type = EXCLUDED.document_file_type,
            document_file_size = EXCLUDED.document_file_size,
            document_file_data = EXCLUDED.document_file_data,
            rejection_reason = NULL,
            reviewed_by = NULL,
            reviewed_at = NULL,
            updated_at = CURRENT_TIMESTAMP`,
          [
            verifId,
            userId,
            JSON.stringify(screeningAnswers),
            documentType,
            fileName,
            fileType,
            fileSize,
            fileData,
          ],
        );

        await client.query(
          `UPDATE users SET verification_status = 'Pending', rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
          [userId],
        );

        await client.query(
          `INSERT INTO user_verification_logs (user_id, action, previous_status, new_status, notes)
           VALUES ($1, 'SUBMITTED', NULL, 'Pending', 'Pengguna melengkapi berkas dan skrining persyaratan pil KB.')`,
          [userId],
        );
      }
    });

    return {
      success: true,
      verificationStatus: 'Pending',
      message: 'Setup profil awal dan dokumen persyaratan berhasil dikirim untuk verifikasi admin.',
    };
  }

  static async getVerificationStatus(userId: string) {
    const res = await db.query<any>(
      `SELECT u.id, u.name, u.email, u.verification_status, u.rejection_reason,
              v.id as verification_id, v.status as doc_status, v.screening_answers,
              v.document_type, v.document_file_name, v.document_file_type, v.document_file_size,
              v.reviewed_at, v.created_at as submitted_at
       FROM users u
       LEFT JOIN user_verifications v ON u.id = v.user_id
       WHERE u.id = $1`,
      [userId],
    );

    const row = res.rows[0];
    if (!row) return null;

    return {
      userId: row.id,
      name: row.name,
      email: row.email,
      verificationStatus: row.verification_status || 'Pending',
      rejectionReason: row.rejection_reason || null,
      verification: row.verification_id
        ? {
            id: row.verification_id,
            status: row.doc_status,
            screeningAnswers: row.screening_answers,
            documentType: row.document_type,
            documentFileName: row.document_file_name,
            documentFileType: row.document_file_type,
            documentFileSize: row.document_file_size,
            submittedAt: row.submitted_at,
            reviewedAt: row.reviewed_at,
          }
        : null,
    };
  }
}
