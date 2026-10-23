/**
 * Custom routes, loaded alongside the core router.
 * No conflict with core `GET /discussions/:id`, which only matches a single path segment.
 */
export default {
  routes: [
    {
      method: 'GET',
      path: '/discussions/slug/:slug',
      handler: 'api::discussion.discussion.findBySlug',
      config: { policies: [] },
    },
  ],
};
