import db, { pool } from '../config/database.js';

async function testConnection() {
  console.log('🔄 Mencoba menghubungkan ke PostgreSQL / Neon...');
  const startTime = Date.now();
  
  const result = await db.query(
    'SELECT NOW() as current_time, current_database() as database_name, version() as version'
  );
  
  const duration = Date.now() - startTime;
  console.log(`✅ Terhubung berhasil dalam ${duration}ms!`);
  console.log('📊 Detail Database:');
  console.log(`   - Nama Database: ${result.rows[0].database_name}`);
  console.log(`   - Waktu Server : ${result.rows[0].current_time}`);
  console.log(`   - Versi PG     : ${(result.rows[0].version as string).split(' ')[0]} ${(result.rows[0].version as string).split(' ')[1]}`);
}

testConnection()
  .then(async () => {
    if (typeof pool.end === 'function') {
      await pool.end();
    }
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('❌ Gagal terhubung ke database:', error);
    if (typeof pool.end === 'function') {
      await pool.end();
    }
    process.exit(1);
  });

