import type { IncomingMessage, ServerResponse } from 'http';
import app from '../backend/src/app.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Di Vercel, x-matched-path adalah source path asli dari request (sebelum rewrite),
  // bukan destination. Kita gunakan ini sebagai req.url agar Express bisa routing dengan benar.
  // x-vercel-forwarded-for dan x-real-ip tersedia untuk keperluan IP detection.
  const originalPath = req.headers['x-matched-path'] as string | undefined;

  // Hanya gunakan x-matched-path jika mengandung path API yang valid (bukan /api/index)
  // dan bukan sama dengan req.url saat ini.
  if (
    originalPath &&
    originalPath !== '/api/index' &&
    !originalPath.startsWith('/api/index') &&
    req.url !== originalPath
  ) {
    req.url = originalPath;
  }

  return app(req, res);
}
