import { factories } from '@strapi/strapi';
import { parseReplyInput } from '../utils/reply-input';

export default factories.createCoreController('api::reply.reply', ({ strapi }) => ({
  /** POST /api/replies: 401 without a user, 400 on invalid input, 404 unknown discussion, 201 on success. */
  async create(ctx) {
    const user = ctx.state.user as { id: number } | undefined;
    if (!user) return ctx.unauthorized('Authentification requise');

    const parsed = parseReplyInput(ctx.request.body);
    if (!parsed.ok) return ctx.badRequest('Réponse invalide', { errors: parsed.errors });

    const reply = await strapi.service('api::reply.reply').createForUser(parsed.value, user.id);
    if (!reply) return ctx.notFound('Discussion introuvable');

    ctx.status = 201;
    ctx.body = { data: reply };
  },
}));
