import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Garante que os caminhos funcionem em qualquer subpasta (cPanel/Apache)
  build: {
    outDir: 'dist',
    sourcemap: false,
    emptyOutDir: true,
    rollupOptions: {
        output: {
            manualChunks: {
                vendor: ['react', 'react-dom', 'react-router-dom'],
                maps: ['leaflet', 'react-leaflet'],
                db: ['@supabase/supabase-js']
            }
        }
    }
  },
  server: {
    port: 3000,
    host: true
  }
});