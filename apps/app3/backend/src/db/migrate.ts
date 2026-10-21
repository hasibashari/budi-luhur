import db, { getDatabasePool } from '../config/database.js';

async function migrate() {
  await db.query(`
    ALTER TABLE reminder_schedules
      ADD COLUMN IF NOT EXISTS reminder_timing VARCHAR(20) NOT NULL DEFAULT '3_days',
      ADD COLUMN IF NOT EXISTS channel_push BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS channel_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS channel_email BOOLEAN NOT NULL DEFAULT FALSE
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS immunization_records (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      dose_level VARCHAR(3) NOT NULL CHECK (dose_level IN ('TT1', 'TT2', 'TT3', 'TT4', 'TT5')),
      vaccine_date DATE NOT NULL,
      faskes_name VARCHAR(255) NOT NULL,
      batch_number VARCHAR(100),
      notes TEXT,
      verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
        CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, dose_level)
    );
    CREATE INDEX IF NOT EXISTS idx_immunization_records_user
      ON immunization_records(user_id, vaccine_date);
  `);

  console.log('✅ App 3 database migrations completed successfully.');
}

migrate()
  .then(async () => {
    await getDatabasePool().end();
    process.exit(0);
  })
  .catch(async error => {
    console.error('❌ Failed to migrate reminder settings columns:', error);
    await getDatabasePool().end();
    process.exit(1);
  });
