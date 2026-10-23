import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));
const codeDir = existsSync(`${root}src/app`) ? `${root}src` : root;

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': codeDir } },
  test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'], include: ['tests/**/*.test.{ts,tsx}'] },
});
