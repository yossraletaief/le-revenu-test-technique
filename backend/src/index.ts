import type { Core } from '@strapi/strapi';
import { disablePublicRegistration } from './bootstrap/auth-settings';
import { syncPermissions } from './bootstrap/permissions';
import { seedDemoData } from './bootstrap/seed';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncPermissions(strapi);
    await disablePublicRegistration(strapi);
    await seedDemoData(strapi);
  },
};
