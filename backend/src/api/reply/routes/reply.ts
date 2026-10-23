import { factories } from '@strapi/strapi';

/**
 * Only POST /api/replies exists. Replies are read through the discussion endpoints,
 * so find/findOne/update/delete routes are not even registered.
 */
export default factories.createCoreRouter('api::reply.reply', {
  only: ['create'],
  config: { create: { policies: ['global::is-authenticated'] } },
});
