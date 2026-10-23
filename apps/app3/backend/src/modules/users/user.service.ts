import { PoolClient } from 'pg';
import db from '../../config/database.js';
import {
  UserProfile,
  UserDashboardData,
  UserScheduleData,
  StreakResult,
} from '../../types/index.js';
import { calculateNextSchedule } from '../../utils/scheduleHelpers.js';
import { calculateChronologicalStreak } from '../../utils/streakCalculator.js';
import {
  TTValidationResult,
  TTDoseLevel,
  isTTDoseLevel,
  toDateKey,
  validateTTRecord,
} from '../../utils/ttIntervalValidator.js';

export type ImmunizationInfoSource = 'self_reported' | 'faskes_record' | 'health_worker';
export type ImmunizationDatePrecision = 'exact' | 'month' | 'year';

export interface ImmunizationRecord {
  id: string;
  doseLevel: TTDoseLevel;
  vaccineDate: string;
  faskesName: string;
  batchNumber?: string;
  notes?: string;
  infoSource: ImmunizationInfoSource;
  datePrecision: ImmunizationDatePrecision;
  attachmentUrl?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveImmunizationResult {
  record: ImmunizationRecord;
  warnings: string[];
}

const IMMUNIZATION_SELECT = `
  SELECT id,
         dose_level AS "doseLevel",
         vaccine_date AS "vaccineDate",
         faskes_name AS "faskesName",
         batch_number AS "batchNumber",
         notes,
         info_source AS "infoSource",
         date_precision AS "datePrecision",
         attachment_url AS "attachmentUrl",
         verification_status AS "verificationStatus",
         verified_by AS "verifiedBy",
         verified_at AS "verifiedAt",
         verification_note AS "verificationNote",
         created_at AS "createdAt",
         updated_at AS "updatedAt"
  FROM immunization_records`;

const IMMUNIZATION_SELECT_INSERT = `
  INSERT INTO immunization_records
    (id, user_id, dose_level, vaccine_date, faskes_name, batch_number, notes,
     info_source, date_precision, attachment_url, verification_status)`;


/** Status TT hanya boleh diturunkan dari dosis yang sudah diverifikasi. */
async function syncTTStatusFromVerified(client: PoolClient, userId: string) {
  const res = await client.query<{ dose_level: string }>(
    `SELECT dose_level
     FROM immunization_records
     WHERE user_id = $1 AND verification_status = 'VERIFIED' AND deleted_at IS NULL
     ORDER BY dose_level DESC
     LIMIT 1`,
    [userId],
  );
  const ttStatus = res.rows[0]?.dose_level || 'TT0';
  await client.query(
    `UPDATE user_profiles
     SET tt_status = $1, last_active_at = CURRENT_TIMESTAMP
     WHERE user_id = $2`,
    [ttStatus, userId],
  );
  return ttStatus as TTDoseLevel | 'TT0';
}


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

    const [userRes, immunizationRes, scheduleRes, todayLogRes, articleRes, groupRes] = await Promise.all([
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
        reminderTiming: sch.reminder_timing,
        channelPush: sch.channel_push,
        channelWhatsapp: sch.channel_whatsapp,
        channelEmail: sch.channel_email,
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

  /**
   * Riwayat lengkap milik pengguna (termasuk yang masih PENDING & REJECTED)
   * agar UI bisa menampilkan status verifikasi secara jujur.
   */
  static async getImmunizationRecords(userId: string): Promise<ImmunizationRecord[]> {
    const result = await db.query<ImmunizationRecord>(
      `${IMMUNIZATION_SELECT}
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY vaccine_date DESC, dose_level DESC`,
      [userId],
    );
    return result.rows;
  }

  /** Kumpulan tanggal dosis yang sudah tercatat, untuk validasi interval. */
  private static async loadValidationContext(userId: string) {
    const [profileRes, doseRes] = await Promise.all([
      db.query<{ date_of_birth: string | null; wedding_date: string | null }>(
        `SELECT u.date_of_birth, p.wedding_date
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE u.id = $1`,
        [userId],
      ),
      db.query<{ dose_level: string; vaccine_date: string }>(
        `SELECT dose_level, vaccine_date
         FROM immunization_records
         WHERE user_id = $1 AND deleted_at IS NULL AND verification_status <> 'REJECTED'`,
        [userId],
      ),
    ]);

    const existingDates: Partial<Record<TTDoseLevel, string>> = {};
    for (const row of doseRes.rows) {
      if (!isTTDoseLevel(row.dose_level)) continue;
      const key = toDateKey(row.vaccine_date);
      if (key) existingDates[row.dose_level] = key;
    }

    return {
      dateOfBirth: profileRes.rows[0]?.date_of_birth ?? null,
      weddingDate: profileRes.rows[0]?.wedding_date ?? null,
      existingDates,
    };
  }

  static async saveImmunizationRecord(
    userId: string,
    data: {
      doseLevel: TTDoseLevel;
      vaccineDate: string;
      faskesName: string;
      batchNumber?: string;
      notes?: string;
      infoSource?: ImmunizationInfoSource;
      datePrecision?: ImmunizationDatePrecision;
      attachmentUrl?: string;
    },
  ): Promise<SaveImmunizationResult> {
    const doseLevel = String(data.doseLevel || '').toUpperCase();
    if (!isTTDoseLevel(doseLevel)) {
      throw new Error('Dosis TT tidak valid. Pilih antara TT1 sampai TT5.');
    }
    if (!data.vaccineDate || !data.faskesName?.trim()) {
      throw new Error('Tanggal pemberian dan faskes wajib diisi.');
    }

    const context = await this.loadValidationContext(userId);
    const validation: TTValidationResult = validateTTRecord({
      doseLevel,
      vaccineDate: data.vaccineDate,
      existingDates: context.existingDates,
      dateOfBirth: context.dateOfBirth,
      weddingDate: context.weddingDate,
    });
    if (validation.errors.length > 0) {
      throw new Error(validation.errors[0]);
    }

    const record = await db.transaction(async client => {
      const duplicate = await client.query<{ id: string }>(
        `SELECT id FROM immunization_records
         WHERE user_id = $1 AND dose_level = $2
           AND deleted_at IS NULL AND verification_status <> 'REJECTED'
         LIMIT 1`,
        [userId, doseLevel],
      );
      if (duplicate.rows.length > 0) {
        throw new Error(
          `Riwayat ${doseLevel} sudah tercatat. Perbaiki melalui tombol edit pada riwayat tersebut.`,
        );
      }

      const id = `imm_${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
      const inserted = await client.query<ImmunizationRecord>(
        `${IMMUNIZATION_SELECT_INSERT}
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING')
         RETURNING id,
                   dose_level AS "doseLevel",
                   vaccine_date AS "vaccineDate",
                   faskes_name AS "faskesName",
                   batch_number AS "batchNumber",
                   notes,
                   info_source AS "infoSource",
                   date_precision AS "datePrecision",
                   attachment_url AS "attachmentUrl",
                   verification_status AS "verificationStatus",
                   verified_by AS "verifiedBy",
                   verified_at AS "verifiedAt",
                   verification_note AS "verificationNote",
                   created_at AS "createdAt",
                   updated_at AS "updatedAt"`,
        [
          id,
          userId,
          doseLevel,
          data.vaccineDate,
          data.faskesName.trim(),
          data.batchNumber || null,
          data.notes || null,
          data.infoSource || 'self_reported',
          data.datePrecision || 'exact',
          data.attachmentUrl || null,
        ],
      );

      // Jadwal adalah proyeksi riwayat: dosis yang baru dicatat menutup jadwal terkait.
      await client.query(
        `UPDATE reminder_schedules
         SET status = 'Selesai', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1 AND tt_level = $2 AND status = 'Aktif'`,
        [userId, doseLevel],
      );

      return inserted.rows[0];
    });

    return { record, warnings: validation.warnings };
  }

  static async updateImmunizationRecord(
    userId: string,
    recordId: string,
    data: {
      doseLevel?: TTDoseLevel;
      vaccineDate?: string;
      faskesName?: string;
      batchNumber?: string | null;
      notes?: string | null;
      infoSource?: ImmunizationInfoSource;
      datePrecision?: ImmunizationDatePrecision;
      attachmentUrl?: string | null;
    },
  ): Promise<SaveImmunizationResult> {
    const current = await db.query<ImmunizationRecord>(
      `${IMMUNIZATION_SELECT} WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [recordId, userId],
    );
    if (current.rows.length === 0) {
      throw new Error('Riwayat imunisasi tidak ditemukan.');
    }

    const previous = current.rows[0];
    const doseLevel = (data.doseLevel ? String(data.doseLevel).toUpperCase() : previous.doseLevel) as TTDoseLevel;
    if (!isTTDoseLevel(doseLevel)) {
      throw new Error('Dosis TT tidak valid. Pilih antara TT1 sampai TT5.');
    }
    const vaccineDate = toDateKey(data.vaccineDate) || toDateKey(previous.vaccineDate) || '';
    const faskesName = (data.faskesName ?? previous.faskesName ?? '').trim();
    if (!vaccineDate || !faskesName) {
      throw new Error('Tanggal pemberian dan faskes wajib diisi.');
    }

    const context = await this.loadValidationContext(userId);
    // Saat edit, abaikan tanggal milik record ini agar tidak dibandingkan dengan dirinya sendiri.
    if (isTTDoseLevel(previous.doseLevel) && context.existingDates[previous.doseLevel]) {
      delete context.existingDates[previous.doseLevel];
    }
    const validation = validateTTRecord({
      doseLevel,
      vaccineDate,
      existingDates: context.existingDates,
      dateOfBirth: context.dateOfBirth,
      weddingDate: context.weddingDate,
    });
    if (validation.errors.length > 0) {
      throw new Error(validation.errors[0]);
    }

    const updated = await db.transaction(async client => {
      const res = await client.query<ImmunizationRecord>(
        `UPDATE immunization_records
         SET dose_level = $1,
             vaccine_date = $2,
             faskes_name = $3,
             batch_number = $4,
             notes = $5,
             info_source = $6,
             date_precision = $7,
             attachment_url = $8,
             verification_status = 'PENDING',
             verified_by = NULL,
             verified_at = NULL,
             verification_note = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 AND user_id = $10 AND deleted_at IS NULL
         RETURNING id,
                   dose_level AS "doseLevel",
                   vaccine_date AS "vaccineDate",
                   faskes_name AS "faskesName",
                   batch_number AS "batchNumber",
                   notes,
                   info_source AS "infoSource",
                   date_precision AS "datePrecision",
                   attachment_url AS "attachmentUrl",
                   verification_status AS "verificationStatus",
                   verified_by AS "verifiedBy",
                   verified_at AS "verifiedAt",
                   verification_note AS "verificationNote",
                   created_at AS "createdAt",
                   updated_at AS "updatedAt"`,
        [
          doseLevel,
          vaccineDate,
          faskesName,
          data.batchNumber ?? previous.batchNumber ?? null,
          data.notes ?? previous.notes ?? null,
          data.infoSource || previous.infoSource || 'self_reported',
          data.datePrecision || previous.datePrecision || 'exact',
          data.attachmentUrl ?? previous.attachmentUrl ?? null,
          recordId,
          userId,
        ],
      );

      // Data berubah → status verifikasi perlu diulang.
      await syncTTStatusFromVerified(client, userId);
      return res.rows[0];
    });

    return { record: updated, warnings: validation.warnings };
  }

  static async deleteImmunizationRecord(userId: string, recordId: string) {
    return db.transaction(async client => {
      const res = await client.query<{ id: string }>(
        `UPDATE immunization_records
         SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
         RETURNING id`,
        [recordId, userId],
      );
      if (res.rows.length === 0) {
        throw new Error('Riwayat imunisasi tidak ditemukan.');
      }
      const ttStatus = await syncTTStatusFromVerified(client, userId);
      return { success: true, ttStatus };
    });
  }

  /**
   * Verifikasi/reject oleh tenaga kesehatan. Hanya memengaruhi status TT
   * melalui dosis yang benar-benar VERIFIED.
   */
  static async verifyImmunizationRecord(
    recordId: string,
    status: 'VERIFIED' | 'REJECTED',
    verifiedBy: string,
    note?: string | null,
  ) {
    return db.transaction(async client => {
      const res = await client.query<{ id: string; user_id: string }>(
        `UPDATE immunization_records
         SET verification_status = $1,
             verified_by = $2,
             verified_at = CURRENT_TIMESTAMP,
             verification_note = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND deleted_at IS NULL
         RETURNING id, user_id`,
        [status, verifiedBy, note || null, recordId],
      );
      if (res.rows.length === 0) {
        throw new Error('Riwayat imunisasi tidak ditemukan.');
      }
      const userId = res.rows[0].user_id;
      const ttStatus = await syncTTStatusFromVerified(client, userId);
      return { success: true, ttStatus };
    });
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
      let hbStatus: string | null = hb ? 'Normal' : null;
      let riskLevel: string | null = hb ? 'Rendah' : null;
      if (hb && hb < 11.0) {
        hbStatus = hb < 8.0 ? 'Anemia Berat' : 'Anemia Sedang';
        riskLevel = 'Tinggi';
      } else if (hb && hb < 12.0) {
        hbStatus = 'Anemia Ringan';
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
             partner_name = $8,
             wedding_date = $9,
             tt_status = $10,
             last_active_at = CURRENT_TIMESTAMP
         WHERE user_id = $11`,
        [
          data.schoolOrOrg || null,
          data.bloodType || null,
          data.height ? Number(data.height) : null,
          data.weight ? Number(data.weight) : null,
          hb,
          hbStatus,
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
