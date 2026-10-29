import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/app3/',
  plugins: [react(), tailwindcss()],
  cacheDir: path.resolve(__dirname, '.vite'),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [
      { find: '@/src', replacement: path.resolve(__dirname, './src') },
      { find: '@', replacement: path.resolve(__dirname, './src') },
    ],
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/uploads': {
        target: 'http://localhost:4003',
        changeOrigin: true,
      },
    },
  },
});
