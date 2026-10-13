import db from '../../config/database.js';

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

export class AdminService {
  static async getOverviewStats(): Promise<AdminStats> {
    const [usersRes, schedulesRes, adherenceRes, articlesRes, buddyRes] = await Promise.all([
      db.query<{ c: string }>(`SELECT count(*) as c FROM users WHERE role = 'user'`),
      db.query<{ c: string }>(`SELECT count(*) as c FROM reminder_schedules WHERE status = 'Aktif'`),
      db.query<{ total: string; completed: string }>(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status IN ('ON_TIME', 'LATE') THEN 1.0 ELSE 0.0 END) as completed
        FROM consumption_logs
      `),
      db.query<{ c: string }>(`SELECT count(*) as c FROM articles WHERE status = 'Terbit'`),
      db.query<{ c: string }>(`SELECT count(*) as c FROM buddy_groups`),
    ]);

    const totalUsers = Number(usersRes.rows[0]?.c) || 0;
    const activeSchedules = Number(schedulesRes.rows[0]?.c) || 0;

    const adherenceRow = adherenceRes.rows[0];
    const totalLogs = Number(adherenceRow?.total) || 0;
    const completedLogs = Number(adherenceRow?.completed) || 0;
    const adherenceRate = totalLogs > 0 ? +((completedLogs / totalLogs) * 100).toFixed(1) : 92.5;

    const publishedArticles = Number(articlesRes.rows[0]?.c) || 0;
    const activePrograms = Number(buddyRes.rows[0]?.c) || 0;

    return {
      totalUsers,
      activeSchedules,
      adherenceRate,
      publishedArticles,
      activePrograms,
    };
  }

  static async getManagedUsers(): Promise<ManagedUser[]> {
    const res = await db.query<any>(`
      SELECT 
        u.id, u.name, u.gender, u.phone, u.email, u.avatar_url, u.created_at,
        p.risk_level, p.status, p.notes, p.school_or_org, p.hb_level, p.friend_code, p.streak_count, p.last_active_at,
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

      const schoolOrOrg = r.school_or_org || 'SMA Negeri 1 Sehat';

      return {
        id: r.id,
        name: r.name,
        age: 16,
        gender: r.gender || 'Perempuan',
        phone: r.phone || '-',
        email: r.email,
        avatarUrl:
          r.avatar_url ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
        riskLevel: r.risk_level || 'Rendah',
        status: r.status || 'Aktif',
        schoolOrOrg,
        assignedDoctor: schoolOrOrg,
        activeSchedulesCount: Number(r.active_schedules_count) || 1,
        adherenceRate,
        lastActive: lastActiveStr,
        joinDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
        medicalNotes: `Kadar Hb: ${r.hb_level || 12.4} g/dL • ${r.notes || 'Rutin suplementasi'}`,
        lastReminderSent: 'Hari ini, 20:00 WIB',
      };
    });
  }

  static async getManagedUserById(userId: string): Promise<ManagedUser | null> {
    const res = await db.query<any>(
      `SELECT 
        u.id, u.name, u.gender, u.phone, u.email, u.avatar_url, u.created_at,
        p.risk_level, p.status, p.notes, p.school_or_org, p.hb_level, p.friend_code, p.streak_count, p.last_active_at,
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

    const schoolOrOrg = r.school_or_org || 'SMA Negeri 1 Sehat';

    return {
      id: r.id,
      name: r.name,
      age: 16,
      gender: r.gender || 'Perempuan',
      phone: r.phone || '-',
      email: r.email,
      avatarUrl:
        r.avatar_url ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(r.name)}`,
      riskLevel: r.risk_level || 'Rendah',
      status: r.status || 'Aktif',
      schoolOrOrg,
      assignedDoctor: schoolOrOrg,
      activeSchedulesCount: Number(r.active_schedules_count) || 1,
      adherenceRate,
      lastActive: lastActiveStr,
      joinDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-09-01',
      medicalNotes: `Kadar Hb: ${r.hb_level || 12.4} g/dL • ${r.notes || 'Rutin suplementasi'}`,
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
  }) {
    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;
    const cleanTag =
      data.name
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'USER';
    const friendCode = `FE-${cleanTag}-${Math.floor(1000 + Math.random() * 9000)}`;
    const school = data.schoolOrOrg || 'SMA Negeri 1 Sehat';

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

      await client.query(
        `INSERT INTO reminder_schedules (id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, status)
         VALUES ($1, $2, 'Tablet Tambah Darah (TTD)', '1 tablet', 'weekly', 'Sabtu', '20:00', true, 'Aktif')`,
        [`sch_${newId}`, newId],
      );
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
    const msg = message || 'Halo! Jangan lupa minum Tablet Tambah Darah (TTD) minggu ini ya 🌸';

    await db.query(
      `INSERT INTO admin_nudges (id, user_id, title, message, channel, status)
       VALUES ($1, $2, 'Pengingat Minum TTD', $3, $4, 'UNREAD')`,
      [nudgeId, userId, msg, channel],
    );

    return { success: true, nudgeId };
  }

  static async getAdminArticles(): Promise<HealthArticle[]> {
    const res = await db.query<any>(
      `SELECT * FROM articles ORDER BY published_at DESC, created_at DESC`,
    );
    const rows = res.rows;
    if (rows.length === 0) return [];

    const articleIds = rows.map((r: any) => r.id);
    const sectionsRes = await db.query<{ article_id: string; paragraphs: string }>(
      `SELECT article_id, paragraphs FROM article_sections WHERE article_id = ANY($1) ORDER BY order_index ASC`,
      [articleIds],
    );

    const sectionsByArticle = new Map<string, string[]>();
    for (const s of sectionsRes.rows) {
      if (s.paragraphs) {
        try {
          const parsed = JSON.parse(s.paragraphs);
          if (Array.isArray(parsed)) {
            if (!sectionsByArticle.has(s.article_id)) {
              sectionsByArticle.set(s.article_id, []);
            }
            sectionsByArticle.get(s.article_id)!.push(...parsed);
          }
        } catch {}
      }
    }

    return rows.map((r: any) => {
      const allParagraphs = sectionsByArticle.get(r.id);
      const content =
        allParagraphs && allParagraphs.length > 0
          ? allParagraphs.join('\n\n')
          : r.lead_paragraph || r.summary;

      const d = r.published_at ? new Date(r.published_at) : new Date();
      const publishDateStr = !isNaN(d.getTime())
        ? d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '2026-09-01';

      return {
        id: r.id,
        title: r.title,
        category: r.category,
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
    const newId = `art_${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];
    const finalImageUrl =
      data.imageUrl?.trim() ||
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop';
    const finalContent = data.content?.trim() || data.summary;
    const readTime = data.readTime || '3 min read';

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO articles (
          id, title, summary, lead_paragraph, image_url, read_time, category, status, views, published_at, author_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, $9, $10)`,
        [
          newId,
          data.title,
          data.summary,
          finalContent,
          finalImageUrl,
          readTime,
          data.category,
          data.status || 'Terbit',
          today,
          data.author || 'Tim Ahli Gizi UKS',
        ],
      );

      const paragraphs = finalContent
        .split('\n\n')
        .map((p) => p.trim())
        .filter(Boolean);
      if (paragraphs.length > 0) {
        await client.query(
          `INSERT INTO article_sections (article_id, order_index, heading, paragraphs)
           VALUES ($1, 1, 'Pembahasan Edukasi', $2)`,
          [newId, JSON.stringify(paragraphs)],
        );
      }
    });

    return {
      id: newId,
      title: data.title,
      category: data.category,
      author: data.author || 'Tim Ahli Gizi UKS',
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
    await db.transaction(async (client) => {
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
           lead_paragraph = COALESCE($8, lead_paragraph),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [
          data.title ?? null,
          data.category ?? null,
          data.summary ?? null,
          data.readTime ?? null,
          data.status ?? null,
          data.author ?? null,
          data.imageUrl ?? null,
          data.content ?? null,
          articleId,
        ],
      );

      if (data.content !== undefined) {
        const paragraphs = data.content
          .split('\n\n')
          .map((p: string) => p.trim())
          .filter(Boolean);
        const existingSectionRes = await client.query<{ id: number }>(
          `SELECT id FROM article_sections WHERE article_id = $1 ORDER BY order_index ASC LIMIT 1`,
          [articleId],
        );
        const existingSection = existingSectionRes.rows[0];

        if (existingSection) {
          await client.query(`UPDATE article_sections SET paragraphs = $1 WHERE id = $2`, [
            JSON.stringify(paragraphs),
            existingSection.id,
          ]);
        } else if (paragraphs.length > 0) {
          await client.query(
            `INSERT INTO article_sections (article_id, order_index, heading, paragraphs) VALUES ($1, 1, 'Pembahasan Edukasi', $2)`,
            [articleId, JSON.stringify(paragraphs)],
          );
        }
      }
    });

    return { success: true };
  }

  static async deleteAdminArticle(articleId: string) {
    await db.query(`DELETE FROM articles WHERE id = $1`, [articleId]);
    return { success: true };
  }
}
