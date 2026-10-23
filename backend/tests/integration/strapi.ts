import { compileStrapi, createStrapi, type Core } from '@strapi/strapi';

export const TEST_PASSWORD = process.env.TEST_SEED_PASSWORD ?? 'demo-test-password';
let instance: Core.Strapi | undefined;

/** Boots Strapi once, against the test database, with demo data. */
export async function setupStrapi(): Promise<Core.Strapi> {
  if (instance) return instance;
  // Set before Strapi loads .env: dotenv never overrides existing variables.
  process.env.DATABASE_NAME = process.env.TEST_DATABASE_NAME ?? 'lerevenu_test';
  process.env.SEED_DEMO = 'true';
  process.env.SEED_DEMO_PASSWORD = TEST_PASSWORD;

  const appContext = await compileStrapi();
  instance = await createStrapi(appContext).load();
  instance.server.mount();
  return instance;
}

export async function teardownStrapi(): Promise<void> {
  await instance?.destroy();
  instance = undefined;
}
