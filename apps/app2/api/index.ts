import type { IncomingMessage, ServerResponse } from 'http';
import app from '../backend/src/app.js';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  const matchedPath =
    (req.headers['x-matched-path'] as string | undefined) ||
    (req.headers['x-invoke-path'] as string | undefined);
  if (matchedPath && req.url !== matchedPath) {
    req.url = matchedPath;
  }
  return app(req, res);
}
