import type { Core } from '@strapi/strapi';

/** Demo users only: turn off public sign-up (POST /api/auth/local/register). Idempotent. */
export async function disablePublicRegistration(strapi: Core.Strapi): Promise<void> {
  const store = strapi.store({ type: 'plugin', name: 'users-permissions' });
  const advanced = (await store.get({ key: 'advanced' })) as Record<string, unknown> | null;
  if (advanced && advanced.allow_register !== false) {
    await store.set({ key: 'advanced', value: { ...advanced, allow_register: false } });
    strapi.log.info('[auth] public registration disabled');
  }
}
