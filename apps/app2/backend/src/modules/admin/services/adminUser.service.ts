import db from '../../../config/database.js';
import { NotificationService } from '../../notifications/notification.service.js';

export interface ManagedUser {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  avatarUrl: string;
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah';
  status: 'Aktif' | 'Nonaktif';
  schoolOrOrg: string;
  assignedDoctor: string;
  activeSchedulesCount: number;
  adherenceRate: number;
  lastActive: string;
  joinDate: string;
  medicalNotes: string;
  lastReminderSent: string;
}

export class AdminUserService {
  static async getManagedUsers(): Promise<ManagedUser[]> {
    const res = await db.query<any>(`
      SELECT 
        u.id, u.name, u.gender, u.phone, u.email, u.avatar_url, u.created_at,
        p.risk_level, p.status, p.notes, p.school_or_org, p.friend_code, p.streak_count, p.last_active_at,
        (SELECT count(*) FROM reminder_schedules WHERE user_id = u.id AND status = 'Aktif') as active_schedules_count,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id) as total_logs,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id AND status IN ('ON_TIME', 'LATE')) as completed_logs
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.role = 'user'
      ORDER BY u.created_at DESC, u.name ASC
    `);

    return res.rows.map((r: any) => {
      const totalLogs = Number(r.total_logs) || 0;
      const completedLogs = Number(r.completed_logs) || 0;
      const adherenceRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 85;

      const d = r.last_active_at ? new Date(r.last_active_at) : new Date();
      const lastActiveStr = !isNaN(d.getTime())
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : 'Hari ini';

      const schoolOrOrg = r.school_or_org || 'Puskesmas / Faskes Terdaftar';

      return {
        id: r.id,
        name: r.name,
        age: 16,
        gender: r.gender || 'Perempuan',
        phone: r.phone || '-',
        email: r.email,
        avatarUrl: r.avatar_url || null,
        riskLevel: r.risk_level || 'Rendah',
        status: r.status || 'Aktif',
        schoolOrOrg,
        assignedDoctor: schoolOrOrg,
        activeSchedulesCount: Number(r.active_schedules_count) || 1,
        adherenceRate,
        lastActive: lastActiveStr,
        joinDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
        medicalNotes: r.notes || 'Rutin minum pil KB',
        lastReminderSent: 'Hari ini, 20:00 WIB',
      };
    });
  }

  static async getManagedUserById(userId: string): Promise<ManagedUser | null> {
    const res = await db.query<any>(
      `SELECT 
        u.id, u.name, u.gender, u.phone, u.email, u.avatar_url, u.created_at,
        p.risk_level, p.status, p.notes, p.school_or_org, p.friend_code, p.streak_count, p.last_active_at,
        (SELECT count(*) FROM reminder_schedules WHERE user_id = u.id AND status = 'Aktif') as active_schedules_count,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id) as total_logs,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id AND status IN ('ON_TIME', 'LATE')) as completed_logs
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = $1
      LIMIT 1`,
      [userId],
    );

    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    const totalLogs = Number(r.total_logs) || 0;
    const completedLogs = Number(r.completed_logs) || 0;
    const adherenceRate = totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 85;

    const d = r.last_active_at ? new Date(r.last_active_at) : new Date();
    const lastActiveStr = !isNaN(d.getTime())
      ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      : 'Hari ini';

    const schoolOrOrg = r.school_or_org || 'Puskesmas / Faskes Terdaftar';

    return {
      id: r.id,
      name: r.name,
      age: 16,
      gender: r.gender || 'Perempuan',
      phone: r.phone || '-',
      email: r.email,
      avatarUrl: r.avatar_url || null,
      riskLevel: r.risk_level || 'Rendah',
      status: r.status || 'Aktif',
      schoolOrOrg,
      assignedDoctor: schoolOrOrg,
      activeSchedulesCount: Number(r.active_schedules_count) || 1,
      adherenceRate,
      lastActive: lastActiveStr,
      joinDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
      medicalNotes: r.notes || 'Rutin minum pil KB',
      lastReminderSent: 'Hari ini, 20:00 WIB',
    };
  }

  static async createUser(data: {
    name: string;
    email: string;
    phone: string;
    gender?: string;
    riskLevel?: string;
    schoolOrOrg?: string;
    medicalNotes?: string;
    timeSlot?: string;
    schedule?: any;
    tabletName?: string;
  }) {
    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = null;
    const cleanTag =
      data.name
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'USER';
    const friendCode = `FE-${cleanTag}-${Math.floor(1000 + Math.random() * 9000)}`;
    const school = data.schoolOrOrg || 'Puskesmas / Faskes Terdaftar';

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, avatar_url, gender)
         VALUES ($1, $2, $3, 'user', $4, $5, $6)`,
        [
          newId,
          data.name,
          data.email.toLowerCase().trim(),
          data.phone,
          avatarUrl,
          data.gender || 'Perempuan',
        ],
      );

      await client.query(
        `INSERT INTO user_profiles (user_id, friend_code, school_or_org, risk_level, status, notes)
         VALUES ($1, $2, $3, $4, 'Aktif', $5)`,
        [newId, friendCode, school, data.riskLevel || 'Rendah', data.medicalNotes || null],
      );

      if (data.timeSlot || data.schedule) {
        await client.query(
          `INSERT INTO reminder_schedules (id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, status)
           VALUES ($1, $2, $3, '1 tablet', 'daily', 'Setiap Hari', $4, true, 'Aktif')`,
          [
            `sch_${newId}`,
            newId,
            data.tabletName || 'Pil KB Kombinasi (28 Tablet)',
            data.timeSlot || '20:00',
          ],
        );
      }
    });

    return this.getManagedUserById(newId);
  }

  static async updateUser(userId: string, data: any) {
    await db.transaction(async (client) => {
      if (data.name || data.email || data.phone || data.gender) {
        await client.query(
          `UPDATE users 
           SET 
             name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             gender = COALESCE($4, gender),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $5`,
          [
            data.name ?? null,
            data.email ? data.email.toLowerCase().trim() : null,
            data.phone ?? null,
            data.gender ?? null,
            userId,
          ],
        );
      }

      const school = data.schoolOrOrg || data.assignedDoctor;
      if (data.riskLevel || data.status || data.medicalNotes || school) {
        await client.query(
          `UPDATE user_profiles
           SET 
             risk_level = COALESCE($1, risk_level),
             status = COALESCE($2, status),
             school_or_org = COALESCE($3, school_or_org),
             notes = COALESCE($4, notes),
             last_active_at = CURRENT_TIMESTAMP
           WHERE user_id = $5`,
          [
            data.riskLevel ?? null,
            data.status ?? null,
            school ?? null,
            data.medicalNotes ?? null,
            userId,
          ],
        );
      }
    });

    return { success: true };
  }

  static async deleteUser(userId: string) {
    await db.query(`DELETE FROM users WHERE id = $1`, [userId]);
    return { success: true };
  }

  static async sendUserReminder(userId: string, message?: string, channel: string = 'app') {
    const nudgeId = `ndg_${Date.now().toString().slice(-6)}`;
    const msg = message || 'Halo! Jangan lupa minum Pil KB hari ini tepat waktu ya 🌸';

    await db.query(
      `INSERT INTO admin_nudges (id, user_id, title, message, channel, status)
       VALUES ($1, $2, 'Pengingat Minum Pil KB', $3, $4, 'UNREAD')`,
      [nudgeId, userId, msg, channel],
    );

    const push = channel === 'app'
      ? await NotificationService.sendToUser(userId, { title: 'Pengingat Minum Pil KB', body: msg, url: '/app2/user/dashboard' })
      : { sent: 0, configured: true };
    return { success: true, nudgeId, pushSent: push.sent > 0, pushConfigured: push.configured };
  }
}

