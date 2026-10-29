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
  authorId?: string;
  status?: 'Terbit' | 'Draf';
  sections?: ContentSection[];
  keyTakeaways?: string[];
  tags?: string[];
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
  private static mapRowToArticle(
    r: any,
    includeContent: boolean = false,
    customRole?: string,
  ): Article {
    let author: Author | undefined;
    if (r.author_name) {
      author = {
        name: r.author_name,
        role: customRole || (r.author_id ? 'Kontributor Edukasi Catin' : 'Tim Medis Faskes TEMANI'),
      };
    }

    const fullContent = r.content || r.summary || '';

    return {
      id: r.id,
      title: r.title,
      summary: r.summary,
      content: includeContent ? fullContent : r.summary,
      imageUrl: r.image_url,
      readTime: r.read_time,
      category: r.category === 'Kesehatan Pranikah' ? 'Catin' : r.category,
      publishedAt:
        typeof r.published_at === 'string'
          ? r.published_at
          : new Date(r.published_at).toISOString().split('T')[0],
      author,
      authorId: r.author_id || undefined,
      status: r.status,
    };
  }

  static async getArticles(category?: string): Promise<Article[]> {
    const cacheKey = category || 'ALL';
    const cached = articlesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    let sql = `
      SELECT id, title, summary, image_url, read_time, category, status, views, published_at, author_name, author_id
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
    const result = res.rows.map((r: any) => this.mapRowToArticle(r, false));

    articlesCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }

  static async getArticleById(
    id: string,
    currentUser?: { id: string; role: 'admin' | 'user' },
  ): Promise<Article | null> {
    // Query article directly from single articles table
    const res = await db.query<any>(
      `SELECT id, title, summary, content, image_url, read_time, category, status, views, published_at, author_name, author_id
       FROM articles 
       WHERE id = $1 AND btrim(category) <> ''`,
      [id],
    );

    const row = res.rows[0];
    if (!row) return null;

    // Proteksi Hak Akses: Artikel berstatus Draf TIDAK BOLEH diakses oleh publik
    // Hanya boleh diakses oleh pembuatnya sendiri (author_id) atau admin
    if (row.status === 'Draf') {
      const isAuthor = currentUser?.id && row.author_id && currentUser.id === row.author_id;
      const isAdmin = currentUser?.role === 'admin';
      if (!isAuthor && !isAdmin) {
        return null;
      }
    } else {
      // Non-blocking fire-and-forget view count increment HANYA untuk artikel terbit
      db.query(`UPDATE articles SET views = views + 1 WHERE id = $1`, [id]).catch(err => {
        console.error('Failed to increment article views:', err);
      });
    }

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

    const baseArticle = this.mapRowToArticle(row, true);

    return {
      ...baseArticle,
      sections,
    };
  }

  static async getUserArticles(userId: string): Promise<Article[]> {
    const res = await db.query<any>(
      `SELECT id, title, summary, content, image_url, read_time, category, status, views, published_at, author_name, author_id, created_at, updated_at
       FROM articles
       WHERE author_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );

    return res.rows.map((row: any) =>
      this.mapRowToArticle(row, true, 'Penulis Kontributor'),
    );
  }

  static async createUserArticle(
    userId: string,
    userName: string,
    data: CreateArticleData,
  ): Promise<Article> {
    if (!data.title?.trim()) {
      throw new Error('Judul artikel wajib diisi.');
    }
    const cleanCategory = data.category?.trim().replace(/\s+/g, ' ');
    if (!cleanCategory) {
      throw new Error('Kategori artikel wajib diisi.');
    }
    if (!data.content?.trim() && !data.summary?.trim()) {
      throw new Error('Isi materi artikel wajib diisi.');
    }

    const newId = `art_${Date.now().toString().slice(-4)}_${Math.random().toString(36).substring(2, 6)}`;
    const content = data.content?.trim() || data.summary?.trim() || '';
    const characterCount = content.length;
    const readTime = `${Math.max(1, Math.ceil(characterCount / 1000))} min read`;
    const summary = data.summary?.trim() || (content.length > 160 ? content.slice(0, 157) + '...' : content);
    const authorName = data.authorName?.trim() || userName || 'Calon Pengantin';
    const defaultPlaceholder = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80';
    let imageUrl = data.imageUrl?.trim() || defaultPlaceholder;

    if (imageUrl.startsWith('data:image/')) {
      const { AdminService } = await import('../admin/admin.service.js');
      imageUrl = await AdminService.processArticleImage(imageUrl, newId);
    }

    // Seluruh artikel yang dibuat pengguna otomatis berstatus 'Draf'
    const status = 'Draf';

    await db.query(
      `INSERT INTO articles (
        id, title, summary, content, image_url, read_time, category, status, views, published_at, author_name, author_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, CURRENT_DATE, $9, $10)`,
      [
        newId,
        data.title.trim(),
        summary,
        content,
        imageUrl,
        readTime,
        cleanCategory,
        status,
        authorName,
        userId,
      ],
    );

    clearArticlesCache();

    return {
      id: newId,
      title: data.title.trim(),
      summary,
      content,
      imageUrl,
      readTime,
      category: cleanCategory,
      publishedAt: new Date().toISOString().split('T')[0],
      author: {
        name: authorName,
        role: 'Kontributor Edukasi Catin',
      },
      authorId: userId,
      status: 'Draf',
    };
  }

  static async updateUserArticle(
    userId: string,
    userRole: 'admin' | 'user',
    articleId: string,
    data: UpdateArticleData,
  ): Promise<{ success: boolean }> {
    const existingRes = await db.query<any>(
      `SELECT id, author_id, status, image_url FROM articles WHERE id = $1`,
      [articleId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new Error('Artikel tidak ditemukan.');
    }

    // Role check: non-admin hanya boleh mengedit artikel miliknya sendiri
    if (userRole !== 'admin' && existing.author_id !== userId) {
      throw new Error('Akses dilarang: Anda hanya dapat mengubah artikel milik Anda sendiri.');
    }

    let processedImageUrl = data.imageUrl;
    if (processedImageUrl && processedImageUrl.startsWith('data:image/')) {
      const { AdminService } = await import('../admin/admin.service.js');
      processedImageUrl = await AdminService.processArticleImage(processedImageUrl, articleId);
    }

    const content = data.content?.trim();
    const characterCount = (content || (data.summary || '').trim()).length;
    const readTime = characterCount > 0 ? `${Math.max(1, Math.ceil(characterCount / 1000))} min read` : undefined;

    // Status:
    // Pengguna biasa TIDAK BISA mempublikasikan artikel secara langsung.
    // Jika bukan admin, status selalu tetap 'Draf'.
    let finalStatus: string | undefined = undefined;
    if (userRole === 'admin') {
      if (data.status && (data.status === 'Terbit' || data.status === 'Draf')) {
        finalStatus = data.status;
      }
    } else {
      finalStatus = 'Draf';
    }

    const cleanCategory = data.category ? data.category.trim().replace(/\s+/g, ' ') : undefined;

    await db.query(
      `UPDATE articles
       SET
         title = COALESCE($1, title),
         category = COALESCE($2, category),
         summary = COALESCE($3, summary),
         content = COALESCE($4, content),
         image_url = COALESCE($5, image_url),
         read_time = COALESCE($6, read_time),
         status = COALESCE($7, status),
         author_name = COALESCE($8, author_name),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [
        data.title ? data.title.trim() : null,
        cleanCategory || null,
        data.summary ? data.summary.trim() : null,
        content || null,
        processedImageUrl || null,
        readTime || null,
        finalStatus || null,
        data.authorName ? data.authorName.trim() : null,
        articleId,
      ],
    );

    clearArticlesCache();
    return { success: true };
  }

  static async deleteUserArticle(
    userId: string,
    userRole: 'admin' | 'user',
    articleId: string,
  ): Promise<{ success: boolean }> {
    const existingRes = await db.query<any>(
      `SELECT id, author_id, image_url FROM articles WHERE id = $1`,
      [articleId],
    );
    const existing = existingRes.rows[0];
    if (!existing) {
      throw new Error('Artikel tidak ditemukan.');
    }

    if (userRole !== 'admin' && existing.author_id !== userId) {
      throw new Error('Akses dilarang: Anda hanya dapat menghapus artikel milik Anda sendiri.');
    }

    if (existing.image_url) {
      const { AdminService } = await import('../admin/admin.service.js');
      await AdminService.deleteArticleImageFromStorage(existing.image_url);
    }

    await db.query(`DELETE FROM articles WHERE id = $1`, [articleId]);
    clearArticlesCache();
    return { success: true };
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
