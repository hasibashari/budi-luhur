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
      db.query<any>(
        `SELECT id, name, description, group_code, creator_id, streak_count, avatar_url FROM buddy_groups WHERE id = $1`,
        [groupId],
      ),
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
      timestamp:
        msg.created_at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
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
      members,
      messages,
      myRole: members.find((m: any) => m.userId === userId)?.role || 'member',
    };
  }

  static async createGroup(userId: string, data: { name: string; description?: string }) {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Nama kelompok wajib diisi.' };
    }

    const cleanName = data.name.trim();
    const tag =
      cleanName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 4) || 'GRP';
    const randCode = Math.floor(100 + Math.random() * 900);
    const groupCode = `FEM-${tag}-${randCode}`;
    const groupId = `grp_${Date.now().toString().slice(-6)}`;

    await db.transaction(async client => {
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
        [
          `msg_${Date.now().toString().slice(-6)}`,
          groupId,
          userId,
          'Grup berhasil dibuat! Mari cegah anemia bersama-sama 🌸',
        ],
      );
    });

    return {
      success: true,
      group: {
        id: groupId,
        name: cleanName,
        groupCode,
        creatorId: userId,
        streakCount: 0,
        memberCount: 1,
      },
    };
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

    await db.transaction(async client => {
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
    return {
      success: true,
      group: {
        id: group.id,
        name: group.name,
        groupCode: cleanCode,
      },
    };
  }

  static async sendMessage(
    userId: string,
    groupId: string,
    data: {
      content?: string;
      message?: string;
      type?: string;
      messageType?: string;
      cheerType?: string;
    },
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

    await db.query(`UPDATE buddy_groups SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [
      groupId,
    ]);

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
          url: '/app1/user/buddy',
        }),
      ),
    );

    return { success: true, messageId: msgId };
  }

  // ── TAMBAH: Update group ────────────────────────────────────────────────
  static async updateGroup(
    groupId: string,
    userId: string,
    data: { name?: string; description?: string },
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    // Cek bahwa user adalah admin
    const roleRes = await db.query<{ role: string }>(
      `SELECT role FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId],
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'admin') {
      return { success: false, error: 'Hanya admin grup yang dapat mengubah informasi grup.' };
    }

    const cleanName = data.name?.trim();
    const cleanDesc = data.description?.trim() || null;

    if (cleanName) {
      await db.query(
        `UPDATE buddy_groups SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
        [cleanName, cleanDesc, groupId],
      );
    } else {
      await db.query(
        `UPDATE buddy_groups SET description = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [cleanDesc, groupId],
      );
    }

    return { success: true, message: 'Informasi grup berhasil diperbarui.' };
  }

  // ── TAMBAH: Delete group (hanya admin) ─────────────────────────────────
  static async deleteGroup(
    groupId: string,
    userId: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const roleRes = await db.query<{ role: string }>(
      `SELECT role FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId],
    );
    if (!roleRes.rows[0] || roleRes.rows[0].role !== 'admin') {
      return { success: false, error: 'Hanya admin grup yang dapat menghapus grup.' };
    }

    await db.transaction(async client => {
      await client.query(`DELETE FROM buddy_group_messages WHERE group_id = $1`, [groupId]);
      await client.query(`DELETE FROM buddy_group_members WHERE group_id = $1`, [groupId]);
      await client.query(`DELETE FROM buddy_groups WHERE id = $1`, [groupId]);
    });

    return { success: true, message: 'Grup berhasil dihapus.' };
  }

  // ── TAMBAH: Leave group (anggota biasa) ─────────────────────────────────
  static async leaveGroup(
    groupId: string,
    userId: string,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const memberRes = await db.query<{ role: string }>(
      `SELECT role FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`,
      [groupId, userId],
    );
    if (!memberRes.rows[0]) {
      return { success: false, error: 'Anda bukan anggota grup ini.' };
    }

    // Jika admin dan hanya 1 anggota → hapus grup
    const countRes = await db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM buddy_group_members WHERE group_id = $1`,
      [groupId],
    );
    const memberCount = parseInt(countRes.rows[0]?.count || '0', 10);

    if (memberRes.rows[0].role === 'admin' && memberCount <= 1) {
      return this.deleteGroup(groupId, userId);
    }

    // Jika admin dan masih ada anggota lain → transfer admin
    if (memberRes.rows[0].role === 'admin') {
      const nextAdmin = await db.query<{ user_id: string }>(
        `SELECT user_id FROM buddy_group_members WHERE group_id = $1 AND user_id <> $2 ORDER BY joined_at ASC LIMIT 1`,
        [groupId, userId],
      );
      if (nextAdmin.rows[0]) {
        await db.query(
          `UPDATE buddy_group_members SET role = 'admin' WHERE group_id = $1 AND user_id = $2`,
          [groupId, nextAdmin.rows[0].user_id],
        );
      }
    }

    await db.query(`DELETE FROM buddy_group_members WHERE group_id = $1 AND user_id = $2`, [
      groupId,
      userId,
    ]);

    await this.calculateAndSyncGroupStreak(groupId);
    return { success: true, message: 'Berhasil keluar dari grup.' };
  }
}
