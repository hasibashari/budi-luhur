import { app } from './app.js';
import { config } from './config/env.js';
import { ScheduleReminderService } from './modules/schedules/scheduleReminder.service.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : config.port;

async function start() {
  // Pengingat jadwal harian (aktif untuk proses long-running; pada Vercel
  // serverless pengingat dijalankan oleh hook di sisi frontend).
  ScheduleReminderService.startScheduler();

  app.listen(PORT, () => {
    console.log(`🚀 Pilluna Backend running on http://localhost:${PORT}`);
    console.log(`📡 Health check available at http://localhost:${PORT}/api/v1/health`);
  });
}

start().catch(error => {
  console.error('❌ Failed to start Pilluna backend:', error);
  process.exit(1);
});

export default app;
