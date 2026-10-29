import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { getDatabasePool } from '../config/database.js';
import { getStorageService } from '../services/storage/index.js';
import { detectAttachmentMime } from '../utils/fileValidation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ParsedRawArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  leadParagraph: string;
  imageUrl: string;
  imageCaption?: string;
  readTime: string;
  status: string;
  isFeatured: boolean;
  views: number;
  publishedAt: string;
  authorName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ImportArticlesResult {
  totalProcessed: number;
  articlesImported: number;
  imagesConverted: number;
  failedCount: number;
  errors: Array<{ id: string; error: string }>;
  importedArticles: Array<{ id: string; title: string; category: string; imageUrl: string }>;
}

/**
 * Parses raw INSERT statements from backend/articles.sql
 */
export function parseArticlesSql(sqlContent: string): ParsedRawArticle[] {
  const articles: ParsedRawArticle[] = [];
  let pos = 0;

  while (true) {
    const insertPos = sqlContent.toLowerCase().indexOf('insert into "articles"', pos);
    if (insertPos === -1) break;

    const valuesPos = sqlContent.toLowerCase().indexOf('values (', insertPos);
    if (valuesPos === -1) break;

    const startIdx = valuesPos + 'values ('.length;
    const values: string[] = [];
    let current: string[] = [];
    let inStr = false;
    let i = startIdx;
    const len = sqlContent.length;

    while (i < len) {
      const ch = sqlContent[i];
      if (!inStr) {
        if (ch === "'") {
          inStr = true;
          i++;
        } else if (ch === ',') {
          values.push(current.join('').trim());
          current = [];
          i++;
        } else if (ch === ')') {
          values.push(current.join('').trim());
          i++;
          break;
        } else {
          current.push(ch);
          i++;
        }
      } else {
        if (ch === "'") {
          if (i + 1 < len && sqlContent[i + 1] === "'") {
            current.push("'");
            i += 2;
          } else {
            inStr = false;
            i++;
          }
        } else {
          current.push(ch);
          i++;
        }
      }
    }

    const colStart = sqlContent.indexOf('(', insertPos);
    const colEnd = sqlContent.indexOf(')', colStart);
    const colNames = sqlContent
      .slice(colStart + 1, colEnd)
      .split(',')
      .map(c => c.trim().replace(/"/g, ''));

    pos = i;

    // Check if we extracted valid values
    if (values.length >= 10 && colNames.length === values.length) {
      const record: Record<string, string> = {};
      colNames.forEach((col, idx) => {
        record[col] = values[idx];
      });

      const id = record['id'] || '';
      const title = record['title'] || '';
      const category = record['category'] || '';
      const summary = record['summary'] || '';
      const leadParagraph = record['content'] || record['lead_paragraph'] || '';
      const imageUrl = record['image_url'] || '';
      const imageCaption = record['image_caption'];
      const readTime = record['read_time'] || '3 min read';
      const status = record['status'] === 'Draf' ? 'Draf' : 'Terbit';
      const isFeatured = record['is_featured'] === 'true' || record['is_featured'] === 'TRUE' || record['is_featured'] === 't';
      const views = parseInt(record['views'], 10) || 0;
      const publishedAt = record['published_at'] || new Date().toISOString().split('T')[0];
      const authorName = record['author_name'] || 'Tim Medis Faskes';
      const createdAt = record['created_at'];
      const updatedAt = record['updated_at'];

      articles.push({
        id,
        title,
        category,
        summary,
        leadParagraph,
        imageUrl,
        imageCaption,
        readTime,
        status,
        isFeatured,
        views,
        publishedAt,
        authorName,
        createdAt,
        updatedAt,
      });
    }
  }

  return articles;
}

/**
 * Imports articles from backend/articles.sql into the database,
 * converting Base64 images to local files via StorageService.
 */
export async function importArticles(
  sqlFilePath?: string,
): Promise<ImportArticlesResult> {
  const filePath =
    sqlFilePath || path.resolve(__dirname, '../../articles.sql');

  if (!fs.existsSync(filePath)) {
    throw new Error(`articles.sql file not found at: ${filePath}`);
  }

  console.log(`📖 Reading articles data from: ${filePath}...`);
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  const rawArticles = parseArticlesSql(sqlContent);

  console.log(`🔍 Found ${rawArticles.length} raw articles in SQL file.`);

  const storage = getStorageService();
  const result: ImportArticlesResult = {
    totalProcessed: rawArticles.length,
    articlesImported: 0,
    imagesConverted: 0,
    failedCount: 0,
    errors: [],
    importedArticles: [],
  };

  const cleanSqlStatements: string[] = [];

  for (const art of rawArticles) {
    try {
      let finalImageUrl = art.imageUrl;

      // Check if image is Base64 / Data URL
      if (art.imageUrl && art.imageUrl.startsWith('data:')) {
        const matches = art.imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/s);
        if (!matches) {
          throw new Error(`Invalid Data URL format for article ${art.id}`);
        }

        const mimeFromHeader = matches[1];
        const base64Data = matches[2];
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Detect real MIME type from magic bytes for safety
        const detectedMime = detectAttachmentMime(imageBuffer) || mimeFromHeader;
        let extension = 'png';
        if (detectedMime === 'image/jpeg') extension = 'jpg';
        else if (detectedMime === 'image/webp') extension = 'webp';

        const destinationFilename = `articles/${art.id}.${extension}`;

        // Save image through StorageService abstraction
        const uploadResult = await storage.upload(
          imageBuffer,
          destinationFilename,
          detectedMime,
        );

        // Verify the file was created and is accessible before updating DB
        const fileExists = await storage.exists(destinationFilename);
        if (!fileExists) {
          throw new Error(
            `Failed to verify saved file in storage: ${destinationFilename}`,
          );
        }

        finalImageUrl = uploadResult.path; // e.g. /uploads/articles/art_0541.png
        result.imagesConverted++;
        console.log(`  📸 Converted image for [${art.id}] -> ${finalImageUrl} (${uploadResult.size} bytes)`);
      }

      // Content: Use leadParagraph as full markdown content
      const content = art.leadParagraph || art.summary;

      // Upsert into database
      const upsertQuery = `
        INSERT INTO articles (
          id, title, category, summary, content, image_url, read_time,
          status, is_featured, views, published_at, author_name, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,
          COALESCE($13::timestamp with time zone, CURRENT_TIMESTAMP),
          COALESCE($14::timestamp with time zone, CURRENT_TIMESTAMP)
        )
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          category = EXCLUDED.category,
          summary = EXCLUDED.summary,
          content = EXCLUDED.content,
          image_url = EXCLUDED.image_url,
          read_time = EXCLUDED.read_time,
          status = EXCLUDED.status,
          is_featured = EXCLUDED.is_featured,
          views = EXCLUDED.views,
          published_at = EXCLUDED.published_at,
          author_name = EXCLUDED.author_name,
          updated_at = CURRENT_TIMESTAMP;
      `;

      await db.query(upsertQuery, [
        art.id,
        art.title,
        art.category,
        art.summary,
        content,
        finalImageUrl,
        art.readTime,
        art.status,
        art.isFeatured,
        art.views,
        art.publishedAt,
        art.authorName,
        art.createdAt || null,
        art.updatedAt || null,
      ]);

      result.articlesImported++;
      result.importedArticles.push({
        id: art.id,
        title: art.title,
        category: art.category,
        imageUrl: finalImageUrl,
      });

      // Prepare clean SQL statement for rewritten articles.sql
      const escapeSql = (str: string) => str.replace(/'/g, "''");
      cleanSqlStatements.push(`
INSERT INTO "articles" (
  "id", "title", "category", "summary", "content", "image_url",
  "read_time", "status", "is_featured", "views", "published_at",
  "author_name", "created_at", "updated_at"
) VALUES (
  '${escapeSql(art.id)}',
  '${escapeSql(art.title)}',
  '${escapeSql(art.category)}',
  '${escapeSql(art.summary)}',
  '${escapeSql(content)}',
  '${escapeSql(finalImageUrl)}',
  '${escapeSql(art.readTime)}',
  '${escapeSql(art.status)}',
  ${art.isFeatured ? 'TRUE' : 'FALSE'},
  ${art.views},
  '${escapeSql(art.publishedAt)}',
  '${escapeSql(art.authorName)}',
  '${escapeSql(art.createdAt || new Date().toISOString())}',
  '${escapeSql(art.updatedAt || new Date().toISOString())}'
)
ON CONFLICT ("id") DO UPDATE SET
  "title" = EXCLUDED."title",
  "category" = EXCLUDED."category",
  "summary" = EXCLUDED."summary",
  "content" = EXCLUDED."content",
  "image_url" = EXCLUDED."image_url",
  "read_time" = EXCLUDED."read_time",
  "status" = EXCLUDED."status",
  "is_featured" = EXCLUDED."is_featured",
  "views" = EXCLUDED."views",
  "published_at" = EXCLUDED."published_at",
  "author_name" = EXCLUDED."author_name",
  "updated_at" = CURRENT_TIMESTAMP;
`.trim());
    } catch (err: any) {
      result.failedCount++;
      result.errors.push({ id: art.id, error: err.message || String(err) });
      console.error(`  ❌ Failed to process article [${art.id}]:`, err.message);
    }
  }

  // Rewrite backend/articles.sql with clean schema-compliant SQL
  if (cleanSqlStatements.length > 0) {
    const header = `-- ============================================================
-- TEMANI Unified Education Articles Seed Data
-- Schema: PostgreSQL 15+ articles table
-- Generated & Sanitized from Base64 to Local Storage
-- ============================================================

`;
    const cleanSql = header + cleanSqlStatements.join('\n\n') + '\n';
    fs.writeFileSync(filePath, cleanSql, 'utf8');
    console.log(`💾 Successfully updated and sanitized ${filePath} (${cleanSql.length} bytes).`);
  }

  return result;
}

// Auto execute if run directly via CLI
if (
  process.argv[1]?.includes('importArticles.ts') ||
  process.argv[1]?.includes('importArticles.js')
) {
  importArticles()
    .then(async res => {
      console.log('\n========================================');
      console.log('🎉 ARTICLE IMPORT SUMMARY');
      console.log('========================================');
      console.log(`Total Articles Found:     ${res.totalProcessed}`);
      console.log(`Articles Imported to DB:  ${res.articlesImported}`);
      console.log(`Images Converted & Saved: ${res.imagesConverted}`);
      console.log(`Failed Items:             ${res.failedCount}`);
      if (res.errors.length > 0) {
        console.log('Errors:');
        res.errors.forEach(e => console.log(` - [${e.id}]: ${e.error}`));
      }
      console.log('========================================\n');
      await getDatabasePool().end();
      process.exit(res.failedCount > 0 ? 1 : 0);
    })
    .catch(async error => {
      console.error('Fatal error importing articles:', error);
      await getDatabasePool().end();
      process.exit(1);
    });
}

