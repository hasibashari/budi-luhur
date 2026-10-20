import { app } from './app.js';
import { config } from './config/env.js';
import db from './config/database.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : config.port;

async function start() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id SERIAL PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      endpoint TEXT NOT NULL UNIQUE,
      subscription JSONB NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user ON push_subscriptions(user_id);
  `);
  app.listen(PORT, () => {
    console.log(`🚀 PRELUNA Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/v1/health`);
  });
}

start().catch(error => {
  console.error('❌ Failed to prepare push notification storage:', error);
  process.exit(1);
});

export default app;
