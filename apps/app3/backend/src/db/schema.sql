-- ============================================================
-- TEMANI CLEAN RELATIONAL SCHEMA (IMUNISASI TT & PRANIKAH)
-- PostgreSQL 15+ Schema Definition
-- ============================================================

-- Clean up any legacy tables to ensure fresh relational constraints
DROP TABLE IF EXISTS admin_nudges CASCADE;
DROP TABLE IF EXISTS push_subscriptions CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;
DROP TABLE IF EXISTS article_sections CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS buddy_cheers CASCADE;
DROP TABLE IF EXISTS buddy_activities CASCADE;
DROP TABLE IF EXISTS buddy_connections CASCADE;
DROP TABLE IF EXISTS buddy_group_messages CASCADE;
DROP TABLE IF EXISTS buddy_group_members CASCADE;
DROP TABLE IF EXISTS buddy_groups CASCADE;
DROP TABLE IF EXISTS consumption_logs CASCADE;
DROP TABLE IF EXISTS schedule_time_slots CASCADE;
DROP TABLE IF EXISTS reminder_schedules CASCADE;
DROP TABLE IF EXISTS medication_schedules CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS health_program_enrollments CASCADE;
DROP TABLE IF EXISTS health_programs CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;
DROP TABLE IF EXISTS certificate_verifications CASCADE;
DROP TABLE IF EXISTS immunization_attachments CASCADE;
DROP TABLE IF EXISTS immunization_records CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS (MASTER ACCOUNT: 'admin' | 'user')
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK(role IN ('admin', 'user')),
    phone VARCHAR(50),
    avatar_url TEXT,
    gender VARCHAR(20) DEFAULT 'Perempuan' CHECK(gender IN ('Perempuan', 'Laki-laki')),
    date_of_birth DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. USER PROFILES (BIOMETRICS, SCHOOL, HB LEVEL, FRIEND CODE)
CREATE TABLE user_profiles (
    user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    friend_code VARCHAR(50) NOT NULL UNIQUE,
    school_or_org VARCHAR(255) DEFAULT NULL,
    hb_level DOUBLE PRECISION DEFAULT NULL,
    hb_status VARCHAR(50) DEFAULT 'Normal' CHECK(hb_status IN ('Normal', 'Anemia Ringan', 'Anemia Sedang', 'Anemia Berat')),
    risk_level VARCHAR(50) DEFAULT 'Rendah' CHECK(risk_level IN ('Tinggi', 'Sedang', 'Rendah')),
    height DOUBLE PRECISION DEFAULT NULL,
    weight DOUBLE PRECISION DEFAULT NULL,
    blood_type VARCHAR(10) DEFAULT NULL,
    streak_count INTEGER NOT NULL DEFAULT 0,
    level_title VARCHAR(100) NOT NULL DEFAULT 'Pemula Sehat',
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Nonaktif')),
    notes TEXT,
    wedding_date DATE DEFAULT NULL,
    tt_status VARCHAR(50) DEFAULT 'TT1' CHECK(tt_status IN ('TT0', 'TT1', 'TT2', 'TT3', 'TT4', 'TT5')),
    kua_status VARCHAR(50) DEFAULT 'Menunggu Skrining' CHECK(kua_status IN ('Terverifikasi', 'Menunggu Skrining', 'Belum Lengkap')),
    partner_name VARCHAR(255) DEFAULT NULL,
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. IMMUNIZATION RECORDS (TT1 - TT5)
CREATE TABLE immunization_records (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dose_level VARCHAR(3) NOT NULL CHECK (dose_level IN ('TT1', 'TT2', 'TT3', 'TT4', 'TT5')),
    vaccine_type VARCHAR(30) NOT NULL DEFAULT 'TT'
      CHECK (vaccine_type IN ('TT', 'Td', 'DPT', 'Lainnya')),
    vaccine_date DATE NOT NULL,
    faskes_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100),
    notes TEXT,
    info_source VARCHAR(30) NOT NULL DEFAULT 'self_reported'
      CHECK (info_source IN ('self_reported', 'faskes_record', 'health_worker')),
    date_precision VARCHAR(20) NOT NULL DEFAULT 'exact'
      CHECK (date_precision IN ('exact', 'month', 'year')),
    attachment_url TEXT,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING'
      CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
    verified_by VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    verification_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Bukti imunisasi opsional (BYTEA)
CREATE TABLE immunization_attachments (
    id VARCHAR(255) PRIMARY KEY,
    record_id VARCHAR(255) NOT NULL REFERENCES immunization_records(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    mime_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,
    data BYTEA NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verifikasi sertifikat imunisasi catin / nakes
CREATE TABLE certificate_verifications (
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

-- 4. REMINDER SCHEDULES
CREATE TABLE reminder_schedules (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tablet_name VARCHAR(255) NOT NULL DEFAULT 'Tablet Tambah Darah (TTD)',
    dosage VARCHAR(100) NOT NULL DEFAULT '1 tablet',
    frequency VARCHAR(50) NOT NULL DEFAULT 'weekly' CHECK(frequency IN ('weekly', 'daily')),
    day_of_week VARCHAR(50) NOT NULL DEFAULT 'Sabtu',
    time_slot VARCHAR(50) NOT NULL DEFAULT '20:00',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    remind_15min_before BOOLEAN NOT NULL DEFAULT TRUE,
    remind_1month_before BOOLEAN NOT NULL DEFAULT FALSE,
    remind_1day_before BOOLEAN NOT NULL DEFAULT TRUE,
    remind_30min_before BOOLEAN NOT NULL DEFAULT TRUE,
    reminder_timing VARCHAR(20) NOT NULL DEFAULT '3_days',
    channel_push BOOLEAN NOT NULL DEFAULT TRUE,
    channel_whatsapp BOOLEAN NOT NULL DEFAULT TRUE,
    channel_email BOOLEAN NOT NULL DEFAULT FALSE,
    tt_level VARCHAR(3) DEFAULT NULL CHECK (tt_level IN ('TT1', 'TT2', 'TT3', 'TT4', 'TT5')),
    scheduled_date DATE DEFAULT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    instructions TEXT DEFAULT 'Minum setelah makan malam atau sebelum tidur dengan air putih.',
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK(status IN ('Aktif', 'Selesai', 'Diberhentikan')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE schedule_time_slots (
    id SERIAL PRIMARY KEY,
    schedule_id VARCHAR(255) NOT NULL REFERENCES reminder_schedules(id) ON DELETE CASCADE,
    time VARCHAR(50) NOT NULL DEFAULT '20:00'
);

-- 5. CONSUMPTION LOGS
CREATE TABLE consumption_logs (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_id VARCHAR(255) REFERENCES reminder_schedules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Tablet Tambah Darah (TTD)',
    category VARCHAR(50) NOT NULL DEFAULT 'TTD',
    dosage VARCHAR(100) DEFAULT '1 Tablet',
    scheduled_date DATE NOT NULL,
    scheduled_time VARCHAR(50) NOT NULL DEFAULT '20:00',
    taken_at VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('ON_TIME', 'LATE', 'MISSED', 'SKIPPED', 'PENDING')),
    notes TEXT,
    taken_by VARCHAR(100) NOT NULL DEFAULT 'Self',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. EDUCATION ARTICLES (KONTEN TUNGGAL TERPADU)
CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK (btrim(category) <> ''),
    summary TEXT NOT NULL,
    content TEXT,
    image_url TEXT NOT NULL,
    read_time VARCHAR(50) NOT NULL DEFAULT '3 Menit Baca',
    status VARCHAR(50) NOT NULL DEFAULT 'Terbit' CHECK(status IN ('Terbit', 'Draf')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0,
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    author_name VARCHAR(255) DEFAULT 'Tim Medis Faskes',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- 7. ADMIN NUDGES (PERSONAL MANUAL REMINDERS)
CREATE TABLE admin_nudges (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    schedule_id VARCHAR(255) REFERENCES reminder_schedules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Pengingat Minum TTD',
    message TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL DEFAULT 'app' CHECK(channel IN ('app', 'whatsapp')),
    status VARCHAR(50) NOT NULL DEFAULT 'UNREAD' CHECK(status IN ('UNREAD', 'READ', 'DISMISSED')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. PUSH NOTIFICATION SUBSCRIPTIONS
CREATE TABLE push_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL UNIQUE,
    subscription JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_profiles_friend_code ON user_profiles(friend_code);
CREATE INDEX idx_profiles_school ON user_profiles(school_or_org);
CREATE INDEX idx_immunization_records_user ON immunization_records(user_id, vaccine_date);
CREATE INDEX idx_immunization_records_user_dose ON immunization_records(user_id, dose_level);
CREATE INDEX idx_immunization_attachments_record ON immunization_attachments(record_id);
CREATE INDEX idx_certificate_verifications_status ON certificate_verifications(status);
CREATE INDEX idx_schedules_user_status ON reminder_schedules(user_id, status);
CREATE INDEX idx_schedules_user_date ON reminder_schedules(user_id, scheduled_date);
CREATE INDEX idx_logs_user_date ON consumption_logs(user_id, scheduled_date);
CREATE INDEX idx_articles_category ON articles(category, status);
CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_nudges_user_unread ON admin_nudges(user_id, status);
CREATE INDEX idx_push_subscriptions_user ON push_subscriptions(user_id);
