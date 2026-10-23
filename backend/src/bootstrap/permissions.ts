import type { Core } from '@strapi/strapi';

/**
 * Replies are NOT readable on their own (/api/replies): they are only served inside a discussion
 * through findBySlug/findOne, which return the author's username and nothing else.
 */
const READ = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::discussion.discussion.find',
  'api::discussion.discussion.findOne',
  'api::discussion.discussion.findBySlug',
];

const ROLES: Record<'public' | 'authenticated', string[]> = {
  public: READ,
  authenticated: [...READ, 'api::reply.reply.create'],
};

/**
 * Makes the role's api:: permissions match the allowlist exactly.
 * Idempotent: safe to run on every boot. Plugin permissions (login, /users/me) are left untouched.
 */
async function syncRole(strapi: Core.Strapi, type: keyof typeof ROLES): Promise<void> {
  const allowed = ROLES[type];
  const role = await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type } });
  if (!role) throw new Error(`[permissions] role "${type}" not found`);

  const permissionQuery = strapi.db.query('plugin::users-permissions.permission');
  const existing: Array<{ id: number; action: string }> = await permissionQuery.findMany({
    where: { role: role.id, action: { $startsWith: 'api::' } },
  });

  const current = new Set(existing.map((p) => p.action));
  for (const p of existing) {
    if (!allowed.includes(p.action)) await permissionQuery.delete({ where: { id: p.id } });
  }
  for (const action of allowed) {
    if (!current.has(action)) await permissionQuery.create({ data: { action, role: role.id } });
  }
  strapi.log.info(`[permissions] ${type}: ${allowed.length} api permissions in sync`);
}

export async function syncPermissions(strapi: Core.Strapi): Promise<void> {
  await syncRole(strapi, 'public');
  await syncRole(strapi, 'authenticated');
}
