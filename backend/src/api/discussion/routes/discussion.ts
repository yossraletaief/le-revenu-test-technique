import { factories } from '@strapi/strapi';

/**
 * No update/delete in this scope: those routes are not registered at all.
 * The custom GET /discussions/slug/:slug lives in 01-custom-discussion.ts.
 */
export default factories.createCoreRouter('api::discussion.discussion', {
  only: ['find', 'findOne', 'create'],
  config: { create: { policies: ['global::is-authenticated'] } },
});
