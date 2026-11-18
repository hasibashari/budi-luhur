import db from '../../config/database.js';

export interface Author {
  name: string;
  role?: string;
  avatarUrl: string;
  bio?: string;
}

export interface ContentSection {
  heading?: string;
  subheading?: string;
  paragraphs: string[];
  callout?: {
    type: 'tip' | 'warning' | 'quote';
    title?: string;
    text: string;
  };
  bulletPoints?: string[];
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  leadParagraph?: string;
  content: string;
  imageUrl: string;
  imageCaption?: string;
  readTime: string;
  category: string;
  publishedAt: string;
  status?: 'Terbit' | 'Draf';
  views?: number;
  authorId?: string;
  author?: Author;
  sections?: ContentSection[];
  keyTakeaways?: string[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateArticleData {
  title: string;
  category: string;
  summary?: string;
  content: string;
  imageUrl?: string;
  authorName?: string;
}

export interface UpdateArticleData {
  title?: string;
  category?: string;
  summary?: string;
  content?: string;
  imageUrl?: string;
  authorName?: string;
  status?: 'Terbit' | 'Draf';
}

const DEFAULT_ARTICLE_COVER =
  'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop&q=80';

const ARTICLE_SELECT_COLUMNS = `
  id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views,
  published_at, created_at, updated_at,
  author_id, author_name, author_role, author_avatar_url, author_bio, key_takeaways, tags
`;

function mapAuthor(row: any): Author | undefined {
  if (!row.author_name) return undefined;
  return {
    name: row.author_name,
    role: row.author_role || 'Tim Medis FEMORY',
    avatarUrl: row.author_avatar_url || '',
    bio: row.author_bio || undefined,
  };
}

function parseJsonColumn(value: unknown): any {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return value;
}

function formatDate(value: unknown): string {
  if (!value) return new Date().toISOString().split('T')[0];
  if (typeof value === 'string' && !/^\d{4}-\d{2}-\d{2}T/.test(value)) return value;
  const parsed = new Date(value as string);
  return isNaN(parsed.getTime())
    ? new Date().toISOString().split('T')[0]
    : parsed.toISOString().split('T')[0];
}

function normalizeCategory(category: string): string {
  return category.trim().replace(/\s+/g, ' ');
}

// In-memory cache with 60-second TTL for fast article listings
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}
const articlesCache = new Map<string, CacheEntry<Article[]>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function clearArticlesCache() {
  articlesCache.clear();
}

export class ArticleService {
  static async getArticles(category?: string): Promise<Article[]> {
    const cacheKey = category || 'ALL';
    const cached = articlesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let sql = `
      SELECT id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views, published_at,
             author_id, author_name, author_role, author_avatar_url, author_bio, key_takeaways, tags
      FROM articles
      WHERE status = 'Terbit' AND btrim(category) <> ''
    `;
    const params: unknown[] = [];

    if (category && category !== 'ALL') {
      sql += ` AND category = $1`;
      params.push(category);
    }

    sql += ` ORDER BY published_at DESC, created_at DESC`;

    const res = await db.query<any>(sql, params);

    const result = res.rows.map((r: any) => {
      let author: Author | undefined;
      if (r.author_name) {
        author = {
          name: r.author_name,
          role: r.author_role || 'Tim Medis FEMORY',
          avatarUrl: r.author_avatar_url || '',
          bio: r.author_bio || undefined,
        };
      }

      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        leadParagraph: r.lead_paragraph || undefined,
        content: r.lead_paragraph || r.summary,
        imageUrl: r.image_url,
        imageCaption: r.image_caption || undefined,
        readTime: r.read_time,
        category: r.category,
        status: r.status as Article['status'],
        views: Number(r.views) || 0,
        authorId: r.author_id || undefined,
        publishedAt:
          typeof r.published_at === 'string'
            ? r.published_at
            : new Date(r.published_at).toISOString().split('T')[0],
        author,
        keyTakeaways: r.key_takeaways
          ? typeof r.key_takeaways === 'string'
            ? JSON.parse(r.key_takeaways)
            : r.key_takeaways
          : undefined,
        tags: r.tags ? (typeof r.tags === 'string' ? JSON.parse(r.tags) : r.tags) : undefined,
      };
    });

    articlesCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  static async getArticleById(
    id: string,
    currentUser?: { id: string; role: 'admin' | 'user' },
  ): Promise<Article | null> {
    // Run article query and section query in parallel to eliminate sequential round-trip latency
    const [res, sectionRes] = await Promise.all([
      db.query<any>(
        `SELECT ${ARTICLE_SELECT_COLUMNS}
         FROM articles 
         WHERE id = $1`,
        [id],
      ),
      db.query<any>(
        `SELECT heading, subheading, paragraphs, callout_type, callout_title, callout_text, bullet_points
         FROM article_sections
         WHERE article_id = $1
         ORDER BY order_index ASC`,
        [id],
      ),
    ]);

    const row = res.rows[0];
    if (!row) return null;

    // Draft protection: unpublished drafts are only visible to the author or an admin.
    if (row.status === 'Draf') {
      const isAuthor = Boolean(currentUser?.id) && row.author_id === currentUser?.id;
      const isAdmin = currentUser?.role === 'admin';
      if (!isAuthor && !isAdmin) return null;
    } else {
      // Non-blocking fire-and-forget view count increment (published only)
      db.query(`UPDATE articles SET views = views + 1 WHERE id = $1`, [id]).catch(err => {
        console.error('Failed to increment article views:', err);
      });
    }

    const sections: ContentSection[] = sectionRes.rows.map((sec: any) => ({
      heading: sec.heading || undefined,
      subheading: sec.subheading || undefined,
      paragraphs: sec.paragraphs
        ? typeof sec.paragraphs === 'string'
          ? JSON.parse(sec.paragraphs)
          : sec.paragraphs
        : [],
      callout: sec.callout_text
        ? {
          type: sec.callout_type || 'tip',
          title: sec.callout_title || undefined,
          text: sec.callout_text,
        }
        : undefined,
      bulletPoints: sec.bullet_points
        ? typeof sec.bullet_points === 'string'
          ? JSON.parse(sec.bullet_points)
          : sec.bullet_points
        : undefined,
    }));

    let author: Author | undefined;
    if (row.author_name) {
      author = {
        name: row.author_name,
        role: row.author_role || 'Tim Medis FEMORY',
        avatarUrl: row.author_avatar_url || '',
        bio: row.author_bio || undefined,
      };
    }

    let content = '';

    const isSingleDummySection =
      sections.length === 1 &&
      (sections[0].heading === 'Pembahasan Edukasi' ||
        (sections[0].paragraphs &&
          sections[0].paragraphs.join('\n\n').trim() === (row.lead_paragraph || '').trim()));

    if (isSingleDummySection) {
      content = row.lead_paragraph || '';
    } else if (sections && sections.length > 0) {
      const sectionMarkdown = sections
        .map(sec => {
          let s = '';
          if (sec.heading) s += `### ${sec.heading}\n\n`;
          if (sec.subheading) s += `#### ${sec.subheading}\n\n`;
          if (sec.paragraphs && sec.paragraphs.length > 0) {
            s += sec.paragraphs.join('\n\n') + '\n\n';
          }
          if (sec.callout?.text) {
            s += `> **💡 ${sec.callout.title || 'Tips Sehat'}:** ${sec.callout.text}\n\n`;
          }
          if (sec.bulletPoints && sec.bulletPoints.length > 0) {
            s += sec.bulletPoints.map(b => `- ${b}`).join('\n') + '\n\n';
          }
          return s;
        })
        .join('\n');

      const lead = (row.lead_paragraph || '').trim();
      if (lead && !sectionMarkdown.includes(lead)) {
        content = `${lead}\n\n${sectionMarkdown}`;
      } else {
        content = sectionMarkdown || lead;
      }
    } else {
      content = row.lead_paragraph || '';
    }

    if (!content.trim()) {
      content = row.summary || '';
    }

    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      leadParagraph: row.lead_paragraph || undefined,
      content: content.trim(),
      imageUrl: row.image_url,
      imageCaption: row.image_caption || undefined,
      readTime: row.read_time,
      category: row.category,
      status: row.status as Article['status'],
      views: Number(row.views) || 0,
      authorId: row.author_id || undefined,
      publishedAt: row.published_at
        ? typeof row.published_at === 'string'
          ? row.published_at
          : !isNaN(new Date(row.published_at).getTime())
            ? new Date(row.published_at).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      author,
      sections,
      keyTakeaways: row.key_takeaways
        ? typeof row.key_takeaways === 'string'
          ? JSON.parse(row.key_takeaways)
          : row.key_takeaways
        : undefined,
      tags: row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : undefined,
    };
  }

  static async getRelatedArticles(
    currentId: string,
    limit: number = 3,
    category?: string,
  ): Promise<Article[]> {
    let targetCategory = category;
    if (!targetCategory) {
      const currentRes = await db.query<{ category: string }>(
        `SELECT category FROM articles WHERE id = $1`,
        [currentId],
      );
      targetCategory = currentRes.rows[0]?.category || '';
    }

    const res = await db.query<any>(
      `SELECT id, title, summary, image_url, read_time, category, published_at, author_name, author_avatar_url
       FROM articles 
       WHERE id != $1 AND status = 'Terbit'
       ORDER BY CASE WHEN category = $2 THEN 0 ELSE 1 END, published_at DESC
       LIMIT $3`,
      [currentId, targetCategory, limit],
    );

    return res.rows.map((r: any) => ({
      id: r.id || '',
      title: r.title || '',
      summary: r.summary || '',
      content: r.summary || '',
      imageUrl: r.image_url || '',
      readTime: r.read_time || '3 min read',
      category: r.category || 'General',
      publishedAt:
        typeof r.published_at === 'string'
          ? r.published_at
          : r.published_at
            ? new Date(r.published_at).toISOString().split('T')[0]
            : '2026-09-01',
      author: r.author_name
        ? {
          name: r.author_name,
          avatarUrl: r.author_avatar_url || '',
        }
        : undefined,
    }));
  }

  static async toggleBookmark(userId: string, articleId: string) {
    const existingRes = await db.query<{ id: number }>(
      `SELECT id FROM user_bookmarks WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    );
    const existing = existingRes.rows[0];

    if (existing) {
      await db.query(`DELETE FROM user_bookmarks WHERE id = $1`, [existing.id]);
      return { success: true, isBookmarked: false };
    } else {
      await db.query(`INSERT INTO user_bookmarks (user_id, article_id) VALUES ($1, $2)`, [
        userId,
        articleId,
      ]);
      return { success: true, isBookmarked: true };
    }
  }

  static async isBookmarked(userId: string, articleId: string): Promise<boolean> {
    const res = await db.query(
      `SELECT id FROM user_bookmarks WHERE user_id = $1 AND article_id = $2`,
      [userId, articleId],
    );
    return res.rows.length > 0;
  }

  /**
   * Reuses the exact casing already stored for an equivalent category, mirroring
   * the admin module, so category filters do not fragment.
   */
  private static async resolveCategory(category: string, articleId?: string): Promise<string> {
    const existing = await db.query<{ category: string }>(
      `SELECT category
       FROM articles
       WHERE lower(btrim(category)) = lower($1)
         AND ($2::text IS NULL OR id <> $2)
       ORDER BY created_at ASC
       LIMIT 1`,
      [category, articleId ?? null],
    );
    return existing.rows[0]?.category || category;
  }

  /**
   * Articles authored by the current user (all statuses, including drafts).
   */
  static async getUserArticles(userId: string): Promise<Article[]> {
    const res = await db.query<any>(
      `SELECT ${ARTICLE_SELECT_COLUMNS}
       FROM articles
       WHERE author_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return res.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      leadParagraph: row.lead_paragraph || undefined,
      content: row.lead_paragraph || row.summary || '',
      imageUrl: row.image_url,
      imageCaption: row.image_caption || undefined,
      readTime: row.read_time,
      category: row.category,
      status: row.status as Article['status'],
      views: Number(row.views) || 0,
      authorId: row.author_id || undefined,
      publishedAt: formatDate(row.published_at),
      createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
      updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
      author: mapAuthor(row),
      keyTakeaways: parseJsonColumn(row.key_takeaways),
      tags: parseJsonColumn(row.tags),
    }));
  }

  /**
   * A user-submitted article is always stored as a draft owned by that user.
   * Only an admin can publish it later through the admin module.
   */
  static async createUserArticle(
    userId: string,
    userName: string,
    data: CreateArticleData,
  ): Promise<Article> {
    const title = data.title?.trim();
    const category = data.category?.trim();
    const content = data.content?.trim();

    if (!title) throw new Error('Judul artikel wajib diisi.');
    if (!category) throw new Error('Kategori artikel wajib diisi.');
    if (!content) throw new Error('Isi materi artikel wajib diisi.');

    const canonicalCategory = await ArticleService.resolveCategory(normalizeCategory(category));

    const summary =
      data.summary?.trim() ||
      (content.length > 160 ? `${content.slice(0, 157)}...` : content);
    const imageUrl = data.imageUrl?.trim() || DEFAULT_ARTICLE_COVER;
    const readTime = `${Math.max(1, Math.ceil(content.length / 1000))} min read`;
    const authorName = data.authorName?.trim() || userName || 'Pengguna';
    const newId = `art_${Date.now().toString().slice(-6)}_${Math.random()
      .toString(36)
      .substring(2, 6)}`;
    const today = new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO articles (
         id, title, summary, lead_paragraph, image_url, read_time, category, status,
         views, published_at, author_id, author_name
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'Draf', 0, $8, $9, $10)`,
      [newId, title, summary, content, imageUrl, readTime, canonicalCategory, today, userId, authorName],
    );

    clearArticlesCache();

    return {
      id: newId,
      title,
      summary,
      leadParagraph: content,
      content,
      imageUrl,
      readTime,
      category: canonicalCategory,
      status: 'Draf',
      views: 0,
      authorId: userId,
      publishedAt: today,
      author: { name: authorName, role: 'Kontributor', avatarUrl: '' },
    };
  }

  /**
   * Updates an owned draft. Regular users can never change the publication status;
   * admins keep their ability to publish through this endpoint too.
   */
  static async updateUserArticle(
    userId: string,
    userRole: 'admin' | 'user',
    articleId: string,
    data: UpdateArticleData,
  ): Promise<{ success: boolean }> {
    const existingRes = await db.query<{ id: string; author_id: string | null }>(
      `SELECT id, author_id FROM articles WHERE id = $1`,
      [articleId],
    );
    const existing = existingRes.rows[0];
    if (!existing) throw new Error('Artikel tidak ditemukan.');

    if (userRole !== 'admin' && existing.author_id !== userId) {
      throw new Error('Akses dilarang: Anda hanya dapat mengubah artikel milik Anda sendiri.');
    }

    const title = data.title?.trim();
    const category = data.category?.trim();
    const content = data.content?.trim();

    if (data.title !== undefined && !title) throw new Error('Judul artikel wajib diisi.');
    if (data.category !== undefined && !category) throw new Error('Kategori artikel wajib diisi.');
    if (data.content !== undefined && !content) throw new Error('Isi materi artikel wajib diisi.');

    let summary: string | null = data.summary?.trim() || null;
    if (!summary && content) {
      summary = content.length > 160 ? `${content.slice(0, 157)}...` : content;
    }

    const readTime = content ? `${Math.max(1, Math.ceil(content.length / 1000))} min read` : null;

    const canonicalCategory = category
      ? await ArticleService.resolveCategory(normalizeCategory(category), articleId)
      : null;

    const finalStatus =
      userRole === 'admin' && (data.status === 'Terbit' || data.status === 'Draf')
        ? data.status
        : userRole === 'admin'
          ? null
          : 'Draf';

    await db.query(
      `UPDATE articles
       SET title = COALESCE($1, title),
           category = COALESCE($2, category),
           summary = COALESCE($3, summary),
           lead_paragraph = COALESCE($4, lead_paragraph),
           image_url = COALESCE($5, image_url),
           read_time = COALESCE($6, read_time),
           author_name = COALESCE($7, author_name),
           status = COALESCE($8, status),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        title ?? null,
        canonicalCategory,
        summary,
        content ?? null,
        data.imageUrl?.trim() || null,
        readTime,
        data.authorName?.trim() || null,
        finalStatus,
        articleId,
      ],
    );

    clearArticlesCache();
    return { success: true };
  }

  /**
   * Deletes an owned article. Owners only, admins may delete any.
   */
  static async deleteUserArticle(
    userId: string,
    userRole: 'admin' | 'user',
    articleId: string,
  ): Promise<{ success: boolean }> {
    const existingRes = await db.query<{ id: string; author_id: string | null }>(
      `SELECT id, author_id FROM articles WHERE id = $1`,
      [articleId],
    );
    const existing = existingRes.rows[0];
    if (!existing) throw new Error('Artikel tidak ditemukan.');

    if (userRole !== 'admin' && existing.author_id !== userId) {
      throw new Error('Akses dilarang: Anda hanya dapat menghapus artikel milik Anda sendiri.');
    }

    await db.query(`DELETE FROM articles WHERE id = $1`, [articleId]);
    clearArticlesCache();
    return { success: true };
  }
}
