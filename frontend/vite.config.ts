import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()] as unknown as PluginOption[],
  cacheDir: path.resolve(__dirname, '.vite'),
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
  },
  server: {
    port: 5170,
    strictPort: true,
    proxy: {
      '/app1': {
        target: 'http://localhost:5173',
        changeOrigin: true,
      },
      '/app2': {
        target: 'http://localhost:5174',
        changeOrigin: true,
      },
      '/app3': {
        target: 'http://localhost:5175',
        changeOrigin: true,
      },
    },
  },
});
