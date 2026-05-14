import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

// ua: Конфігурація для Vitest
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom', // ua: імітація браузерного середовища (window, document)
    globals: true, // ua: дозволяє використовувати describe, test, expect - без імпорту
    setupFiles: ['./src/tests/setupTests.ts'], // ua: reset store
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
