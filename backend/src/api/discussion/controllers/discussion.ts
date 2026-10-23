import { factories } from '@strapi/strapi';
import { parseListQuery } from '../utils/list-query';

export default factories.createCoreController('api::discussion.discussion', ({ strapi }) => ({
  /** GET /api/discussions — allowlisted query params only, 400 on invalid input. */
  async find(ctx) {
    const parsed = parseListQuery(ctx.query as Record<string, unknown>);
    if (!parsed.ok) {
      return ctx.badRequest('Paramètres de requête invalides', { errors: parsed.errors });
    }
    ctx.body = await strapi.service('api::discussion.discussion').list(parsed.value);
  },
}));
