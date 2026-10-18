import type { IncomingMessage, ServerResponse } from 'http';
import app from '../apps/app1/backend/src/app.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  // Strip /api/app1 prefix so Express internal routes (/api/v1/...) match seamlessly
  if (req.url && req.url.startsWith('/api/app1')) {
    req.url = req.url.slice('/api/app1'.length) || '/';
  }
  return app(req, res);
}
