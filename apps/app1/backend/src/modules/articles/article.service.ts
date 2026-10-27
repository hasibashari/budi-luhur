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
  author?: Author;
  sections?: ContentSection[];
  keyTakeaways?: string[];
  tags?: string[];
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

  static async getArticleById(id: string): Promise<Article | null> {
    // Non-blocking fire-and-forget view count increment
    db.query(`UPDATE articles SET views = views + 1 WHERE id = $1`, [id]).catch(err => {
      console.error('Failed to increment article views:', err);
    });

    // Run article query and section query in parallel to eliminate sequential round-trip latency
    const [res, sectionRes] = await Promise.all([
      db.query<any>(
        `SELECT id, title, summary, lead_paragraph, image_url, image_caption, read_time, category, status, views, published_at,
                author_id, author_name, author_role, author_avatar_url, author_bio, key_takeaways, tags
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
}
