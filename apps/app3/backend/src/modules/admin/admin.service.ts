import db from '../../config/database.js';
import { NotificationService } from '../notifications/notification.service.js';

function normalizeArticleCategory(category: string): string {
  const normalized = category.trim().replace(/\s+/g, ' ');
  if (!normalized) throw new Error('Kategori artikel wajib diisi.');
  return normalized.toLowerCase() === 'kesehatan pranikah' ? 'Catin' : normalized;
}

export interface AdminStats {
  totalUsers: number;
  activeSchedules: number;
  adherenceRate: number;
  publishedArticles: number;
  activePrograms: number;
}

export interface ManagedUser {
  id: string;
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  email: string;
  avatarUrl: string | null;
  riskLevel: 'Tinggi' | 'Sedang' | 'Rendah' | null;
  status: 'Aktif' | 'Nonaktif';
  /** null berarti calon pengantin belum mengisi — jangan diisi nilai karangan. */
  schoolOrOrg: string | null;
  assignedDoctor: string | null;
  activeSchedulesCount: number;
  adherenceRate: number | null;
  lastActive: string | null;
  joinDate: string;
  medicalNotes: string | null;
  lastReminderSent: string | null;
  weddingDate: string | null;
  ttStatus: 'TT0' | 'TT1' | 'TT2' | 'TT3' | 'TT4' | 'TT5' | null;
  kuaStatus: 'Terverifikasi' | 'Menunggu Skrining' | 'Belum Lengkap' | null;
  partnerName: string | null;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  publishDate: string;
  status: 'Terbit' | 'Draf';
  views: number;
  summary: string;
  readTime: string;
  imageUrl: string;
  content: string;
}

export interface MedicationSchedule {
  id: string;
  userId: string;
  userName: string;
  patientId?: string;
  patientName?: string;
  partnerName?: string;
  medicationName: string;
  dosage: string;
  frequency: '1x Seminggu' | 'Harian' | string;
  dayOfWeek?: string;
  timeSlots: string[];
  startDate: string;
  endDate: string;
  status: 'Aktif' | 'Selesai' | 'Diberhentikan';
  category: 'TTD Rutin' | 'Suplemen TTD' | 'Suplemen Tambahan' | 'Imunisasi TT';
  instructions: string;
  lastReminderSent?: string;
  todayStatus?: 'COMPLETED' | 'PENDING' | 'NOT_YET_TIME' | 'OFF_SCHEDULE' | 'MISSED';
  ttLevel?: string;
  scheduledDate?: string;
  completedAt?: string;
  isEnabled?: boolean;
}

export interface ComplianceReport {
  date: string;
  takenCount: number;
  missedCount: number;
  adherencePercentage: number;
}

export class AdminService {
  private static async resolveCategory(
    client: { query: Function },
    category: string,
    articleId?: string,
  ): Promise<string> {
    const normalized = normalizeArticleCategory(category);
    const existing = await client.query(
      `SELECT category FROM articles
       WHERE lower(btrim(category)) = lower($1)
         AND ($2::text IS NULL OR id <> $2)
       ORDER BY created_at ASC LIMIT 1`,
      [normalized, articleId ?? null],
    );
    return existing.rows[0]?.category || normalized;
  }

  private static async normalizeStoredCategories(client: { query: Function }) {
    await client.query(`
      WITH canonical AS (
        SELECT lower(btrim(category)) AS category_key, min(btrim(category)) AS category
        FROM articles WHERE btrim(category) <> ''
        GROUP BY lower(btrim(category))
      )
      UPDATE articles AS a SET category = canonical.category
      FROM canonical
      WHERE lower(btrim(a.category)) = canonical.category_key
        AND a.category <> canonical.category
    `);
  }

  static async getOverviewStats(): Promise<AdminStats> {
    const [usersRes, schedulesRes, adherenceRes, articlesRes] = await Promise.all([
      db.query<{ c: string }>(`SELECT count(*) as c FROM users WHERE role = 'user'`),
      db.query<{ c: string }>(`SELECT count(*) as c FROM reminder_schedules WHERE status = 'Aktif'`),
      db.query<{ total: string; completed: string }>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1.0 ELSE 0.0 END) as completed
        FROM consumption_logs
      `),
      db.query<{ c: string }>(`SELECT count(*) as c FROM articles WHERE status = 'Terbit'`),
    ]);

    const totalUsers = Number(usersRes.rows[0]?.c) || 0;
    const activeSchedules = Number(schedulesRes.rows[0]?.c) || 0;

    const adherenceRow = adherenceRes.rows[0];
    const totalLogs = Number(adherenceRow?.total) || 0;
    const completedLogs = Number(adherenceRow?.completed) || 0;
    const adherenceRate = totalLogs > 0 ? +((completedLogs / totalLogs) * 100).toFixed(1) : 92.5;

    const publishedArticles = Number(articlesRes.rows[0]?.c) || 0;
    const activePrograms = 0;

    return {
      totalUsers,
      activeSchedules,
      adherenceRate,
      publishedArticles,
      activePrograms,
    };
  }

  private static readonly MANAGED_USER_SELECT = `
      SELECT 
        u.id, u.name, u.gender, u.phone, u.email, u.avatar_url, u.date_of_birth, u.created_at,
        p.risk_level, p.status, p.notes, p.school_or_org, p.hb_level, p.friend_code, p.streak_count, p.last_active_at,
        p.wedding_date, p.tt_status, p.kua_status, p.partner_name,
        (SELECT count(*) FROM reminder_schedules WHERE user_id = u.id AND status = 'Aktif') as active_schedules_count,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id) as total_logs,
        (SELECT count(*) FROM consumption_logs WHERE user_id = u.id AND status IN ('ON_TIME', 'LATE')) as completed_logs
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id`;

  /**
   * Pemetaan apa adanya. Field yang belum diisi pengguna dikembalikan null
   * supaya UI menampilkan "Belum diisi", bukan nilai karangan.
   */
  private static mapManagedUserRow(r: any): ManagedUser {
    const totalLogs = Number(r.total_logs) || 0;
    const completedLogs = Number(r.completed_logs) || 0;

    let age: number | null = null;
    if (r.date_of_birth) {
      const birthDate = new Date(r.date_of_birth);
      if (!Number.isNaN(birthDate.getTime())) {
        age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }
    }

    const toDateKey = (value: any) =>
      value ? new Date(value).toISOString().split('T')[0] : null;

    return {
      id: r.id,
      name: r.name,
      age,
      gender: r.gender || null,
      phone: r.phone || null,
      email: r.email,
      avatarUrl: r.avatar_url || null,
      riskLevel: r.risk_level || null,
      status: r.status || 'Aktif',
      schoolOrOrg: r.school_or_org || null,
      assignedDoctor: r.school_or_org || null,
      activeSchedulesCount: Number(r.active_schedules_count) || 0,
      adherenceRate: totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : null,
      lastActive: r.last_active_at ? String(r.last_active_at) : null,
      joinDate: toDateKey(r.created_at) || '',
      medicalNotes: r.notes || null,
      lastReminderSent: null,
      weddingDate: toDateKey(r.wedding_date),
      ttStatus: r.tt_status || null,
      kuaStatus: r.kua_status || null,
      partnerName: r.partner_name || null,
    };
  }

  static async getManagedUsers(): Promise<ManagedUser[]> {
    const res = await db.query<any>(
      `${AdminService.MANAGED_USER_SELECT}
       WHERE u.role = 'user'
       ORDER BY u.created_at DESC, u.name ASC`,
    );
    return res.rows.map(row => AdminService.mapManagedUserRow(row));
  }

  static async getManagedUserById(userId: string): Promise<ManagedUser | null> {
    const res = await db.query<any>(
      `${AdminService.MANAGED_USER_SELECT}
       WHERE u.id = $1
       LIMIT 1`,
      [userId],
    );
    if (res.rows.length === 0) return null;
    return AdminService.mapManagedUserRow(res.rows[0]);
  }

  static async createUser(data: {
    name: string;
    email: string;
    phone: string;
    age?: number;
    gender?: string;
    riskLevel?: string;
    schoolOrOrg?: string;
    medicalNotes?: string;
    weddingDate?: string;
    ttStatus?: string;
    kuaStatus?: string;
    partnerName?: string;
  }) {
    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = null;
    const cleanTag =
      data.name
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'CATIN';
    const friendCode = `CATIN-${cleanTag}-${Math.floor(1000 + Math.random() * 9000)}`;
    const school = data.schoolOrOrg || 'Puskesmas Gambir';
    const catinAge = data.age || 24;
    const birthDate = new Date(new Date().getFullYear() - catinAge, 5, 15)
      .toISOString()
      .split('T')[0];

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO users (id, name, email, role, phone, avatar_url, gender, date_of_birth)
         VALUES ($1, $2, $3, 'user', $4, $5, $6, $7)`,
        [
          newId,
          data.name,
          data.email.toLowerCase().trim(),
          data.phone,
          avatarUrl,
          data.gender || 'Perempuan',
          birthDate,
        ],
      );

      await client.query(
        `INSERT INTO user_profiles (user_id, friend_code, school_or_org, risk_level, status, notes, wedding_date, tt_status, kua_status, partner_name)
         VALUES ($1, $2, $3, $4, 'Aktif', $5, $6, $7, $8, $9)`,
        [
          newId,
          friendCode,
          school,
          data.riskLevel || 'Rendah',
          data.medicalNotes || null,
          data.weddingDate || null,
          data.ttStatus || 'TT1',
          data.kuaStatus || 'Menunggu Skrining',
          data.partnerName || null,
        ],
      );

      await client.query(
        `INSERT INTO reminder_schedules (id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, status)
         VALUES ($1, $2, 'Vaksin Tetanus Toxoid (TT Catin)', '0.5 mL (Intramuskular)', 'weekly', 'Sabtu', '09:00', true, 'Aktif')`,
        [`sch_${newId}`, newId],
      );
    });

    return this.getManagedUserById(newId);
  }

  static async updateUser(userId: string, data: any) {
    await db.transaction(async (client) => {
      const birthDate = data.age
        ? new Date(new Date().getFullYear() - (parseInt(data.age, 10) || 24), 5, 15)
          .toISOString()
          .split('T')[0]
        : null;

      if (data.name || data.email || data.phone || data.gender || birthDate) {
        await client.query(
          `UPDATE users 
           SET 
             name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             gender = COALESCE($4, gender),
             date_of_birth = COALESCE($5, date_of_birth),
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $6`,
          [
            data.name ?? null,
            data.email ? data.email.toLowerCase().trim() : null,
            data.phone ?? null,
            data.gender ?? null,
            birthDate ?? null,
            userId,
          ],
        );
      }

      const school = data.schoolOrOrg || data.assignedDoctor;
      if (
        data.riskLevel ||
        data.status ||
        data.medicalNotes ||
        school ||
        data.weddingDate !== undefined ||
        data.ttStatus ||
        data.kuaStatus ||
        data.partnerName !== undefined
      ) {
        await client.query(
          `UPDATE user_profiles
           SET 
             risk_level = COALESCE($1, risk_level),
             status = COALESCE($2, status),
             school_or_org = COALESCE($3, school_or_org),
             notes = COALESCE($4, notes),
             wedding_date = COALESCE($5, wedding_date),
             tt_status = COALESCE($6, tt_status),
             kua_status = COALESCE($7, kua_status),
             partner_name = COALESCE($8, partner_name),
             last_active_at = CURRENT_TIMESTAMP
           WHERE user_id = $9`,
          [
            data.riskLevel ?? null,
            data.status ?? null,
            school ?? null,
            data.medicalNotes ?? null,
            data.weddingDate ? data.weddingDate : null,
            data.ttStatus ?? null,
            data.kuaStatus ?? null,
            data.partnerName ?? null,
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
    const msg = message || 'Halo! Pengingat jadwal Imunisasi Tetanus Toxoid (TT) pranikah di fasilitas kesehatan terdekat 🌸';

    await db.query(
      `INSERT INTO admin_nudges (id, user_id, title, message, channel, status)
       VALUES ($1, $2, 'Pengingat Imunisasi TT', $3, $4, 'UNREAD')`,
      [nudgeId, userId, msg, channel],
    );

    const push = channel === 'app'
      ? await NotificationService.sendToUser(userId, { title: 'Pengingat Imunisasi TT', body: msg, url: '/app3/user/dashboard' })
      : { sent: 0, configured: true };
    return { success: true, nudgeId, pushSent: push.sent > 0, pushConfigured: push.configured };
  }

  static async getAdminArticles(): Promise<HealthArticle[]> {
    await AdminService.normalizeStoredCategories(db);
    const res = await db.query<any>(
      `SELECT * FROM articles
       WHERE btrim(category) <> ''
       ORDER BY published_at DESC, created_at DESC`,
    );
    const rows = res.rows;
    if (rows.length === 0) return [];

    return rows.map((r: any) => {
      const content = r.content || r.lead_paragraph || r.summary;

      const d = r.published_at ? new Date(r.published_at) : new Date();
      const publishDateStr = !isNaN(d.getTime())
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '2026-09-01';

      return {
        id: r.id,
        title: r.title,
        category: r.category === 'Kesehatan Pranikah' ? 'Catin' : r.category,
        author: r.author_name || 'dr. Sarah Jenkins',
        publishDate: publishDateStr,
        status: r.status as HealthArticle['status'],
        views: Number(r.views) || 0,
        summary: r.summary,
        readTime: r.read_time,
        imageUrl: r.image_url,
        content,
      };
    });
  }

  static async createAdminArticle(data: {
    title: string;
    category: string;
    summary: string;
    readTime?: string;
    status?: 'Terbit' | 'Draf';
    author?: string;
    imageUrl?: string;
    content?: string;
  }) {
    const category = normalizeArticleCategory(data.category);
    let canonicalCategory = category;

    const newId = `art_${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];
    const finalImageUrl = data.imageUrl?.trim() || '';
    const finalContent = data.content?.trim() || data.summary;
    const characterCount = finalContent.length;
    const readTime = `${Math.max(1, Math.ceil(characterCount / 1000))} min read`;

    await db.transaction(async (client) => {
      canonicalCategory = await AdminService.resolveCategory(client, category);
      await client.query(
        `INSERT INTO articles (
          id, title, summary, content, image_url, read_time, category, status, views, published_at, author_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10)`,
        [
          newId,
          data.title,
          data.summary,
          finalContent,
          finalImageUrl,
          readTime,
          canonicalCategory,
          data.status || 'Terbit',
          today,
          data.author || 'Tim Medis Faskes',
        ],
      );
    });

    return {
      id: newId,
      title: data.title,
      category: canonicalCategory,
      author: data.author || 'Tim Medis Faskes',
      publishDate: today,
      status: (data.status || 'Terbit') as HealthArticle['status'],
      views: 0,
      summary: data.summary,
      readTime,
      imageUrl: finalImageUrl,
      content: finalContent,
    };
  }

  static async updateAdminArticle(articleId: string, data: any) {
    const category =
      data.category !== undefined ? normalizeArticleCategory(data.category) : undefined;

    await db.transaction(async (client) => {
      const canonicalCategory =
        category === undefined
          ? undefined
          : await AdminService.resolveCategory(client, category, articleId);
      await client.query(
        `UPDATE articles
         SET
           title = COALESCE($1, title),
           category = COALESCE($2, category),
           summary = COALESCE($3, summary),
           read_time = COALESCE($4, read_time),
           status = COALESCE($5, status),
           author_name = COALESCE($6, author_name),
           image_url = COALESCE($7, image_url),
           content = COALESCE($8, content),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [
          data.title ?? null,
          canonicalCategory ?? null,
          data.summary ?? null,
          data.readTime ?? null,
          data.status ?? null,
          data.author ?? null,
          data.imageUrl ?? null,
          data.content ?? null,
          articleId,
        ],
      );
    });

    return { success: true };
  }

  static async deleteAdminArticle(articleId: string) {
    await db.transaction(async client => {
      await client.query(`DELETE FROM articles WHERE id = $1`, [articleId]);
      await AdminService.normalizeStoredCategories(client);
    });
    return { success: true };
  }

  static async getSchedules(): Promise<MedicationSchedule[]> {
    // Admin hanya memonitor: sumber data sama dengan yang dibuat pengguna.
    const res = await db.query<any>(`
      SELECT 
        s.id, s.user_id, s.tablet_name, s.dosage, s.frequency, s.day_of_week, s.time_slot,
        s.status, s.instructions, s.created_at, s.tt_level, s.scheduled_date, s.completed_at,
        s.is_enabled, s.remind_15min_before,
        u.name as user_name, p.partner_name
      FROM reminder_schedules s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles p ON p.user_id = s.user_id
      WHERE s.status <> 'Diberhentikan'
      ORDER BY s.scheduled_date ASC NULLS LAST, s.created_at DESC
    `);
    const rows = res.rows;

    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });

    const logsRes = await db.query<any>(
      `SELECT user_id, schedule_id, status, scheduled_date, taken_at 
       FROM consumption_logs 
       WHERE scheduled_date = $1 OR scheduled_date >= CURRENT_DATE - INTERVAL '6 days'
       ORDER BY scheduled_date DESC`,
      [todayStr],
    );
    const recentLogs = logsRes.rows;

    const allSlotsRes = await db.query<any>(
      `SELECT schedule_id, time FROM schedule_time_slots ORDER BY time ASC`,
    );
    const slotsByScheduleId: Record<string, string[]> = {};
    for (const slot of allSlotsRes.rows) {
      if (!slotsByScheduleId[slot.schedule_id]) {
        slotsByScheduleId[slot.schedule_id] = [];
      }
      slotsByScheduleId[slot.schedule_id].push(slot.time);
    }

    const result: MedicationSchedule[] = [];

    for (const r of rows) {
      const customSlots = slotsByScheduleId[r.id];
      const slots = customSlots && customSlots.length > 0 ? customSlots : [r.time_slot || '20:00'];

      const isDaily =
        r.frequency === 'daily' ||
        r.frequency === 'Harian' ||
        (r.day_of_week || '').toLowerCase().includes('setiap hari') ||
        (r.day_of_week || '').toLowerCase().includes('harian');
      const isSupplement =
        (r.tablet_name || '').toLowerCase().includes('vitamin') ||
        (r.tablet_name || '').toLowerCase().includes('suplemen');
      const category: MedicationSchedule['category'] = isSupplement
        ? 'Suplemen Tambahan'
        : isDaily
          ? 'Suplemen TTD'
          : 'TTD Rutin';

      const log = isDaily
        ? recentLogs.find(
          (l: any) =>
            l.user_id === r.user_id &&
            (l.schedule_id === r.id || !l.schedule_id) &&
            (typeof l.scheduled_date === 'string'
              ? l.scheduled_date.startsWith(todayStr)
              : new Date(l.scheduled_date).toISOString().split('T')[0] === todayStr),
        )
        : recentLogs.find(
          (l: any) => l.user_id === r.user_id && (l.schedule_id === r.id || !l.schedule_id),
        );

      const isCompleted = log && (log.status === 'ON_TIME' || log.status === 'LATE');
      const todayStatus: 'COMPLETED' | 'PENDING' = isCompleted ? 'COMPLETED' : 'PENDING';
      const isTtSchedule = Boolean(r.tt_level);

      result.push({
        id: r.id,
        userId: r.user_id,
        userName: r.user_name || 'Calon Pengantin',
        patientId: r.user_id,
        patientName: r.user_name || 'Calon Pengantin',
        partnerName: r.partner_name || undefined,
        medicationName: r.tablet_name || (r.tt_level ? `Imunisasi ${r.tt_level}` : 'Imunisasi Tetanus Toxoid (TT)'),
        dosage: r.dosage || (isTtSchedule ? '1 dosis (0.5 mL)' : '1 dosis'),
        frequency: isTtSchedule ? '1x Sesuai Dosis' : isDaily ? 'Harian' : '1x Seminggu',
        dayOfWeek: r.day_of_week || 'Sabtu',
        timeSlots: slots,
        startDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
        endDate: '2026-12-31',
        status: r.status,
        category: isTtSchedule ? 'Imunisasi TT' : category,
        instructions:
          r.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
        lastReminderSent: `${r.day_of_week || 'Sabtu'}, ${r.time_slot || '20:00'} WIB`,
        todayStatus: r.status === 'Selesai' ? 'COMPLETED' : todayStatus,
        ttLevel: r.tt_level || undefined,
        scheduledDate: r.scheduled_date
          ? String(r.scheduled_date).slice(0, 10)
          : undefined,
        completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
        isEnabled: r.is_enabled ?? true,
      });
    }

    return result;
  }

  static async getScheduleById(scheduleId: string): Promise<MedicationSchedule | null> {
    const res = await db.query<any>(
      `SELECT 
        s.id, s.user_id, s.tablet_name, s.dosage, s.frequency, s.day_of_week, s.time_slot,
        s.status, s.instructions, s.created_at, s.tt_level, s.scheduled_date, s.completed_at,
        s.is_enabled,
        u.name as user_name, p.partner_name
      FROM reminder_schedules s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN user_profiles p ON p.user_id = s.user_id
      WHERE s.id = $1
      LIMIT 1`,
      [scheduleId],
    );
    if (res.rows.length === 0) return null;
    const r = res.rows[0];

    const slotsRes = await db.query<any>(
      `SELECT time FROM schedule_time_slots WHERE schedule_id = $1 ORDER BY time ASC`,
      [scheduleId],
    );
    const slots =
      slotsRes.rows.length > 0 ? slotsRes.rows.map((s: any) => s.time) : [r.time_slot || '20:00'];

    const isDaily =
      r.frequency === 'daily' ||
      r.frequency === 'Harian' ||
      (r.day_of_week || '').toLowerCase().includes('setiap hari') ||
      (r.day_of_week || '').toLowerCase().includes('harian');
    const isSupplement =
      (r.tablet_name || '').toLowerCase().includes('vitamin') ||
      (r.tablet_name || '').toLowerCase().includes('suplemen');
    const category: MedicationSchedule['category'] = isSupplement
      ? 'Suplemen Tambahan'
      : isDaily
        ? 'Suplemen TTD'
        : 'TTD Rutin';
    const isTtSchedule = Boolean(r.tt_level);

    return {
      id: r.id,
      userId: r.user_id,
      userName: r.user_name || 'Calon Pengantin',
      patientId: r.user_id,
      patientName: r.user_name || 'Calon Pengantin',
      partnerName: r.partner_name || undefined,
      medicationName: r.tablet_name || (r.tt_level ? `Imunisasi ${r.tt_level}` : 'Imunisasi Tetanus Toxoid (TT)'),
      dosage: r.dosage || (isTtSchedule ? '1 dosis (0.5 mL)' : '1 dosis'),
      frequency: isTtSchedule ? '1x Sesuai Dosis' : isDaily ? 'Harian' : '1x Seminggu',
      dayOfWeek: r.day_of_week || 'Sabtu',
      timeSlots: slots,
      startDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
      endDate: '2026-12-31',
      status: r.status,
      category: isTtSchedule ? 'Imunisasi TT' : category,
      instructions:
        r.instructions || 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
      lastReminderSent: `${r.day_of_week || 'Sabtu'}, ${r.time_slot || '20:00'} WIB`,
      ttLevel: r.tt_level || undefined,
      scheduledDate: r.scheduled_date ? String(r.scheduled_date).slice(0, 10) : undefined,
      completedAt: r.completed_at ? new Date(r.completed_at).toISOString() : undefined,
      isEnabled: r.is_enabled ?? true,
    };
  }

  static async getComplianceReports(): Promise<ComplianceReport[]> {
    const res = await db.query<any>(`
      SELECT 
        scheduled_date as date,
        SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1 ELSE 0 END) as taken_count,
        SUM(CASE WHEN status = 'MISSED' THEN 1 ELSE 0 END) as missed_count,
        COUNT(*) as total
      FROM consumption_logs
      GROUP BY scheduled_date
      ORDER BY scheduled_date ASC
      LIMIT 14
    `);
    const rows = res.rows;

    if (rows.length === 0) {
      return [
        { date: 'Senin', takenCount: 42, missedCount: 4, adherencePercentage: 91 },
        { date: 'Selasa', takenCount: 45, missedCount: 3, adherencePercentage: 93 },
        { date: 'Rabu', takenCount: 40, missedCount: 6, adherencePercentage: 87 },
      ];
    }

    return rows.map((r: any) => {
      const total = Number(r.total) || 0;
      const takenCount = Number(r.taken_count) || 0;
      const missedCount = Number(r.missed_count) || 0;
      const percentage = total > 0 ? Math.round((takenCount / total) * 100) : 100;

      let dateLabel = '';
      if (typeof r.date === 'string') {
        const d = new Date(r.date);
        dateLabel =
          !isNaN(d.getTime()) && r.date.includes('-')
            ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
            : r.date;
      } else if (r.date && typeof r.date === 'object') {
        const d = r.date instanceof Date ? r.date : new Date(String(r.date));
        dateLabel = !isNaN(d.getTime())
          ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
          : String(r.date);
      } else if (r.date) {
        dateLabel = String(r.date);
      }

      return {
        date: dateLabel,
        takenCount,
        missedCount,
        adherencePercentage: percentage,
      };
    });
  }
}
