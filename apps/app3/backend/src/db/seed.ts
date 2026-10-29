import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabasePool, pool } from '../config/database.js';
import { initializeDatabase } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedDatabase() {
  console.log('🌱 Starting PostgreSQL database seeding for TEMANI (Imunisasi TT & Pranikah)...');

  // Ensure schema exists
  await initializeDatabase();

  // Load JSON seed data
  const dataPath = path.join(__dirname, 'seedData.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Seed data file not found at: ${dataPath}`);
  }

  const seedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM users WHERE role <> 'admin'`);

    // 1. Users (Role: 'admin' | 'user')
    console.log('  -> Seeding users (2 Roles)...');
    const insertUserQuery = `
      INSERT INTO users (
        id, name, email, password_hash, role, phone, avatar_url, gender, date_of_birth
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        phone = EXCLUDED.phone,
        avatar_url = EXCLUDED.avatar_url,
        gender = EXCLUDED.gender,
        date_of_birth = EXCLUDED.date_of_birth,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const u of seedData.users) {
      await client.query(insertUserQuery, [
        u.id,
        u.name,
        u.email,
        u.passwordHash ?? null,
        u.role,
        u.phone ?? null,
        u.avatarUrl ?? null,
        u.gender ?? 'Perempuan',
        u.dateOfBirth ?? null,
      ]);
    }

    // 2. User Profiles
    console.log('  -> Seeding user profiles...');
    const insertUserProfileQuery = `
      INSERT INTO user_profiles (
        user_id, friend_code, school_or_org, hb_level, hb_status, risk_level, height, weight, blood_type, streak_count, level_title, status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (user_id) DO UPDATE SET
        friend_code = EXCLUDED.friend_code,
        school_or_org = EXCLUDED.school_or_org,
        hb_level = EXCLUDED.hb_level,
        hb_status = EXCLUDED.hb_status,
        risk_level = EXCLUDED.risk_level,
        height = EXCLUDED.height,
        weight = EXCLUDED.weight,
        blood_type = EXCLUDED.blood_type,
        streak_count = EXCLUDED.streak_count,
        level_title = EXCLUDED.level_title,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes
    `;

    for (const p of seedData.userProfiles) {
      await client.query(insertUserProfileQuery, [
        p.userId,
        p.friendCode,
        p.schoolOrOrg,
        p.hbLevel,
        p.hbStatus,
        p.riskLevel,
        p.height ?? 158.0,
        p.weight ?? 48.0,
        p.bloodType ?? 'O+',
        p.streakCount ?? 0,
        p.levelTitle ?? 'Pemula Sehat',
        p.status ?? 'Aktif',
        p.notes ?? null,
      ]);
    }

    // 3. Reminder Schedules
    console.log('  -> Seeding reminder schedules...');
    const insertScheduleQuery = `
      INSERT INTO reminder_schedules (
        id, user_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        tablet_name = EXCLUDED.tablet_name,
        dosage = EXCLUDED.dosage,
        frequency = EXCLUDED.frequency,
        day_of_week = EXCLUDED.day_of_week,
        time_slot = EXCLUDED.time_slot,
        is_enabled = EXCLUDED.is_enabled,
        remind_15min_before = EXCLUDED.remind_15min_before,
        instructions = EXCLUDED.instructions,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const sch of seedData.reminderSchedules) {
      await client.query(insertScheduleQuery, [
        sch.id,
        sch.userId,
        sch.tabletName,
        sch.dosage,
        sch.frequency,
        sch.dayOfWeek,
        sch.timeSlot,
        sch.isEnabled ?? true,
        sch.remind15minBefore ?? true,
        sch.instructions,
        sch.status ?? 'Aktif',
      ]);
    }

    // 5. Consumption Logs
    console.log('  -> Seeding consumption logs...');
    const insertLogQuery = `
      INSERT INTO consumption_logs (
        id, user_id, schedule_id, title, category, dosage, scheduled_date, scheduled_time, taken_at, status, notes, taken_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        schedule_id = EXCLUDED.schedule_id,
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        dosage = EXCLUDED.dosage,
        scheduled_date = EXCLUDED.scheduled_date,
        scheduled_time = EXCLUDED.scheduled_time,
        taken_at = EXCLUDED.taken_at,
        status = EXCLUDED.status,
        notes = EXCLUDED.notes,
        taken_by = EXCLUDED.taken_by
    `;

    for (const l of seedData.consumptionLogs) {
      await client.query(insertLogQuery, [
        l.id,
        l.userId,
        l.scheduleId ?? null,
        l.title,
        l.category,
        l.dosage ?? null,
        l.scheduledDate,
        l.scheduledTime,
        l.takenAt ?? null,
        l.status,
        l.notes ?? null,
        l.takenBy ?? 'Self',
      ]);
    }

    // 5. Articles (Single Unified Table)
    console.log('  -> Seeding articles...');
    const insertArticleQuery = `
      INSERT INTO articles (
        id, title, category, summary, content, image_url, read_time, status, is_featured, views, published_at, author_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
        updated_at = CURRENT_TIMESTAMP
    `;

    if (seedData.articles && seedData.articles.length > 0) {
      for (const art of seedData.articles) {
        const artContent = (art as any).content ?? art.leadParagraph ?? art.summary;
        await client.query(insertArticleQuery, [
          art.id,
          art.title,
          art.category,
          art.summary,
          artContent,
          art.imageUrl,
          art.readTime,
          art.status ?? 'Terbit',
          art.isFeatured ?? false,
          art.views ?? 0,
          art.publishedAt,
          art.authorName ?? 'Tim Medis Faskes',
        ]);
      }
    } else {
      const articlesSqlPath = path.resolve(__dirname, '../../articles.sql');
      if (fs.existsSync(articlesSqlPath)) {
        const articlesSql = fs.readFileSync(articlesSqlPath, 'utf8');
        await client.query(articlesSql);
      }
    }

    // 10. Admin Nudges
    console.log('  -> Seeding admin nudges...');
    const insertNudgeQuery = `
      INSERT INTO admin_nudges (
        id, user_id, sender_id, schedule_id, title, message, channel, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        message = EXCLUDED.message,
        channel = EXCLUDED.channel,
        status = EXCLUDED.status
    `;

    for (const ndg of seedData.adminNudges) {
      await client.query(insertNudgeQuery, [
        ndg.id,
        ndg.userId,
        ndg.senderId ?? null,
        ndg.scheduleId ?? null,
        ndg.title,
        ndg.message,
        ndg.channel ?? 'app',
        ndg.status ?? 'UNREAD',
      ]);
    }

    await client.query('COMMIT');
    console.log('✅ TEMANI Database seeding completed successfully (Imunisasi TT & Pranikah)!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Auto execute if run directly via CLI (npx tsx src/db/seed.ts)
if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  seedDatabase()
    .then(async () => {
      await getDatabasePool().end();
      process.exit(0);
    })
    .catch(async error => {
      console.error('Failed to seed:', error);
      await getDatabasePool().end();
      process.exit(1);
    });
}
