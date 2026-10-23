import { app } from './app.js';
import { config } from './config/env.js';
import db from './config/database.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : config.port;

async function start() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);

    -- Kolom domain TT pada jadwal imunisasi (aman dijalankan berulang).
    ALTER TABLE reminder_schedules
      ADD COLUMN IF NOT EXISTS tt_level VARCHAR(3),
      ADD COLUMN IF NOT EXISTS scheduled_date DATE,
      ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
    CREATE INDEX IF NOT EXISTS idx_schedules_user_date ON reminder_schedules(user_id, scheduled_date);

    -- Kolom kejujuran data riwayat imunisasi TT (aman dijalankan berulang).
    ALTER TABLE immunization_records
      ADD COLUMN IF NOT EXISTS info_source VARCHAR(30) NOT NULL DEFAULT 'self_reported',
      ADD COLUMN IF NOT EXISTS date_precision VARCHAR(20) NOT NULL DEFAULT 'exact',
      ADD COLUMN IF NOT EXISTS attachment_url TEXT,
      ADD COLUMN IF NOT EXISTS verified_by VARCHAR(255),
      ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS verification_note TEXT,
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;
    ALTER TABLE immunization_records
      DROP CONSTRAINT IF EXISTS immunization_records_user_id_dose_level_key;
    CREATE INDEX IF NOT EXISTS idx_immunization_records_user_dose
      ON immunization_records(user_id, dose_level);
  `);
  app.listen(PORT, () => {
    console.log(`🚀 TEMANI Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/v1/health`);
  });
}

start().catch(error => {
  console.error('❌ Failed to prepare push notification storage:', error);
  process.exit(1);
});

export default app;
