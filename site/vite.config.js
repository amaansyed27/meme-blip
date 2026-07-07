import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  root: 'site',
  plugins: [react()],
  publicDir: path.resolve(process.cwd(), 'assets'),
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
