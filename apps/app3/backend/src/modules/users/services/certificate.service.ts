import db from '../../../config/database.js';

export class CertificateService {
  static async getCertificateVerification(userId: string) {
    const res = await db.query<{
      status: string;
      certificate_number: string | null;
      note: string | null;
      requested_at: string | null;
      reviewed_by: string | null;
      reviewed_at: string | null;
      signer_name: string | null;
      signer_sip: string | null;
    }>(
      `SELECT status, certificate_number, note, requested_at,
              reviewed_by, reviewed_at, signer_name, signer_sip
       FROM certificate_verifications
       WHERE user_id = $1`,
      [userId],
    );
    const row = res.rows[0];
    return {
      status: row?.status || 'DRAFT',
      certificateNumber: row?.certificate_number || null,
      note: row?.note || null,
      requestedAt: row?.requested_at || null,
      reviewedBy: row?.reviewed_by || null,
      reviewedAt: row?.reviewed_at || null,
      signerName: row?.signer_name || null,
      signerSip: row?.signer_sip || null,
    };
  }

  /** Pengguna hanya dapat MENGAJUKAN; persetujuan tetap di admin. */
  static async requestCertificateVerification(userId: string, note?: string) {
    const current = await this.getCertificateVerification(userId);
    if (current.status === 'APPROVED') {
      return { success: true, status: 'APPROVED' as const, message: 'Sertifikat sudah disetujui.' };
    }

    const year = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }).slice(0, 4);
    const code =
      userId
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(-6)
        .toUpperCase() || String(Date.now()).slice(-6);
    const certificateNumber = current.certificateNumber || `TEMANI-TT/${year}/${code}`;

    await db.query(
      `INSERT INTO certificate_verifications
         (user_id, status, certificate_number, note, requested_at, updated_at)
       VALUES ($1, 'PENDING', $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE SET
         status = 'PENDING',
         certificate_number = COALESCE(certificate_verifications.certificate_number, EXCLUDED.certificate_number),
         note = EXCLUDED.note,
         requested_at = CURRENT_TIMESTAMP,
         reviewed_by = NULL,
         reviewed_at = NULL,
         updated_at = CURRENT_TIMESTAMP`,
      [userId, certificateNumber, note?.trim() || null],
    );

    return { success: true, status: 'PENDING' as const, certificateNumber };
  }

  static async listCertificateVerifications(status?: string) {
    const statusParam = status ? status.toUpperCase() : null;
    const res = await db.query<{
      user_id: string;
      name: string;
      school_or_org: string | null;
      status: string;
      certificate_number: string | null;
      note: string | null;
      requested_at: string | null;
      reviewed_by: string | null;
      reviewed_at: string | null;
      signer_name: string | null;
      signer_sip: string | null;
      verified_doses: string;
      total_records: string;
    }>(
      `WITH user_imm_stats AS (
         SELECT r.user_id,
                COUNT(*)::text AS total_records,
                COUNT(*) FILTER (WHERE r.verification_status = 'VERIFIED')::text AS verified_doses,
                COUNT(*) FILTER (WHERE r.verification_status = 'PENDING') AS pending_count,
                MAX(r.created_at) AS latest_record_at
         FROM immunization_records r
         WHERE r.deleted_at IS NULL
         GROUP BY r.user_id
       )
       SELECT u.id AS user_id,
              u.name,
              p.school_or_org,
              COALESCE(
                cv.status,
                CASE
                  WHEN COALESCE(s.pending_count, 0) > 0 THEN 'PENDING'
                  WHEN COALESCE(s.total_records::int, 0) > 0 THEN 'APPROVED'
                  ELSE 'DRAFT'
                END
              ) AS status,
              cv.certificate_number,
              cv.note,
              COALESCE(cv.requested_at, s.latest_record_at, u.created_at) AS requested_at,
              cv.reviewed_by,
              cv.reviewed_at,
              cv.signer_name,
              cv.signer_sip,
              COALESCE(s.verified_doses, '0') AS verified_doses,
              COALESCE(s.total_records, '0') AS total_records
       FROM users u
       LEFT JOIN certificate_verifications cv ON cv.user_id = u.id
       LEFT JOIN user_profiles p ON p.user_id = u.id
       LEFT JOIN user_imm_stats s ON s.user_id = u.id
       WHERE u.role = 'user'
         AND (cv.user_id IS NOT NULL OR s.user_id IS NOT NULL)
         AND (
           $1::text IS NULL
           OR COALESCE(
                cv.status,
                CASE
                  WHEN COALESCE(s.pending_count, 0) > 0 THEN 'PENDING'
                  WHEN COALESCE(s.total_records::int, 0) > 0 THEN 'APPROVED'
                  ELSE 'DRAFT'
                END
              ) = $1::text
         )
       ORDER BY
         CASE COALESCE(cv.status, CASE WHEN COALESCE(s.pending_count, 0) > 0 THEN 'PENDING' ELSE 'DRAFT' END)
           WHEN 'PENDING' THEN 0
           WHEN 'APPROVED' THEN 2
           ELSE 1
         END,
         COALESCE(cv.requested_at, s.latest_record_at) DESC NULLS LAST
       LIMIT 200`,
      [statusParam],
    );

    return res.rows.map(row => ({
      userId: row.user_id,
      name: row.name,
      faskesName: row.school_or_org,
      status: row.status,
      certificateNumber: row.certificate_number,
      note: row.note,
      requestedAt: row.requested_at,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      signerName: row.signer_name,
      signerSip: row.signer_sip,
      verifiedDoses: Number(row.verified_doses) || 0,
      totalRecords: Number(row.total_records) || 0,
    }));
  }

  /** Approve/reject TTD sertifikat. Hanya dipanggil dari endpoint admin. */
  static async reviewCertificateVerification(
    userId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewer: string,
    options?: { note?: string | null; signerName?: string | null; signerSip?: string | null },
  ) {
    const updated = await db.query<{ user_id: string }>(
      `INSERT INTO certificate_verifications 
         (user_id, status, note, reviewed_by, reviewed_at, signer_name, signer_sip, updated_at)
       VALUES
         ($1::varchar, $2::varchar, $3::text, $4::varchar, CURRENT_TIMESTAMP, 
          CASE WHEN $2::varchar = 'APPROVED' THEN $5::varchar ELSE NULL END, 
          CASE WHEN $2::varchar = 'APPROVED' THEN $6::varchar ELSE NULL END, 
          CURRENT_TIMESTAMP)
       ON CONFLICT (user_id) DO UPDATE
       SET status = EXCLUDED.status,
           note = COALESCE(EXCLUDED.note, certificate_verifications.note),
           reviewed_by = EXCLUDED.reviewed_by,
           reviewed_at = CURRENT_TIMESTAMP,
           signer_name = EXCLUDED.signer_name,
           signer_sip = EXCLUDED.signer_sip,
           updated_at = CURRENT_TIMESTAMP
       RETURNING user_id`,
      [
        userId,
        status,
        options?.note ?? null,
        reviewer,
        options?.signerName ?? null,
        options?.signerSip ?? null,
      ],
    );
    if (updated.rows.length === 0) {
      throw new Error('Pengajuan verifikasi sertifikat tidak ditemukan.');
    }
    return { success: true, status };
  }
}
