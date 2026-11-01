import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import db from '../config/database.js';

export interface TokenPayload {
  id: string;
  email: string;
  role: 'admin' | 'user';
  name: string;
  verificationStatus?: 'Pending' | 'Approved' | 'Rejected';
}

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Sesi login telah kedaluwarsa atau tidak valid.',
    });
    return;
  }
}

export function optionalAuthMiddleware(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = decoded;
  } catch {
    // For optional auth routes, gracefully continue without setting req.user
  }

  next();
}

export async function requireApprovedUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
    });
    return;
  }

  // Admin users always bypass patient verification requirement
  if (req.user.role === 'admin') {
    return next();
  }

  // If token explicitly has Pending or Rejected status, block immediately
  if (req.user.verificationStatus && req.user.verificationStatus !== 'Approved') {
    const isRejected = req.user.verificationStatus === 'Rejected';
    res.status(403).json({
      success: false,
      error: isRejected
        ? 'Pendaftaran akun Anda belum disetujui admin.'
        : 'Pendaftaran akun Anda masih menunggu proses verifikasi oleh admin.',
      code: isRejected ? 'ACCOUNT_REJECTED' : 'ACCOUNT_PENDING_VERIFICATION',
      verificationStatus: req.user.verificationStatus,
    });
    return;
  }

  try {
    const userRes = await db.query<{
      verification_status: string;
      rejection_reason: string | null;
    }>('SELECT verification_status, rejection_reason FROM users WHERE id = $1', [req.user.id]);

    if (userRes.rows.length > 0) {
      const status = userRes.rows[0].verification_status;
      const reason = userRes.rows[0].rejection_reason;
      if (status !== 'Approved') {
        res.status(403).json({
          success: false,
          error:
            status === 'Rejected'
              ? `Pendaftaran akun Anda belum disetujui admin. Alasan: ${reason || 'Silakan hubungi fasilitas kesehatan Anda.'}`
              : 'Pendaftaran akun Anda masih menunggu proses verifikasi oleh admin.',
          code: status === 'Rejected' ? 'ACCOUNT_REJECTED' : 'ACCOUNT_PENDING_VERIFICATION',
          verificationStatus: status,
          rejectionReason: reason,
        });
        return;
      }
    }
  } catch {
    // If DB check fails (e.g. offline unit test environment), fallback to token verificationStatus
    if (req.user.verificationStatus !== 'Approved') {
      res.status(403).json({
        success: false,
        error: 'Pendaftaran akun Anda masih menunggu proses verifikasi oleh admin.',
        code: 'ACCOUNT_PENDING_VERIFICATION',
        verificationStatus: 'Pending',
      });
      return;
    }
  }

  next();
}
