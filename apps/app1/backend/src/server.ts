import { app } from './app.js';
import { config } from './config/env.js';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 FEMORY Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check available at http://localhost:${PORT}/api/v1/health`);
});
