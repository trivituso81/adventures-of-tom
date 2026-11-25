import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built output goes to ../../script-studio (served at /script-studio/). reference-vault/ lives there and is never touched.
export default defineConfig({
  plugins: [react()],
  base: './',
  build: { outDir: '../../script-studio', emptyOutDir: false, assetsDir: 'assets' },
});
