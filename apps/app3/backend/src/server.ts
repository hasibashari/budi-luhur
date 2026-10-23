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
      ADD COLUMN IF NOT EXISTS vaccine_type VARCHAR(30) NOT NULL DEFAULT 'TT',
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

    -- Bukti imunisasi opsional (BYTEA, hanya lewat endpoint ber-autentikasi).
    CREATE TABLE IF NOT EXISTS immunization_attachments (
      id VARCHAR(255) PRIMARY KEY,
      record_id VARCHAR(255) NOT NULL REFERENCES immunization_records(id) ON DELETE CASCADE,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      file_name VARCHAR(255),
      mime_type VARCHAR(100) NOT NULL,
      file_size INTEGER NOT NULL,
      data BYTEA NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_immunization_attachments_record
      ON immunization_attachments(record_id);

    -- Verifikasi tanda tangan sertifikat: hanya admin yang menyetujui.
    CREATE TABLE IF NOT EXISTS certificate_verifications (
      user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
        CHECK (status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED')),
      certificate_number VARCHAR(100),
      note TEXT,
      requested_at TIMESTAMP WITH TIME ZONE,
      reviewed_by VARCHAR(255),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      signer_name VARCHAR(255),
      signer_sip VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_certificate_verifications_status
      ON certificate_verifications(status);
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
