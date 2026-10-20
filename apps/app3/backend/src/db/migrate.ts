import db, { pool } from '../config/database.js';

async function migrate() {
  await db.query(`
    ALTER TABLE reminder_schedules
      ADD COLUMN IF NOT EXISTS reminder_timing VARCHAR(20) NOT NULL DEFAULT '3_days',
      ADD COLUMN IF NOT EXISTS channel_push BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS channel_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS channel_email BOOLEAN NOT NULL DEFAULT FALSE
  `);

  console.log('✅ Reminder settings columns migrated successfully.');
}

migrate()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async error => {
    console.error('❌ Failed to migrate reminder settings columns:', error);
    await pool.end();
    process.exit(1);
  });
