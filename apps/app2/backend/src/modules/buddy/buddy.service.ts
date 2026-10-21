import db from '../../config/database.js';
import { calculateGroupChronologicalStreak } from '../../utils/groupStreakCalculator.js';
import { NotificationService } from '../notifications/notification.service.js';

export class BuddyService {
  static async calculateAndSyncGroupStreak(groupId: string): Promise<number> {
    const membersRes = await db.query<{ user_id: string }>(
      `SELECT user_id FROM buddy_group_members WHERE group_id = $1`,
      [groupId],
    );
    const memberIds = membersRes.rows.map(r => r.user_id);
    if (memberIds.length === 0) {
      await db.query(`UPDATE buddy_groups SET streak_count = 0 WHERE id = $1`, [groupId]);
      return 0;
    }

    const logsRes = await db.query<{ user_id: string; scheduled_date: string | Date }>(
      `SELECT user_id, scheduled_date 
       FROM consumption_logs 
       WHERE user_id = ANY($1) AND status IN ('ON_TIME', 'LATE')
       ORDER BY scheduled_date DESC`,
      [memberIds],
    );

    const completedLogs = logsRes.rows.map(r => ({
      userId: r.user_id,
      date: r.scheduled_date,
    }));

    const streak = calculateGroupChronologicalStreak(completedLogs, memberIds.length);

    await db.query(
      `UPDATE buddy_groups 
       SET streak_count = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [streak, groupId],
    );

    return streak;
  }

  static async getUserGroups(userId: string) {
    const groupsRes = await db.query<any>(
      `SELECT g.id, g.name, g.description, g.group_code, g.creator_id, g.streak_count, g.avatar_url, g.created_at
       FROM buddy_groups g
       JOIN buddy_group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1
       ORDER BY g.updated_at DESC, g.created_at DESC`,
      [userId],
    );

    const groups = [];
    for (const g of groupsRes.rows) {
      const membersRes = await db.query<any>(
        `SELECT u.id, u.name, u.avatar_url, gm.role, p.streak_count, p.school_or_org
         FROM buddy_group_members gm
         JOIN users u ON gm.user_id = u.id
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE gm.group_id = $1
         ORDER BY gm.joined_at ASC`,
        [g.id],
      );

      const members = membersRes.rows.map((m: any) => ({
        userId: m.id,
        name: m.name,
        avatarUrl: m.avatar_url || null,
        role: m.role as 'admin' | 'member',
        streakCount: m.streak_count || 0,
        school: m.school_or_org || undefined,
        statusThisWeek: 'pending',
      }));

      groups.push({
        id: g.id,
        name: g.name,
        description: g.description || undefined,
        groupCode: g.group_code,
        creatorId: g.creator_id,
        streakCount: g.streak_count || 0,
        memberCount: members.length,
        members,
        avatarUrl: g.avatar_url || undefined,
      });
    }

    return groups;
  }

  static async getGroupChatDetails(groupId: string, userId: string) {
    const [groupRes, membersRes, messagesRes] = await Promise.all([
      db.query<any>(`SELECT id, name, description, group_code, creator_id, streak_count, avatar_url FROM buddy_groups WHERE id = $1`, [groupId]),
      db.query<any>(
        `SELECT u.id, u.name, u.avatar_url, gm.role, p.streak_count, p.school_or_org
         FROM buddy_group_members gm
         JOIN users u ON gm.user_id = u.id
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE gm.group_id = $1
         ORDER BY gm.joined_at ASC`,
        [groupId],
      ),
      db.query<any>(
        `SELECT m.id, m.sender_id, u.name as sender_name, u.avatar_url as sender_avatar,
                m.message_type, m.content, m.cheer_type, m.created_at
         FROM buddy_group_messages m
         LEFT JOIN users u ON m.sender_id = u.id
         WHERE m.group_id = $1
         ORDER BY m.created_at ASC
         LIMIT 100`,
        [groupId],
      ),
    ]);

    const group = groupRes.rows[0];
    if (!group) return null;

    const members = membersRes.rows.map((m: any) => ({
      userId: m.id,
      name: m.name,
      avatarUrl: m.avatar_url || null,
      role: m.role as 'admin' | 'member',
      streakCount: m.streak_count || 0,
      school: m.school_or_org || undefined,
      statusThisWeek: 'pending',
    }));

    const messages = messagesRes.rows.map((msg: any) => ({
      id: msg.id,
      groupId,
      senderId: msg.sender_id || 'system',
      senderName: msg.sender_name || 'Sistem FEMORY',
      senderAvatar: msg.sender_avatar || '',
      type: msg.message_type,
      content: msg.content,
      cheerType: msg.cheer_type || undefined,
      timestamp: msg.created_at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      isMe: msg.sender_id === userId,
    }));

    return {
      group: {
        id: group.id,
        name: group.name,
        description: group.description || undefined,
        groupCode: group.group_code,
        creatorId: group.creator_id,
        streakCount: group.streak_count || 0,
        memberCount: members.length,
        members,
        avatarUrl: group.avatar_url || undefined,
      },
      messages,
      myRole: members.find((m: any) => m.userId === userId)?.role || 'member',
    };
  }

  static async createGroup(userId: string, data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Nama kelompok wajib diisi.' };
    }

    const cleanName = data.name.trim();
    const tag = cleanName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4) || 'GRP';
    const randCode = Math.floor(100 + Math.random() * 900);
    const groupCode = `FEM-${tag}-${randCode}`;
    const groupId = `grp_${Date.now().toString().slice(-6)}`;

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO buddy_groups (id, name, description, group_code, creator_id, streak_count)
         VALUES ($1, $2, $3, $4, $5, 0)`,
        [groupId, cleanName, data.description?.trim() || null, groupCode, userId],
      );

      await client.query(
        `INSERT INTO buddy_group_members (id, group_id, user_id, role)
         VALUES ($1, $2, $3, 'admin')`,
        [`gm_${Date.now().toString().slice(-6)}`, groupId, userId],
      );

      await client.query(
        `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
         VALUES ($1, $2, $3, 'system', $4)`,
        [`msg_${Date.now().toString().slice(-6)}`, groupId, userId, 'Grup berhasil dibuat! Mari cegah anemia bersama-sama 🌸'],
      );
    });

    return { success: true, groupId, groupCode };
  }

  static async joinGroupByCode(userId: string, groupCode: string) {
    const cleanCode = groupCode.trim().toUpperCase();
    const groupRes = await db.query<{ id: string; name: string }>(
      `SELECT id, name FROM buddy_groups WHERE upper(group_code) = $1`,
      [cleanCode],
    );

    const group = groupRes.rows[0];
    if (!group) {
      return { success: false, error: 'Kode grup tidak ditemukan. Periksa kembali kodenya.' };
    }

    const memberCheck = await db.query(
      `SELECT id FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [group.id, userId],
    );
    if (memberCheck.rows.length > 0) {
      return { success: false, error: 'Anda sudah bergabung dalam grup ini.' };
    }

    await db.transaction(async (client) => {
      await client.query(
        `INSERT INTO buddy_group_members (id, group_id, user_id, role)
         VALUES ($1, $2, $3, 'member')`,
        [`gm_${Date.now().toString().slice(-6)}`, group.id, userId],
      );

      await client.query(
        `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content)
         VALUES ($1, $2, $3, 'system', 'Sahabat baru telah bergabung ke kelompok! 🌸')`,
        [`msg_${Date.now().toString().slice(-6)}`, group.id, userId],
      );
    });

    await this.calculateAndSyncGroupStreak(group.id);
    return { success: true, groupId: group.id, groupName: group.name };
  }

  static async sendMessage(
    userId: string,
    groupId: string,
    data: { content?: string; message?: string; type?: string; messageType?: string; cheerType?: string },
  ) {
    const textContent = (data.content || data.message || '').trim();
    const rawType = (data.messageType || data.type || 'text').toLowerCase();
    const type = ['text', 'cheer', 'system'].includes(rawType) ? rawType : 'text';
    const msgId = `msg_${Date.now().toString().slice(-6)}`;

    await db.query(
      `INSERT INTO buddy_group_messages (id, group_id, sender_id, message_type, content, cheer_type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [msgId, groupId, userId, type, textContent, data.cheerType || null],
    );

    await db.query(`UPDATE buddy_groups SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [groupId]);

    const [groupRes, membersRes] = await Promise.all([
      db.query<{ name: string }>(`SELECT name FROM buddy_groups WHERE id = $1`, [groupId]),
      db.query<{ user_id: string }>(
        `SELECT user_id FROM buddy_group_members WHERE group_id = $1 AND user_id <> $2`,
        [groupId, userId],
      ),
    ]);
    const groupName = groupRes.rows[0]?.name || 'Kelompok Sahabat';
    await Promise.all(
      membersRes.rows.map(member =>
        NotificationService.sendToUser(member.user_id, {
          title: `Pesan baru di ${groupName}`,
          body: textContent,
          url: '/app2/user/buddy',
        }),
      ),
    );

    return { success: true, messageId: msgId };
  }
}
