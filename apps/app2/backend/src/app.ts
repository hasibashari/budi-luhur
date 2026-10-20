import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile, curl) or any web origin with credentials
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  }),
);
app.options('*', cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
import { buddyRoutes } from './modules/buddy/buddy.routes.js';
import { articleRoutes } from './modules/articles/article.routes.js';
import { consultationRoutes } from './modules/consultation/consultation.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';

app.use(['/api/v1/auth', '/v1/auth'], authRoutes);
app.use(['/api/v1/users', '/v1/users'], userRoutes);
app.use(['/api/v1/schedules', '/v1/schedules'], scheduleRoutes);
app.use(['/api/v1/consumption', '/v1/consumption'], consumptionRoutes);
app.use(['/api/v1/notes', '/v1/notes'], notesRoutes);
app.use(['/api/v1/buddy', '/v1/buddy'], buddyRoutes);
app.use(['/api/v1/articles', '/v1/articles'], articleRoutes);
app.use(['/api/v1/consultation', '/v1/consultation'], consultationRoutes);
app.use(['/api/v1/admin', '/v1/admin'], adminRoutes);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
