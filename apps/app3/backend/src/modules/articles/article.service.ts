import db from '../../config/database.js';

export interface Author {
  name: string;
  role?: string;
  avatarUrl?: string;
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
      SELECT id, title, summary, image_url, read_time, category, status, views, published_at, author_name
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
          role: 'Tim Medis Faskes TEMANI',
        };
      }

      return {
        id: r.id,
        title: r.title,
        summary: r.summary,
        content: r.summary,
        imageUrl: r.image_url,
        readTime: r.read_time,
        category: r.category === 'Kesehatan Pranikah' ? 'Catin' : r.category,
        publishedAt:
          typeof r.published_at === 'string'
            ? r.published_at
            : new Date(r.published_at).toISOString().split('T')[0],
        author,
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

    // Query article directly from single articles table
    const res = await db.query<any>(
      `SELECT id, title, summary, content, image_url, read_time, category, status, views, published_at, author_name
       FROM articles 
       WHERE id = $1 AND btrim(category) <> ''`,
      [id],
    );

    const row = res.rows[0];
    if (!row) return null;

    const fullContent = row.content || row.summary || '';
    const paragraphs = fullContent
      .split('\n\n')
      .map((p: string) => p.trim())
      .filter(Boolean);

    const sections: ContentSection[] = [
      {
        heading: 'Pembahasan Edukasi',
        paragraphs: paragraphs.length > 0 ? paragraphs : [fullContent],
      },
    ];

    let author: Author | undefined;
    if (row.author_name) {
      author = {
        name: row.author_name,
        role: 'Tim Medis Faskes TEMANI',
      };
    }

    return {
      id: row.id,
      title: row.title,
      summary: row.summary,
      content: fullContent,
      imageUrl: row.image_url,
      readTime: row.read_time,
      category: row.category === 'Kesehatan Pranikah' ? 'Catin' : row.category,
      publishedAt:
        typeof row.published_at === 'string'
          ? row.published_at
          : new Date(row.published_at).toISOString().split('T')[0],
      author,
      sections,
    };
  }

  static async getRelatedArticles(
    currentId: string,
    limit: number = 3,
    category?: string,
  ): Promise<Article[]> {
    let resolvedCategory = category;
    if (!resolvedCategory) {
      const currentRes = await db.query<{ category: string }>(
        `SELECT category FROM articles WHERE id = $1`,
        [currentId],
      );
      resolvedCategory = currentRes.rows[0]?.category || '';
    }

    const res = await db.query<any>(
      `SELECT id, title, summary, image_url, read_time, category, published_at, author_name
       FROM articles 
       WHERE id != $1
         AND status = 'Terbit'
         AND btrim(category) <> ''
       ORDER BY CASE WHEN category = $2 THEN 0 ELSE 1 END, published_at DESC
       LIMIT $3`,
      [currentId, resolvedCategory, limit],
    );

    return res.rows.map((r: any) => ({
      id: r.id || '',
      title: r.title || '',
      summary: r.summary || '',
      content: r.summary || '',
      imageUrl: r.image_url || '',
      readTime: r.read_time || '3 min read',
      category: r.category === 'Kesehatan Pranikah' ? 'Catin' : r.category || 'Catin',
      publishedAt:
        typeof r.published_at === 'string'
          ? r.published_at
          : r.published_at
            ? new Date(r.published_at).toISOString().split('T')[0]
            : '2026-09-01',
      author: r.author_name
        ? {
            name: r.author_name,
            avatarUrl: '',
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
