import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    pool: 'forks',          // Strapi is a heavy CommonJS app: run it in a real child process
    fileParallelism: false, // one Strapi instance at a time
    testTimeout: 30_000,
    hookTimeout: 180_000,   // first boot compiles TypeScript and runs migrations
  },
});
