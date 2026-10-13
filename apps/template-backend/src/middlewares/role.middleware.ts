import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

export function roleMiddleware(allowedRoles: ('admin' | 'user')[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Akses ditolak: pengguna belum diautentikasi.',
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: `Akses dilarang: peran '${req.user.role}' tidak memiliki izin untuk rute ini.`,
      });
      return;
    }

    next();
  };
}
