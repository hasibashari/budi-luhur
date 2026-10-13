-- ============================================================
-- FEMORY CLEAN RELATIONAL SCHEMA (2-ROLE ARCHITECTURE)
-- PostgreSQL 15+ Schema Definition
-- ============================================================

-- Clean up any legacy tables to ensure fresh relational constraints
DROP TABLE IF EXISTS admin_nudges CASCADE;
DROP TABLE IF EXISTS user_bookmarks CASCADE;
DROP TABLE IF EXISTS article_sections CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS buddy_cheers CASCADE;
DROP TABLE IF EXISTS buddy_activities CASCADE;
DROP TABLE IF EXISTS buddy_connections CASCADE;
DROP TABLE IF EXISTS consumption_logs CASCADE;
DROP TABLE IF EXISTS schedule_time_slots CASCADE;
DROP TABLE IF EXISTS reminder_schedules CASCADE;
DROP TABLE IF EXISTS medication_schedules CASCADE;
DROP TABLE IF EXISTS reminders CASCADE;
DROP TABLE IF EXISTS health_program_enrollments CASCADE;
DROP TABLE IF EXISTS health_programs CASCADE;
DROP TABLE IF EXISTS patient_profiles CASCADE;
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
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. PRODUCTS (SUPPLEMENTS & TTD INVENTORY)
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'Suplemen TTD',
    sku VARCHAR(100) NOT NULL UNIQUE,
    stock INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) NOT NULL DEFAULT 'Tablet',
    price DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'Tersedia' CHECK(status IN ('Tersedia', 'Stok Menipis', 'Habis')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. REMINDER SCHEDULES
CREATE TABLE reminder_schedules (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE SET NULL,
    tablet_name VARCHAR(255) NOT NULL DEFAULT 'Tablet Tambah Darah (TTD)',
    dosage VARCHAR(100) NOT NULL DEFAULT '1 tablet',
    frequency VARCHAR(50) NOT NULL DEFAULT 'weekly' CHECK(frequency IN ('weekly', 'daily')),
    day_of_week VARCHAR(50) NOT NULL DEFAULT 'Sabtu',
    time_slot VARCHAR(50) NOT NULL DEFAULT '20:00',
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    remind_15min_before BOOLEAN NOT NULL DEFAULT TRUE,
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

-- 6. BUDDY STREAK SYSTEM (BUDDY GROUPS, MEMBERS, MESSAGES, CONNECTIONS)
CREATE TABLE buddy_groups (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    group_code VARCHAR(50) NOT NULL UNIQUE,
    creator_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    streak_count INTEGER NOT NULL DEFAULT 0,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buddy_group_members (
    id VARCHAR(255) PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL REFERENCES buddy_groups(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK(role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_group_member UNIQUE(group_id, user_id)
);

CREATE TABLE buddy_group_messages (
    id VARCHAR(255) PRIMARY KEY,
    group_id VARCHAR(255) NOT NULL REFERENCES buddy_groups(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    message_type VARCHAR(50) NOT NULL DEFAULT 'text' CHECK(message_type IN ('text', 'cheer', 'system')),
    content TEXT NOT NULL,
    cheer_type VARCHAR(50) CHECK(cheer_type IN ('HEART', 'FLAME', 'STAR', 'CLAP', 'POWER')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buddy_connections (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    buddy_user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACCEPTED' CHECK(status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED')),
    shared_streak_count INTEGER NOT NULL DEFAULT 0,
    this_week_user_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK(this_week_user_status IN ('recorded', 'missed', 'pending')),
    this_week_buddy_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK(this_week_buddy_status IN ('recorded', 'missed', 'pending')),
    last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_different_users CHECK(user_id != buddy_user_id),
    CONSTRAINT uq_buddy_pair UNIQUE(user_id, buddy_user_id)
);

CREATE TABLE buddy_activities (
    id VARCHAR(255) PRIMARY KEY,
    connection_id VARCHAR(255) NOT NULL REFERENCES buddy_connections(id) ON DELETE CASCADE,
    actor_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    action_text TEXT NOT NULL,
    icon_type VARCHAR(50) NOT NULL DEFAULT 'check' CHECK(icon_type IN ('check', 'flame', 'heart', 'alert')),
    is_positive BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE buddy_cheers (
    id VARCHAR(255) PRIMARY KEY,
    connection_id VARCHAR(255) NOT NULL REFERENCES buddy_connections(id) ON DELETE CASCADE,
    sender_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    cheer_type VARCHAR(50) NOT NULL DEFAULT 'HEART' CHECK(cheer_type IN ('HEART', 'FLAME', 'STAR', 'CLAP')),
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. EDUCATION ARTICLES & SECTIONS
CREATE TABLE articles (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL CHECK(category IN ('Anemia', 'TTD', 'Nutrisi', 'Gaya Hidup', 'Mitos & Fakta', 'Mitos', 'Anemia & TTD', 'Nutrisi & Gizi', 'Kesehatan Remaja', 'Tips Menstruasi')),
    summary TEXT NOT NULL,
    lead_paragraph TEXT,
    image_url TEXT NOT NULL,
    image_caption TEXT,
    read_time VARCHAR(50) NOT NULL DEFAULT '3 Menit Baca',
    status VARCHAR(50) NOT NULL DEFAULT 'Terbit' CHECK(status IN ('Terbit', 'Draf')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0,
    published_at DATE NOT NULL DEFAULT CURRENT_DATE,
    author_id VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(255),
    author_role VARCHAR(255),
    author_avatar_url TEXT,
    author_bio TEXT,
    key_takeaways TEXT,
    tags TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE article_sections (
    id SERIAL PRIMARY KEY,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 1,
    heading VARCHAR(255),
    subheading VARCHAR(255),
    paragraphs TEXT NOT NULL,
    callout_type VARCHAR(50) CHECK(callout_type IN ('tip', 'quote', 'warning')),
    callout_title VARCHAR(255),
    callout_text TEXT,
    bullet_points TEXT
);

CREATE TABLE user_bookmarks (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id VARCHAR(255) NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, article_id)
);

-- 8. ADMIN NUDGES (PERSONAL MANUAL REMINDERS)
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

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_profiles_friend_code ON user_profiles(friend_code);
CREATE INDEX idx_profiles_school ON user_profiles(school_or_org);
CREATE INDEX idx_schedules_user_status ON reminder_schedules(user_id, status);
CREATE INDEX idx_logs_user_date ON consumption_logs(user_id, scheduled_date);
CREATE INDEX idx_buddy_user ON buddy_connections(user_id, status);
CREATE INDEX idx_buddy_pair ON buddy_connections(buddy_user_id, status);
CREATE INDEX idx_buddy_activities_conn ON buddy_activities(connection_id, created_at DESC);
CREATE INDEX idx_group_members_user ON buddy_group_members(user_id);
CREATE INDEX idx_group_members_group ON buddy_group_members(group_id);
CREATE INDEX idx_group_messages_group_date ON buddy_group_messages(group_id, created_at ASC);
CREATE INDEX idx_group_code ON buddy_groups(group_code);
CREATE INDEX idx_articles_category ON articles(category, status);
CREATE INDEX idx_article_sections_order ON article_sections(article_id, order_index);
CREATE INDEX idx_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX idx_nudges_user_unread ON admin_nudges(user_id, status);
