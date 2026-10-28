import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from '../../config/database.js';
import { config } from '../../config/env.js';
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  ForgotPasswordDto,
  ResetPasswordDto,
  UserDbRow,
  UserRole,
} from './auth.types.js';

export class AuthService {
  static async login(credentials: LoginCredentials) {
    const normalizedEmail = (credentials.email || '').trim().toLowerCase();
    const password = credentials.password || '';

    if (!normalizedEmail || !password) {
      return { success: false, error: 'Email dan password wajib diisi.' };
    }

    try {
      const res = await db.query<UserDbRow>(
        `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.avatar_url, u.gender,
                p.friend_code, p.school_or_org, p.hb_level, p.streak_count
         FROM users u
         LEFT JOIN user_profiles p ON u.id = p.user_id
         WHERE lower(u.email) = $1`,
        [normalizedEmail],
      );
      const row = res.rows[0];
      if (!row || !row.password_hash || !(await bcrypt.compare(password, row.password_hash))) {
        return { success: false, error: 'Email atau password salah.' };
      }

      return AuthService.createLoginResult(row);
    } catch (dbErr) {
      console.error('Database query during login failed:', dbErr);
      return { success: false, error: 'Login tidak dapat diproses saat ini.' };
    }
  }

  private static async createLoginResult(row: UserDbRow) {
    // App 3 (TEMANI) tidak lagi membuat jadwal otomatis saat setup. Setup awal
    // dianggap selesai ketika profil pranikah (faskes rujukan) sudah tersimpan,
    // sehingga penjadwalan TT tidak boleh menjadi syarat kelengkapan profil.
    const hasSchool = Boolean(row.school_or_org && row.school_or_org.trim());
    const isProfileComplete = row.role === 'admin' || hasSchool;

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

  /**
   * Revalidasi sesi saat aplikasi dimuat ulang. Dipakai frontend agar flag
   * `isProfileComplete` tidak pernah memakai nilai lama dari localStorage.
   */
  static async getSession(userId: string) {
    const res = await db.query<UserDbRow>(
      `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.phone, u.avatar_url, u.gender,
              p.friend_code, p.school_or_org, p.hb_level, p.streak_count
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [userId],
    );
    const row = res.rows[0];
    if (!row) {
      return { success: false, error: 'Sesi tidak valid.' };
    }
    const result = await AuthService.createLoginResult(row);
    return {
      success: true,
      user: result.user,
      isProfileComplete: result.isProfileComplete,
      redirectTo: result.redirectTo,
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

  /**
   * Pengecekan alamat email untuk pemulihan kata sandi tanpa OTP/email verifikasi.
   * Menghasilkan token pemulihan sementara (15 menit) yang terlindungi hash fingerprint
   * agar tidak dapat digunakan berulang kali setelah kata sandi berhasil diubah.
   */
  static async forgotPassword(dto: ForgotPasswordDto) {
    const rawEmail = (dto.email || '').trim().toLowerCase();
    if (!rawEmail) {
      return { success: false, error: 'Silakan masukkan alamat email Anda.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(rawEmail)) {
      return { success: false, error: 'Format alamat email tidak valid (contoh: nama@gmail.com).' };
    }

    try {
      const res = await db.query<UserDbRow>(
        `SELECT id, name, email, password_hash FROM users WHERE lower(email) = $1`,
        [rawEmail],
      );
      const user = res.rows[0];
      if (!user) {
        return {
          success: false,
          error: 'Alamat email tidak terdaftar dalam sistem. Pastikan akun Anda sudah terdaftar.',
        };
      }

      // Hash fingerprint untuk token sekali pakai (single-use token protection)
      const tokenVersion = user.password_hash ? user.password_hash.slice(-10) : 'none';

      const resetToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          purpose: 'password-reset',
          tokenVersion,
        },
        config.jwtSecret,
        { expiresIn: '15m' } as jwt.SignOptions,
      );

      return {
        success: true,
        message: 'Alamat email terverifikasi. Silakan masukkan kata sandi baru Anda.',
        resetToken,
        email: user.email,
      };
    } catch (dbErr) {
      console.error('Database query during forgotPassword failed:', dbErr);
      return { success: false, error: 'Gagal memverifikasi email pemulihan saat ini.' };
    }
  }

  /**
   * Simpan kata sandi baru menggunakan token pemulihan sekali pakai.
   * Memvalidasi token, tokenVersion, mencocokkan konfirmasi, dan menyimpan hash bcrypt baru.
   */
  static async resetPassword(data: ResetPasswordDto) {
    const resetToken = (data.resetToken || '').trim();
    const newPassword = data.newPassword || '';
    const confirmPassword = data.confirmPassword;

    if (!resetToken) {
      return {
        success: false,
        error: 'Sesi pemulihan tidak valid atau tidak ditemukan. Silakan ulangi langkah pemulihan.',
      };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Kata sandi baru minimal 6 karakter.' };
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return { success: false, error: 'Konfirmasi kata sandi tidak cocok.' };
    }

    let decoded: any;
    try {
      decoded = jwt.verify(resetToken, config.jwtSecret);
    } catch {
      return {
        success: false,
        error: 'Sesi pemulihan telah kedaluwarsa atau tidak sah. Silakan ajukan pemulihan kata sandi kembali.',
      };
    }

    if (!decoded || decoded.purpose !== 'password-reset' || !decoded.id) {
      return {
        success: false,
        error: 'Otorisasi pemulihan tidak sah.',
      };
    }

    try {
      const res = await db.query<UserDbRow>(
        `SELECT id, email, password_hash FROM users WHERE id = $1`,
        [decoded.id],
      );
      const user = res.rows[0];
      if (!user) {
        return {
          success: false,
          error: 'Akun pengguna pemohon pemulihan tidak ditemukan.',
        };
      }

      // Validasi single-use: jika password_hash sudah berubah, tokenVersion tidak lagi cocok
      const currentVersion = user.password_hash ? user.password_hash.slice(-10) : 'none';
      if (decoded.tokenVersion !== currentVersion) {
        return {
          success: false,
          error: 'Sesi pemulihan ini sudah pernah digunakan atau tidak lagi berlaku. Silakan ajukan pemulihan baru.',
        };
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);

      await db.query(
        `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [passwordHash, user.id],
      );

      return {
        success: true,
        message: 'Kata sandi berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.',
      };
    } catch (dbErr) {
      console.error('Database query during resetPassword failed:', dbErr);
      return { success: false, error: 'Gagal memperbarui kata sandi di sistem.' };
    }
  }
}
