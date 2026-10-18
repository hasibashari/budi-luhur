import type { IncomingMessage, ServerResponse } from 'http';
import app from '../apps/app2/backend/src/app.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Strip /api/app2 prefix so Express internal routes (/api/v1/...) match seamlessly
  if (req.url && req.url.startsWith('/api/app2')) {
    req.url = req.url.slice('/api/app2'.length) || '/';
  }
  return app(req, res);
}
