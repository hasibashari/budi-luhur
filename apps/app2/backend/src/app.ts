import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';

export const app = express();

// Allowed origins for CORS (whitelisting for security with credentials)
const configuredOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

const allowedOrigins = new Set<string>([
  config.corsOrigin,
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:5170',
  'http://127.0.0.1:5170',
  'http://localhost:5173',
  'http://localhost:5175',
  ...configuredOrigins,
]);

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile app, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check explicit whitelist
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      // In non-production environments, permit local development hosts on any port
      if (config.nodeEnv !== 'production') {
        const isLocalHost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        if (isLocalHost) {
          return callback(null, true);
        }
      }

      // Reject untrusted origins by omitting Access-Control-Allow-Origin header
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.options('*', cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Prefix-stripping middleware for Vercel serverless rewrites
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url.startsWith('/app2')) {
    req.url = req.url.slice('/app2'.length) || '/';
  }
  if (req.url.startsWith('/api/app2')) {
    req.url = req.url.slice('/api/app2'.length) || '/';
  }
  if (req.url.startsWith('/api/index')) {
    req.url = req.url.slice('/api/index'.length) || '/';
  }
  next();
});

// Health Check
app.get(
  [
    '/',
    '/health',
    '/api',
    '/api/health',
    '/api/v1/health',
    '/v1/health',
    '/api/app2/api/v1/health',
    '/api/app2/health',
  ],
  (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Pilluna Backend API',
    });
  },
);

// Domain Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { scheduleRoutes } from './modules/schedules/schedule.routes.js';
import { consumptionRoutes } from './modules/consumption/consumption.routes.js';
import { notesRoutes } from './modules/notes/notes.routes.js';
import { articleRoutes } from './modules/articles/article.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';
import { notificationRoutes } from './modules/notifications/notification.routes.js';

app.use(['/api/v1/auth', '/v1/auth'], authRoutes);
app.use(['/api/v1/users', '/v1/users'], userRoutes);
app.use(['/api/v1/schedules', '/v1/schedules'], scheduleRoutes);
app.use(['/api/v1/consumption', '/v1/consumption'], consumptionRoutes);
app.use(['/api/v1/notes', '/v1/notes'], notesRoutes);
app.use(['/api/v1/articles', '/v1/articles'], articleRoutes);
app.use(['/api/v1/admin', '/v1/admin'], adminRoutes);
app.use(['/api/v1/notifications', '/v1/notifications'], notificationRoutes);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  const isProd = config.nodeEnv === 'production';
  res.status(500).json({
    success: false,
    error: isProd ? 'Terjadi kesalahan internal pada server.' : err.message || 'Internal Server Error',
  });
});

export default app;
