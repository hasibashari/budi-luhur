import db from '../../../config/database.js';
import { clearArticlesCache } from '../../articles/article.service.js';

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

function normalizeCategory(category: string): string {
  const normalized = category.trim().replace(/\s+/g, ' ');
  if (!normalized) throw new Error('Kategori artikel wajib diisi.');
  return normalized;
}

export class AdminArticleService {
  static async resolveCategory(
    client: { query: Function },
    category: string,
    articleId?: string,
  ): Promise<string> {
    const normalized = normalizeCategory(category);
    const existing = await client.query(
      `SELECT category FROM articles
       WHERE lower(btrim(category)) = lower($1)
         AND ($2::text IS NULL OR id <> $2)
       ORDER BY created_at ASC LIMIT 1`,
      [normalized, articleId ?? null],
    );
    return existing.rows[0]?.category || normalized;
  }

  static async normalizeStoredCategories(client: { query: Function }) {
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

  static async getAdminArticles(): Promise<HealthArticle[]> {
    await AdminArticleService.normalizeStoredCategories(db);
    const res = await db.query<any>(
      `SELECT * FROM articles WHERE btrim(category) <> ''
       ORDER BY published_at DESC, created_at DESC`,
    );
    const rows = res.rows;
    if (rows.length === 0) return [];

    return rows.map((r: any) => {
      const content = r.content || r.lead_paragraph || r.summary || '';

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
    const finalImageUrl = data.imageUrl?.trim() || '';
    const finalContent = data.content?.trim() || data.summary;
    const category = normalizeCategory(data.category);
    let canonicalCategory = category;
    const characterCount = finalContent.length;
    const readTime = `${Math.max(1, Math.ceil(characterCount / 1000))} min read`;

    await db.transaction(async (client) => {
      canonicalCategory = await AdminArticleService.resolveCategory(client, category);
      await client.query(
        `INSERT INTO articles (
          id, title, summary, content, lead_paragraph, image_url, read_time, category, status, views, published_at, author_name
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10, $11)`,
        [
          newId,
          data.title,
          data.summary,
          finalContent,
          finalContent,
          finalImageUrl,
          readTime,
          canonicalCategory,
          data.status || 'Terbit',
          today,
          data.author || 'Tim Medis Pilluna',
        ],
      );
    });

    clearArticlesCache();

    return {
      id: newId,
      title: data.title,
      category: canonicalCategory,
      author: data.author || 'Tim Medis Pilluna',
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
      const category =
        data.category === undefined || data.category === null
          ? undefined
          : await AdminArticleService.resolveCategory(client, data.category, articleId);
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
           lead_paragraph = COALESCE($8, lead_paragraph),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = $9`,
        [
          data.title ?? null,
          category ?? null,
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

    clearArticlesCache();

    return { success: true };
  }

  static async deleteAdminArticle(articleId: string) {
    await db.transaction(async client => {
      await client.query(`DELETE FROM articles WHERE id = $1`, [articleId]);
      await AdminArticleService.normalizeStoredCategories(client);
    });
    clearArticlesCache();
    return { success: true };
  }
}

