import { PoolClient } from 'pg';
import db from '../../../config/database.js';
import {
  TTValidationResult,
  TTDoseLevel,
  isTTDoseLevel,
  toDateKey,
  validateTTRecord,
} from '../../../utils/ttIntervalValidator.js';
import { detectAttachmentMime, isAllowedAttachmentSize } from '../../../utils/fileValidation.js';

export type ImmunizationInfoSource = 'self_reported' | 'faskes_record' | 'health_worker';
export type ImmunizationDatePrecision = 'exact' | 'month' | 'year';
export type ImmunizationVaccineType = 'TT' | 'Td' | 'DPT' | 'Lainnya';

export interface ImmunizationRecord {
  id: string;
  doseLevel: TTDoseLevel;
  vaccineType: ImmunizationVaccineType;
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

export const IMMUNIZATION_SELECT = `
  SELECT id,
         dose_level AS "doseLevel",
         vaccine_type AS "vaccineType",
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

export const IMMUNIZATION_SELECT_INSERT = `
  INSERT INTO immunization_records
    (id, user_id, dose_level, vaccine_type, vaccine_date, faskes_name, batch_number, notes,
     info_source, date_precision, attachment_url, verification_status)`;

/** Status TT hanya boleh diturunkan dari dosis yang sudah diverifikasi. */
export async function syncTTStatusFromVerified(client: PoolClient, userId: string) {
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

export class ImmunizationService {
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
  static async loadValidationContext(userId: string) {
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

  /** Validasi tanpa menyimpan: dipakai UI untuk memperingatkan sebelum simpan. */
  static async validateImmunizationRecord(
    userId: string,
    data: {
      doseLevel?: TTDoseLevel;
      vaccineDate?: string;
      excludeRecordId?: string;
    },
  ): Promise<TTValidationResult> {
    const doseLevel = String(data.doseLevel || '').toUpperCase();
    if (!isTTDoseLevel(doseLevel)) {
      return { errors: ['Dosis TT tidak valid. Pilih antara TT1 sampai TT5.'], warnings: [] };
    }

    const context = await this.loadValidationContext(userId);
    if (data.excludeRecordId) {
      const current = await db.query<{ dose_level: string }>(
        `SELECT dose_level FROM immunization_records
         WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
        [data.excludeRecordId, userId],
      );
      const previousDose = current.rows[0]?.dose_level;
      if (previousDose && isTTDoseLevel(previousDose)) {
        delete context.existingDates[previousDose];
      }
    }

    return validateTTRecord({
      doseLevel,
      vaccineDate: data.vaccineDate || '',
      existingDates: context.existingDates,
      dateOfBirth: context.dateOfBirth,
      weddingDate: context.weddingDate,
    });
  }

  static async saveImmunizationRecord(
    userId: string,
    data: {
      doseLevel: TTDoseLevel;
      vaccineType?: ImmunizationVaccineType;
      vaccineDate: string;
      faskesName: string;
      batchNumber?: string;
      notes?: string;
      infoSource?: ImmunizationInfoSource;
      datePrecision?: ImmunizationDatePrecision;
      attachmentUrl?: string;
      /** Bila diisi, hanya jadwal ini yang ditandai selesai. */
      scheduleId?: string;
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
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
         RETURNING id,
                   dose_level AS "doseLevel",
                   vaccine_type AS "vaccineType",
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
          data.vaccineType || 'TT',
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
      // Bila `scheduleId` dikirim, hanya jadwal itu yang ditutup.
      await client.query(
        `UPDATE reminder_schedules
         SET status = 'Selesai', completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1
           AND status = 'Aktif'
           AND ($2::varchar IS NULL OR id = $2)
           AND ($3::varchar IS NULL OR tt_level = $3)`,
        [userId, data.scheduleId || null, data.scheduleId ? null : doseLevel],
      );

      // Otomatis masukkan catin ke antrean verifikasi admin bila ada dosis baru dicatat
      await client.query(
        `INSERT INTO certificate_verifications (user_id, status, requested_at)
         VALUES ($1, 'PENDING', CURRENT_TIMESTAMP)
         ON CONFLICT (user_id) DO UPDATE
         SET status = CASE WHEN certificate_verifications.status = 'APPROVED' THEN certificate_verifications.status ELSE 'PENDING' END,
             requested_at = COALESCE(certificate_verifications.requested_at, CURRENT_TIMESTAMP),
             updated_at = CURRENT_TIMESTAMP`,
        [userId],
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
      vaccineType?: ImmunizationVaccineType;
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
    const doseLevel = (
      data.doseLevel ? String(data.doseLevel).toUpperCase() : previous.doseLevel
    ) as TTDoseLevel;
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
             vaccine_type = $2,
             vaccine_date = $3,
             faskes_name = $4,
             batch_number = $5,
             notes = $6,
             info_source = $7,
             date_precision = $8,
             attachment_url = $9,
             verification_status = 'PENDING',
             verified_by = NULL,
             verified_at = NULL,
             verification_note = NULL,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $10 AND user_id = $11 AND deleted_at IS NULL
         RETURNING id,
                   dose_level AS "doseLevel",
                   vaccine_type AS "vaccineType",
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
          data.vaccineType || previous.vaccineType || 'TT',
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

  static attachmentPath(recordId: string) {
    return `/users/immunizations/${recordId}/attachment`;
  }

  /**
   * Simpan bukti imunisasi (opsional). Berkas disimpan sebagai BYTEA dan hanya
   * dapat diambil lewat endpoint ber-autentikasi milik pemilik/admin.
   */
  static async saveImmunizationAttachment(
    userId: string,
    recordId: string,
    file: { buffer: Buffer; fileName?: string },
  ) {
    const owner = await db.query<{ id: string }>(
      `SELECT id FROM immunization_records
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [recordId, userId],
    );
    if (owner.rows.length === 0) {
      throw new Error('Riwayat imunisasi tidak ditemukan.');
    }

    if (!isAllowedAttachmentSize(file.buffer.length)) {
      throw new Error('Ukuran berkas harus antara 1 byte dan 3 MB.');
    }
    const mimeType = detectAttachmentMime(file.buffer);
    if (!mimeType) {
      throw new Error('Format berkas tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF.');
    }

    const id = `att_${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 900 + 100)}`;
    const attachmentUrl = this.attachmentPath(recordId);

    await db.transaction(async client => {
      await client.query(`DELETE FROM immunization_attachments WHERE record_id = $1`, [recordId]);
      await client.query(
        `INSERT INTO immunization_attachments
           (id, record_id, user_id, file_name, mime_type, file_size, data)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, recordId, userId, file.fileName || null, mimeType, file.buffer.length, file.buffer],
      );
      await client.query(
        `UPDATE immunization_records
         SET attachment_url = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [attachmentUrl, recordId],
      );
    });

    return { success: true, attachmentUrl, mimeType, size: file.buffer.length };
  }

  static async getImmunizationAttachment(userId: string, recordId: string, isAdmin: boolean) {
    const res = await db.query<{
      file_name: string | null;
      mime_type: string;
      file_size: number;
      data: Buffer;
    }>(
      `SELECT a.file_name, a.mime_type, a.file_size, a.data
       FROM immunization_attachments a
       JOIN immunization_records r ON r.id = a.record_id
       WHERE a.record_id = $1
         AND r.deleted_at IS NULL
         AND ($2::boolean OR r.user_id = $3)`,
      [recordId, isAdmin, userId],
    );
    if (res.rows.length === 0) {
      throw new Error('Bukti imunisasi tidak ditemukan.');
    }
    return res.rows[0];
  }

  static async deleteImmunizationAttachment(userId: string, recordId: string) {
    const owner = await db.query<{ id: string }>(
      `SELECT id FROM immunization_records
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [recordId, userId],
    );
    if (owner.rows.length === 0) {
      throw new Error('Riwayat imunisasi tidak ditemukan.');
    }

    await db.transaction(async client => {
      await client.query(`DELETE FROM immunization_attachments WHERE record_id = $1`, [recordId]);
      await client.query(
        `UPDATE immunization_records
         SET attachment_url = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [recordId],
      );
    });

    return { success: true };
  }
}
