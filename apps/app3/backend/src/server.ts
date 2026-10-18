import { app } from './app.js';
import { config } from './config/env.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : config.port;

app.listen(PORT, () => {
  console.log(`🚀 PRELUNA Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/v1/health`);
});

export default app;
