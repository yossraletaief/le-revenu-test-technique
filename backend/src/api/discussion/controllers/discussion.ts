import { factories } from '@strapi/strapi';
import { isSlug } from '../../../utils/slugify';
import { parseDiscussionInput } from '../utils/discussion-input';
import { parseListQuery } from '../utils/list-query';

const DOCUMENT_ID_RE = /^[a-z0-9]{1,64}$/;

export default factories.createCoreController('api::discussion.discussion', ({ strapi }) => ({
  /** GET /api/discussions: allowlisted query params only, 400 on invalid input. */
  async find(ctx) {
    const parsed = parseListQuery(ctx.query as Record<string, unknown>);
    if (!parsed.ok) return ctx.badRequest('Paramètres de requête invalides', { errors: parsed.errors });
    ctx.body = await strapi.service('api::discussion.discussion').list(parsed.value);
  },

  /** GET /api/discussions/slug/:slug: the public detail endpoint used by the frontend. */
  async findBySlug(ctx) {
    const { slug } = ctx.params;
    if (!isSlug(slug)) return ctx.badRequest('Slug invalide');
    const data = await strapi.service('api::discussion.discussion').findDetail({ slug });
    if (!data) return ctx.notFound('Discussion introuvable');
    ctx.body = { data };
  },

  /** GET /api/discussions/:id: same safe shape, so ?populate=… can no longer expose user fields. */
  async findOne(ctx) {
    const { id } = ctx.params;
    if (typeof id !== 'string' || !DOCUMENT_ID_RE.test(id)) return ctx.badRequest('Identifiant invalide');
    const data = await strapi.service('api::discussion.discussion').findDetail({ documentId: id });
    if (!data) return ctx.notFound('Discussion introuvable');
    ctx.body = { data };
  },

  /** POST /api/discussions: 401 without a user, 400 with per-field errors, 201 with the new slug. */
  async create(ctx) {
    const user = ctx.state.user as { id: number } | undefined;
    if (!user) return ctx.unauthorized('Authentification requise');

    const parsed = parseDiscussionInput(ctx.request.body);
    if (!parsed.ok) return ctx.badRequest('Discussion invalide', { errors: parsed.errors });

    const result = await strapi.service('api::discussion.discussion').createForUser(parsed.value, user.id);
    if (!result.ok) return ctx.badRequest('Discussion invalide', { errors: result.errors });

    ctx.status = 201;
    ctx.body = { data: result.data };
  },
}));
