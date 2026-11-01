import db from '../../../config/database.js';

export class AdminVerificationService {
  static async getVerifications(filters?: {
    status?: string;
    search?: string;
  }): Promise<any[]> {
    let query = `
      SELECT 
        v.id, v.user_id, v.status, v.screening_answers, v.document_type,
        v.document_file_name, v.document_file_type, v.document_file_size,
        v.rejection_reason, v.reviewed_by, v.reviewed_at, v.created_at, v.updated_at,
        u.name as user_name, u.email as user_email, u.phone as user_phone, u.avatar_url as user_avatar,
        p.school_or_org, p.pill_type
      FROM user_verifications v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE 1=1
    `;
    const params: any[] = [];
    let idx = 1;

    if (filters?.status && filters.status !== 'Semua') {
      query += ` AND v.status = $${idx++}`;
      params.push(filters.status);
    }

    if (filters?.search && filters.search.trim()) {
      query += ` AND (lower(u.name) LIKE $${idx} OR lower(u.email) LIKE $${idx} OR u.phone LIKE $${idx})`;
      params.push(`%${filters.search.trim().toLowerCase()}%`);
      idx++;
    }

    query += ` ORDER BY CASE WHEN v.status = 'Pending' THEN 1 WHEN v.status = 'Rejected' THEN 2 ELSE 3 END, v.created_at DESC`;

    const res = await db.query<any>(query, params);
    return res.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      userPhone: r.user_phone || '-',
      userAvatar: r.user_avatar || null,
      schoolOrOrg: r.school_or_org || null,
      pillType: r.pill_type || 'Pil KB Kombinasi',
      status: r.status,
      screeningAnswers:
        typeof r.screening_answers === 'string'
          ? JSON.parse(r.screening_answers)
          : r.screening_answers,
      documentType: r.document_type,
      documentFileName: r.document_file_name,
      documentFileType: r.document_file_type,
      documentFileSize: Number(r.document_file_size) || 0,
      rejectionReason: r.rejection_reason || null,
      submittedAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
      reviewedBy: r.reviewed_by || null,
    }));
  }

  static async getVerificationDetail(userId: string) {
    const res = await db.query<any>(
      `SELECT 
        v.id, v.user_id, v.status, v.screening_answers, v.document_type,
        v.document_file_name, v.document_file_type, v.document_file_size,
        v.rejection_reason, v.reviewed_by, v.reviewed_at, v.created_at, v.updated_at,
        u.name as user_name, u.email as user_email, u.phone as user_phone, u.avatar_url as user_avatar,
        u.gender, u.date_of_birth,
        p.school_or_org, p.pill_type, p.blood_type, p.height, p.weight
      FROM user_verifications v
      JOIN users u ON v.user_id = u.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE v.user_id = $1`,
      [userId],
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    const logsRes = await db.query<any>(
      `SELECT l.id, l.user_id, l.action, l.previous_status, l.new_status, l.notes, l.admin_id, l.created_at,
              adm.name as admin_name
       FROM user_verification_logs l
       LEFT JOIN users adm ON l.admin_id = adm.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId],
    );

    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user_name,
      userEmail: r.user_email,
      userPhone: r.user_phone || '-',
      userAvatar: r.user_avatar || null,
      gender: r.gender,
      dateOfBirth: r.date_of_birth ? new Date(r.date_of_birth).toISOString().split('T')[0] : null,
      schoolOrOrg: r.school_or_org || null,
      pillType: r.pill_type || 'Pil KB Kombinasi',
      bloodType: r.blood_type || null,
      height: r.height,
      weight: r.weight,
      status: r.status,
      screeningAnswers:
        typeof r.screening_answers === 'string'
          ? JSON.parse(r.screening_answers)
          : r.screening_answers,
      documentType: r.document_type,
      documentFileName: r.document_file_name,
      documentFileType: r.document_file_type,
      documentFileSize: Number(r.document_file_size) || 0,
      rejectionReason: r.rejection_reason || null,
      submittedAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
      reviewedAt: r.reviewed_at ? new Date(r.reviewed_at).toISOString() : null,
      reviewedBy: r.reviewed_by || null,
      history: logsRes.rows.map(l => ({
        id: l.id,
        action: l.action,
        previousStatus: l.previous_status,
        newStatus: l.new_status,
        notes: l.notes,
        adminName: l.admin_name || 'Admin Faskes',
        createdAt: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString(),
      })),
    };
  }

  static async getVerificationDocument(userId: string) {
    const res = await db.query<{
      document_file_name: string;
      document_file_type: string;
      document_file_data: string;
    }>(
      `SELECT document_file_name, document_file_type, document_file_data
       FROM user_verifications
       WHERE user_id = $1`,
      [userId],
    );
    return res.rows[0] || null;
  }

  static async approveVerification(userId: string, adminId: string) {
    return await db.transaction(async client => {
      const currentRes = await client.query<{ status: string }>(
        `SELECT status FROM user_verifications WHERE user_id = $1`,
        [userId],
      );
      const prevStatus = currentRes.rows[0]?.status || 'Pending';

      await client.query(
        `UPDATE user_verifications
         SET status = 'Approved', rejection_reason = NULL, reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2`,
        [adminId, userId],
      );

      await client.query(
        `UPDATE users
         SET verification_status = 'Approved', rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [userId],
      );

      await client.query(
        `INSERT INTO user_verification_logs (user_id, action, previous_status, new_status, notes, admin_id)
         VALUES ($1, 'APPROVED', $2, 'Approved', 'Pendaftaran disetujui oleh admin.', $3)`,
        [userId, prevStatus, adminId],
      );

      return { success: true, message: 'Pendaftaran pengguna berhasil disetujui.' };
    });
  }

  static async rejectVerification(userId: string, adminId: string, reason: string) {
    if (!reason || !reason.trim()) {
      return { success: false, error: 'Alasan penolakan wajib diisi.' };
    }

    return await db.transaction(async client => {
      const currentRes = await client.query<{ status: string }>(
        `SELECT status FROM user_verifications WHERE user_id = $1`,
        [userId],
      );
      const prevStatus = currentRes.rows[0]?.status || 'Pending';
      const cleanReason = reason.trim();

      await client.query(
        `UPDATE user_verifications
         SET status = 'Rejected', rejection_reason = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3`,
        [cleanReason, adminId, userId],
      );

      await client.query(
        `UPDATE users
         SET verification_status = 'Rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [cleanReason, userId],
      );

      await client.query(
        `INSERT INTO user_verification_logs (user_id, action, previous_status, new_status, notes, admin_id)
         VALUES ($1, 'REJECTED', $2, 'Rejected', $3, $4)`,
        [userId, prevStatus, cleanReason, adminId],
      );

      return { success: true, message: 'Pendaftaran pengguna telah ditolak dengan catatan alasan.' };
    });
  }

  static async getVerificationHistory(userId: string) {
    const res = await db.query<any>(
      `SELECT l.id, l.user_id, l.action, l.previous_status, l.new_status, l.notes, l.admin_id, l.created_at,
              adm.name as admin_name
       FROM user_verification_logs l
       LEFT JOIN users adm ON l.admin_id = adm.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [userId],
    );
    return res.rows.map(l => ({
      id: l.id,
      action: l.action,
      previousStatus: l.previous_status,
      newStatus: l.new_status,
      notes: l.notes,
      adminName: l.admin_name || 'Admin Faskes',
      createdAt: l.created_at ? new Date(l.created_at).toISOString() : new Date().toISOString(),
    }));
  }
}

