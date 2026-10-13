import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db, { pool } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function initializeDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await db.query(schemaSql);
  console.log('✅ PostgreSQL database schema initialized successfully!');
}

if (process.argv[1]?.includes('init.ts') || process.argv[1]?.includes('init.js')) {
  initializeDatabase()
    .then(async () => {
      await pool.end();
      process.exit(0);
    })
    .catch(async error => {
      console.error('❌ Failed to initialize PostgreSQL database:', error);
      await pool.end();
      process.exit(1);
    });
}
