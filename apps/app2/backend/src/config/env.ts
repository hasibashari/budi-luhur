import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root folder with override
dotenv.config({ path: path.resolve(__dirname, '../../.env'), override: true });
dotenv.config({ override: true });

export const config = {
  port: parseInt(process.env.PORT || '4002', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5174',
  databaseUrl: process.env.APP2_DATABASE_URL || process.env.DATABASE_URL || '',
  jwtSecret: process.env.APP2_JWT_SECRET || process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GEMINI_API || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  vapidSubject: process.env.VAPID_SUBJECT || '',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
};

if (!config.databaseUrl) {
  console.warn('⚠️ WARNING: DATABASE_URL is not set in environment variables');
}

if (config.nodeEnv === 'production' && config.jwtSecret.length < 32) {
  throw new Error('APP2_JWT_SECRET or JWT_SECRET must be set to at least 32 characters in production');
}
