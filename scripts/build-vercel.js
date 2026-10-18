#!/usr/bin/env node

/**
 * Script Perakitan Monorepo Build untuk Vercel Deployment
 * STIKes Budi Luhur Ecosystem (Root Portal + 3 Sub-Aplikasi Mandiri)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'dist');

function run(command, envOverrides = {}) {
  console.log(`\n\x1b[36m▶ Menjalankan:\x1b[0m ${command}`);
  execSync(command, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    env: { ...process.env, ...envOverrides },
  });
}

function main() {
  console.log('\n======================================================');
  console.log('🏛️  MEMULAI PROSES BUILD MONOREPO BUDI LUHUR (VERCEL) ');
  console.log('======================================================\n');

  const startTime = Date.now();

  // 1. Build Root Portal
  console.log('\x1b[33m[1/4] Mengompilasi Root Portal (frontend)... \x1b[0m');
  run('npm --prefix frontend run build');

  // 2. Build Sub-Aplikasi 1 (FEMORY)
  console.log('\n\x1b[33m[2/4] Mengompilasi App 1 (FEMORY - subpath /app1/)... \x1b[0m');
  run('npm --prefix apps/app1/frontend run build', { VITE_BASE_PATH: '/app1/' });

  // 3. Build Sub-Aplikasi 2 (Pilluna)
  console.log('\n\x1b[33m[3/4] Mengompilasi App 2 (Pilluna - subpath /app2/)... \x1b[0m');
  run('npm --prefix apps/app2/frontend run build', { VITE_BASE_PATH: '/app2/' });

  // 4. Build Sub-Aplikasi 3 (PRELUNA)
  console.log('\n\x1b[33m[4/4] Mengompilasi App 3 (PRELUNA - subpath /app3/)... \x1b[0m');
  run('npm --prefix apps/app3/frontend run build', { VITE_BASE_PATH: '/app3/' });

  // 5. Assembling output ke folder dist/ terpadu
  console.log('\n\x1b[35m[Assembling] Menyatukan seluruh output ke root dist/... \x1b[0m');
  if (fs.existsSync(OUTPUT_DIR)) {
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  // Copy Root Portal
  const portalDist = path.resolve(ROOT_DIR, 'frontend/dist');
  fs.cpSync(portalDist, OUTPUT_DIR, { recursive: true });
  console.log('  ✓ Portal Utama disalin ke dist/');

  // Copy App 1
  const app1Dist = path.resolve(ROOT_DIR, 'apps/app1/frontend/dist');
  const app1Target = path.resolve(OUTPUT_DIR, 'app1');
  fs.cpSync(app1Dist, app1Target, { recursive: true });
  console.log('  ✓ App 1 (FEMORY) disalin ke dist/app1/');

  // Copy App 2
  const app2Dist = path.resolve(ROOT_DIR, 'apps/app2/frontend/dist');
  const app2Target = path.resolve(OUTPUT_DIR, 'app2');
  fs.cpSync(app2Dist, app2Target, { recursive: true });
  console.log('  ✓ App 2 (Pilluna) disalin ke dist/app2/');

  // Copy App 3
  const app3Dist = path.resolve(ROOT_DIR, 'apps/app3/frontend/dist');
  const app3Target = path.resolve(OUTPUT_DIR, 'app3');
  fs.cpSync(app3Dist, app3Target, { recursive: true });
  console.log('  ✓ App 3 (PRELUNA) disalin ke dist/app3/');

  // Pastikan service worker hanya ada 1 di root dist/sw.js
  ['app1/sw.js', 'app2/sw.js', 'app3/sw.js'].forEach((swPath) => {
    const fullSwPath = path.resolve(OUTPUT_DIR, swPath);
    if (fs.existsSync(fullSwPath)) {
      fs.rmSync(fullSwPath);
    }
  });

  // 6. Validasi file penting
  const requiredFiles = [
    'index.html',
    'manifest.webmanifest',
    'sw.js',
    'offline.html',
    'app1/index.html',
    'app2/index.html',
    'app3/index.html',
  ];

  console.log('\n\x1b[32m[Validasi File Kunci]\x1b[0m');
  for (const file of requiredFiles) {
    const fullPath = path.resolve(OUTPUT_DIR, file);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File wajib hilang dalam bundle: ${file}`);
    }
    console.log(`  ✓ ${file} terverifikasi.`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n======================================================');
  console.log(`✨  DISTRIBUSI MONOREPO SELESAI DALAM ${duration} DETIK!`);
  console.log(`📁  Output siap dideploy: ${OUTPUT_DIR}`);
  console.log('======================================================\n');
}

try {
  main();
} catch (error) {
  console.error('\n❌ Terjadi kesalahan saat proses build:', error.message);
  process.exit(1);
}
