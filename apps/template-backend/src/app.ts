import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env.js';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: config.corsOrigin === '*' ? '*' : config.corsOrigin.split(','),
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FEMORY Backend Template',
  });
});

// Domain Routes
import { authRoutes } from './modules/auth/auth.routes.js';
import { userRoutes } from './modules/users/user.routes.js';
import { scheduleRoutes } from './modules/schedules/schedule.routes.js';
import { consumptionRoutes } from './modules/consumption/consumption.routes.js';
import { buddyRoutes } from './modules/buddy/buddy.routes.js';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/consumption', consumptionRoutes);
app.use('/api/v1/buddy', buddyRoutes);

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
