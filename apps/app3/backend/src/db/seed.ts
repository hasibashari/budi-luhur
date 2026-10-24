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

    // 3. Products
    console.log('  -> Seeding products...');
    const insertProductQuery = `
      INSERT INTO products (
        id, name, category, sku, stock, unit, price, status, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        category = EXCLUDED.category,
        sku = EXCLUDED.sku,
        stock = EXCLUDED.stock,
        unit = EXCLUDED.unit,
        price = EXCLUDED.price,
        status = EXCLUDED.status,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const prod of seedData.products) {
      await client.query(insertProductQuery, [
        prod.id,
        prod.name,
        prod.category,
        prod.sku,
        prod.stock,
        prod.unit,
        prod.price,
        prod.status,
        prod.description ?? null,
      ]);
    }

    // 4. Reminder Schedules
    console.log('  -> Seeding reminder schedules...');
    const insertScheduleQuery = `
      INSERT INTO reminder_schedules (
        id, user_id, product_id, tablet_name, dosage, frequency, day_of_week, time_slot, is_enabled, remind_15min_before, instructions, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        product_id = EXCLUDED.product_id,
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
        sch.productId ?? null,
        sch.tabletName,
        sch.dosage,
        sch.frequency,
        sch.dayOfWeek,
        sch.timeSlot,
        sch.isEnabled ?? true,
        sch.remind15MinBefore ?? true,
        sch.instructions ?? null,
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

    // 6. Buddy Connections
    console.log('  -> Seeding buddy connections...');
    const insertBuddyConnQuery = `
      INSERT INTO buddy_connections (
        id, user_id, buddy_user_id, status, shared_streak_count, this_week_user_status, this_week_buddy_status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        shared_streak_count = EXCLUDED.shared_streak_count,
        this_week_user_status = EXCLUDED.this_week_user_status,
        this_week_buddy_status = EXCLUDED.this_week_buddy_status,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const bc of seedData.buddyConnections) {
      await client.query(insertBuddyConnQuery, [
        bc.id,
        bc.userId,
        bc.buddyUserId,
        bc.status ?? 'ACCEPTED',
        bc.sharedStreakCount ?? 0,
        bc.thisWeekUserStatus ?? 'pending',
        bc.thisWeekBuddyStatus ?? 'pending',
      ]);
    }

    // 7. Buddy Activities
    console.log('  -> Seeding buddy activities...');
    const insertBuddyActQuery = `
      INSERT INTO buddy_activities (
        id, connection_id, actor_id, action_type, action_text, icon_type, is_positive
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        action_type = EXCLUDED.action_type,
        action_text = EXCLUDED.action_text,
        icon_type = EXCLUDED.icon_type,
        is_positive = EXCLUDED.is_positive
    `;

    for (const act of seedData.buddyActivities) {
      await client.query(insertBuddyActQuery, [
        act.id,
        act.connectionId,
        act.actorId,
        act.actionType,
        act.actionText,
        act.iconType ?? 'check',
        act.isPositive ?? true,
      ]);
    }

    // 8. Buddy Cheers
    console.log('  -> Seeding buddy cheers...');
    const insertBuddyCheerQuery = `
      INSERT INTO buddy_cheers (
        id, connection_id, sender_id, receiver_id, cheer_type, message
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        cheer_type = EXCLUDED.cheer_type,
        message = EXCLUDED.message
    `;

    for (const chr of seedData.buddyCheers) {
      await client.query(insertBuddyCheerQuery, [
        chr.id,
        chr.connectionId,
        chr.senderId,
        chr.receiverId,
        chr.cheerType ?? 'HEART',
        chr.message ?? null,
      ]);
    }

    // 8b. Buddy Groups
    console.log('  -> Seeding buddy groups...');
    const insertGroupQuery = `
      INSERT INTO buddy_groups (
        id, name, description, group_code, creator_id, streak_count, avatar_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        group_code = EXCLUDED.group_code,
        creator_id = EXCLUDED.creator_id,
        streak_count = EXCLUDED.streak_count,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = CURRENT_TIMESTAMP
    `;

    if (seedData.buddyGroups) {
      for (const grp of seedData.buddyGroups) {
        await client.query(insertGroupQuery, [
          grp.id,
          grp.name,
          grp.description ?? null,
          grp.groupCode,
          grp.creatorId ?? null,
          grp.streakCount ?? 0,
          grp.avatarUrl ?? null,
        ]);
      }
    }

    // 8c. Buddy Group Members
    console.log('  -> Seeding buddy group members...');
    const insertGroupMemberQuery = `
      INSERT INTO buddy_group_members (
        id, group_id, user_id, role
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (id) DO UPDATE SET
        role = EXCLUDED.role
    `;

    if (seedData.buddyGroupMembers) {
      for (const gmb of seedData.buddyGroupMembers) {
        await client.query(insertGroupMemberQuery, [
          gmb.id,
          gmb.groupId,
          gmb.userId,
          gmb.role ?? 'member',
        ]);
      }
    }

    // 8d. Buddy Group Messages
    console.log('  -> Seeding buddy group messages...');
    const insertGroupMsgQuery = `
      INSERT INTO buddy_group_messages (
        id, group_id, sender_id, message_type, content, cheer_type
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        cheer_type = EXCLUDED.cheer_type
    `;

    if (seedData.buddyGroupMessages) {
      for (const gmsg of seedData.buddyGroupMessages) {
        await client.query(insertGroupMsgQuery, [
          gmsg.id,
          gmsg.groupId,
          gmsg.senderId ?? null,
          gmsg.messageType ?? 'text',
          gmsg.content,
          gmsg.cheerType ?? null,
        ]);
      }
    }

    // 9. Articles & Sections
    console.log('  -> Seeding articles...');
    const insertArticleQuery = `
      INSERT INTO articles (
        id, title, category, summary, lead_paragraph, image_url, image_caption, read_time, status, is_featured, views, published_at, author_id, author_name, author_role, author_avatar_url, key_takeaways, tags
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        summary = EXCLUDED.summary,
        lead_paragraph = EXCLUDED.lead_paragraph,
        image_url = EXCLUDED.image_url,
        image_caption = EXCLUDED.image_caption,
        read_time = EXCLUDED.read_time,
        status = EXCLUDED.status,
        is_featured = EXCLUDED.is_featured,
        views = EXCLUDED.views,
        published_at = EXCLUDED.published_at,
        author_id = EXCLUDED.author_id,
        author_name = EXCLUDED.author_name,
        author_role = EXCLUDED.author_role,
        author_avatar_url = EXCLUDED.author_avatar_url,
        key_takeaways = EXCLUDED.key_takeaways,
        tags = EXCLUDED.tags,
        updated_at = CURRENT_TIMESTAMP
    `;

    for (const art of seedData.articles) {
      await client.query(insertArticleQuery, [
        art.id,
        art.title,
        art.category,
        art.summary,
        art.leadParagraph ?? null,
        art.imageUrl,
        art.imageCaption ?? null,
        art.readTime,
        art.status ?? 'Terbit',
        art.isFeatured ?? false,
        art.views ?? 0,
        art.publishedAt,
        art.authorId ?? null,
        art.authorName ?? null,
        art.authorRole ?? null,
        art.authorAvatarUrl ?? null,
        art.keyTakeaways ?? null,
        art.tags ?? null,
      ]);

      if (art.sections && Array.isArray(art.sections)) {
        await client.query('DELETE FROM article_sections WHERE article_id = $1', [art.id]);
        for (const sec of art.sections) {
          await client.query(
            `INSERT INTO article_sections (
              article_id, order_index, heading, subheading, paragraphs, callout_type, callout_title, callout_text, bullet_points
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              art.id,
              sec.orderIndex,
              sec.heading ?? null,
              sec.subheading ?? null,
              sec.paragraphs,
              sec.calloutType ?? null,
              sec.calloutTitle ?? null,
              sec.calloutText ?? null,
              sec.bulletPoints ?? null,
            ],
          );
        }
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
