import type { IncomingMessage, ServerResponse } from 'http';
import app from '../apps/app3/backend/src/app.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Strip /api/app3 prefix so Express internal routes (/api/v1/...) match seamlessly
  if (req.url && req.url.startsWith('/api/app3')) {
    req.url = req.url.slice('/api/app3'.length) || '/';
  }
  return app(req, res);
}
