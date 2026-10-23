/**
 * Route-level guard, on top of role permissions (defense in depth):
 * even if someone ticked "create" for Public in the admin, anonymous requests still stop here.
 * Returning false makes Strapi answer 403.
 */
export default (policyContext: { state: { user?: unknown } }): boolean => Boolean(policyContext.state.user);
