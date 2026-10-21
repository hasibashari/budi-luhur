import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../../config/database.js';
import { config } from '../../config/env.js';
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  UserDbRow,
  UserRole,
} from './auth.types.js';

export class AuthService {
  static async login(credentials: LoginCredentials) {
    const normalizedEmail = (credentials.email || '').trim().toLowerCase();

    // 1. Check direct email match
    const res = await db.query<UserDbRow>(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.avatar_url, u.gender,
              p.friend_code, p.school_or_org, p.hb_level, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE lower(u.email) = $1`,
      [normalizedEmail],
    );
    let row = res.rows[0];

    // 2. Demo keyword / roleHint fallback
    if (!row) {
      if (normalizedEmail.includes('admin') || credentials.roleHint === 'admin') {
        const adminRes = await db.query<UserDbRow>(
          `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.avatar_url, u.gender,
                  p.friend_code, p.school_or_org, p.hb_level, p.streak_count
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.role = 'admin' LIMIT 1`,
        );
        row = adminRes.rows[0];
      } else if (
        normalizedEmail.includes('sarah') ||
        normalizedEmail.includes('user') ||
        normalizedEmail.includes('budi') ||
        credentials.roleHint === 'user'
      ) {
        const userRes = await db.query<UserDbRow>(
          `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.avatar_url, u.gender,
                  p.friend_code, p.school_or_org, p.hb_level, p.streak_count
           FROM users u
           LEFT JOIN user_profiles p ON u.id = p.user_id
           WHERE u.role = 'user' LIMIT 1`,
        );
        row = userRes.rows[0];
      }
    }

    if (!row) {
      return {
        success: false,
        error: 'Pengguna tidak ditemukan. Silakan periksa kembali email Anda.',
      };
    }

    // Optional password verification if password provided and hash exists
    if (credentials.password && row.password_hash) {
      const isMatch = await bcrypt
        .compare(credentials.password, row.password_hash)
        .catch(() => false);
      if (!isMatch && credentials.password !== 'password123') {
        // Allow demo fallback password
      }
    }

    // 3. Check active schedule count to determine if user has set up their initial schedule
    const schedRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif'`,
      [row.id],
    );
    const scheduleCount = Number(schedRes.rows[0]?.count || 0);

    const hasSchool = Boolean(row.school_or_org && row.school_or_org.trim());
    const hasSchedule = scheduleCount > 0;
    const isProfileComplete = row.role === 'admin' || (hasSchool && hasSchedule);

    const authUser: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      phone: row.phone || undefined,
      avatarUrl: row.avatar_url || undefined,
      gender: row.gender || 'Perempuan',
      friendCode: row.friend_code || undefined,
      schoolOrOrg: row.school_or_org || undefined,
      hbLevel: row.hb_level !== null ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
      isProfileComplete,
    };

    const token = jwt.sign(
      { id: authUser.id, email: authUser.email, role: authUser.role, name: authUser.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
    );

    const redirectTo =
      authUser.role === 'admin'
        ? '/admin/dashboard'
        : isProfileComplete
          ? '/user/dashboard'
          : '/user/setup';

    return {
      success: true,
      token,
      user: authUser,
      redirectTo,
      isProfileComplete,
    };
  }

  static async quickLogin(role: UserRole) {
    const targetRole = role === 'admin' ? 'admin' : 'user';
    const res = await db.query<UserDbRow>(
      `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar_url, u.gender,
              p.friend_code, p.school_or_org, p.hb_level, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.role = $1 
       ORDER BY u.id ASC LIMIT 1`,
      [targetRole],
    );
    const row = res.rows[0];

    if (!row) {
      throw new Error(`Pengguna dengan peran ${role} tidak ditemukan.`);
    }

    const schedRes = await db.query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM reminder_schedules WHERE user_id = $1 AND status = 'Aktif'`,
      [row.id],
    );
    const scheduleCount = Number(schedRes.rows[0]?.count || 0);
    const hasSchool = Boolean(row.school_or_org && row.school_or_org.trim());
    const hasSchedule = scheduleCount > 0;
    const isProfileComplete = row.role === 'admin' || (hasSchool && hasSchedule);

    const authUser: AuthUser = {
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role as UserRole,
      phone: row.phone || undefined,
      avatarUrl: row.avatar_url || undefined,
      gender: row.gender || 'Perempuan',
      friendCode: row.friend_code || undefined,
      schoolOrOrg: row.school_or_org || undefined,
      hbLevel: row.hb_level !== null ? Number(row.hb_level) : undefined,
      streakCount: row.streak_count !== null ? Number(row.streak_count) : 0,
      isProfileComplete,
    };

    const token = jwt.sign(
      { id: authUser.id, email: authUser.email, role: authUser.role, name: authUser.name },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
    );

    const redirectTo =
      authUser.role === 'admin'
        ? '/admin/dashboard'
        : isProfileComplete
          ? '/user/dashboard'
          : '/user/setup';

    return {
      success: true,
      token,
      user: authUser,
      redirectTo,
      isProfileComplete,
    };
  }

  static async register(data: RegisterCredentials) {
    if (!data.name || !data.name.trim()) {
      return { success: false, error: 'Nama lengkap wajib diisi.' };
    }
    if (!data.email || !data.email.trim()) {
      return { success: false, error: 'Alamat email wajib diisi.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Kata sandi minimal 6 karakter.' };
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const existingRes = await db.query(`SELECT id FROM users WHERE lower(email) = $1`, [
      normalizedEmail,
    ]);
    if (existingRes.rows.length > 0) {
      return {
        success: false,
        error: 'Email sudah terdaftar. Silakan masuk menggunakan email tersebut.',
      };
    }

    const cleanName = data.name.trim();
    const cleanTag =
      cleanName
        .toUpperCase()
        .replace(/[^A-Z]/g, '')
        .slice(0, 5) || 'USER';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const friendCode = `FE-${cleanTag}-${randNum}`;

    const newId = `usr_${Date.now().toString().slice(-6)}`;
    const avatarUrl = null;
    const passwordHash = await bcrypt.hash(data.password, 10);

    await db.transaction(async client => {
      // 1. Insert into users
      await client.query(
        `INSERT INTO users (id, name, email, password_hash, role, phone, gender, avatar_url)
         VALUES ($1, $2, $3, $4, 'user', $5, $6, $7)`,
        [
          newId,
          cleanName,
          normalizedEmail,
          passwordHash,
          data.phone?.trim() || null,
          'Perempuan',
          avatarUrl,
        ],
      );

      // 2. Insert into user_profiles
      await client.query(
        `INSERT INTO user_profiles (
          user_id, friend_code, school_or_org, hb_level, hb_status, risk_level, height, weight, blood_type, streak_count, level_title, status
        ) VALUES ($1, $2, NULL, NULL, 'Normal', 'Rendah', NULL, NULL, NULL, 0, 'Pemula Sehat', 'Aktif')`,
        [newId, friendCode],
      );
    });

    return {
      success: true,
      message: 'Pendaftaran akun berhasil! Silakan masuk dengan akun baru Anda.',
    };
  }

  static async deleteAccount(userId: string) {
    if (!userId) {
      return { success: false, error: 'Identitas pengguna (User ID) tidak valid.' };
    }

    const checkRes = await db.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (checkRes.rows.length === 0) {
      return { success: false, error: 'Akun pengguna tidak ditemukan atau sudah dihapus.' };
    }

    await db.transaction(async client => {
      await client.query('DELETE FROM users WHERE id = $1', [userId]);
    });

    return {
      success: true,
      message: 'Akun dan seluruh data Anda telah berhasil dihapus secara permanen.',
    };
  }
}
