import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = fs.existsSync(path.join(__dirname, 'migrations'))
  ? path.join(__dirname, 'migrations')
  : path.join(process.cwd(), 'src', 'db', 'migrations');

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version VARCHAR(255) PRIMARY KEY,
      applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const files = fs
    .readdirSync(migrationsDirectory)
    .filter(file => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const applied = await db.query<{ version: string }>(
      'SELECT version FROM schema_migrations WHERE version = $1',
      [file],
    );
    if (applied.rows.length > 0) continue;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(fs.readFileSync(path.join(migrationsDirectory, file), 'utf8'));
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`✅ Applied migration ${file}`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  console.log('✅ Database migrations are up to date.');
}

migrate()
  .catch(error => {
    console.error('❌ Database migration failed:', error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
