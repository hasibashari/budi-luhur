import { app } from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Template Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/v1/health`);
  });
}

export default app;
