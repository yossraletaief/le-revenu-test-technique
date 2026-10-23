import type { Core } from '@strapi/strapi';
import { syncPermissions } from './bootstrap/permissions';
import { seedDemoData } from './bootstrap/seed';

export default {
  register() {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncPermissions(strapi);
    await seedDemoData(strapi);
  },
};
