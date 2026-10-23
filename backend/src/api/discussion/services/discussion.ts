import { randomBytes } from 'node:crypto';
import { factories } from '@strapi/strapi';
import { SLUG_MAX, slugify } from '../../../utils/slugify';
import { toDiscussionDetail, type DiscussionDetail, type RawDiscussionRow } from '../utils/detail';
import type { DiscussionInput } from '../utils/discussion-input';
import { excerpt, type ListQuery } from '../utils/list-query';

const UID = 'api::discussion.discussion';

export interface DiscussionListItem {
  documentId: string;
  title: string;
  slug: string;
  type: 'question' | 'discussion';
  excerpt: string;
  createdAt: string;
  author: { username: string } | null;
  category: { name: string; slug: string } | null;
  replyCount: number;
}

export interface DiscussionListResult {
  data: DiscussionListItem[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
}

export interface CreatedDiscussion { documentId: string; slug: string; title: string }
export type CreateResult = { ok: true; data: CreatedDiscussion } | { ok: false; errors: Record<string, string> };

export default factories.createCoreService(UID, ({ strapi }) => {
  const slugExists = async (slug: string): Promise<boolean> =>
    (await strapi.documents(UID).count({ filters: { slug: { $eq: slug } } })) > 0;

  /**
   * Readable slug from the title; on collision, a short random suffix ("…-a3f9c1").
   * The uid field is unique, so even a race between two identical titles cannot produce a duplicate URL.
   */
  async function uniqueSlug(title: string): Promise<string> {
    const base = slugify(title) || 'discussion';
    if (!(await slugExists(base))) return base;
    const stem = base.slice(0, SLUG_MAX - 7).replace(/-+$/, '');
    for (let attempt = 0; attempt < 5; attempt++) {
      const candidate = `${stem}-${randomBytes(3).toString('hex')}`;
      if (!(await slugExists(candidate))) return candidate;
    }
    throw new Error(`Could not generate a unique slug for "${base}"`);
  }

  return {
    /**
     * Paginated list for the home page.
     * 2 queries for the page + 1 grouped count(*) for replies: no N+1, replies are never loaded.
     */
    async list({ page, pageSize, sort, category }: ListQuery): Promise<DiscussionListResult> {
      const filters = category ? { category: { slug: { $eq: category } } } : {};
      const documents = strapi.documents(UID);

      const [rows, total] = await Promise.all([
        documents.findMany({
          filters,
          sort: { createdAt: sort },
          start: (page - 1) * pageSize,
          limit: pageSize,
          fields: ['title', 'slug', 'type', 'content', 'createdAt'],
          populate: {
            author: { fields: ['username'] },
            category: { fields: ['name', 'slug'] },
            replies: { count: true },
          },
        }),
        documents.count({ filters }),
      ]);

      const data = rows.map((row: any): DiscussionListItem => ({
        documentId: row.documentId,
        title: row.title,
        slug: row.slug,
        type: row.type,
        excerpt: excerpt(row.content ?? ''),
        createdAt: row.createdAt,
        author: row.author ? { username: row.author.username } : null,
        category: row.category ? { name: row.category.name, slug: row.category.slug } : null,
        replyCount: row.replies?.count ?? 0,
      }));

      return { data, meta: { pagination: { page, pageSize, pageCount: Math.ceil(total / pageSize), total } } };
    },

    /** One discussion with its category, author and replies (oldest first), in a single Document Service call. */
    async findDetail(where: { slug: string } | { documentId: string }): Promise<DiscussionDetail | null> {
      const filters = 'slug' in where ? { slug: { $eq: where.slug } } : { documentId: { $eq: where.documentId } };
      const row = await strapi.documents(UID).findFirst({
        filters,
        fields: ['title', 'slug', 'type', 'content', 'createdAt'],
        populate: {
          author: { fields: ['username'] },
          category: { fields: ['name', 'slug', 'description'] },
          replies: {
            fields: ['content', 'createdAt'],
            sort: { createdAt: 'asc' },
            populate: { author: { fields: ['username'] } },
          },
        },
      });
      return row ? toDiscussionDetail(row as unknown as RawDiscussionRow) : null;
    },

    /**
     * Creates a discussion for the authenticated user (`userId` comes from the verified JWT).
     * An unknown category is a validation error (400), not a 404: it is a field of the submitted form.
     */
    async createForUser(input: DiscussionInput, userId: number): Promise<CreateResult> {
      const category = await strapi.documents('api::category.category').findFirst({
        filters: { slug: { $eq: input.category } },
        fields: ['slug'],
      });
      if (!category) return { ok: false, errors: { category: "Cette catégorie n'existe pas." } };

      const user = await strapi.documents('plugin::users-permissions.user').findFirst({
        filters: { id: { $eq: userId } },
        fields: ['username'],
      });
      if (!user) throw new Error(`Authenticated user ${userId} not found`);

      const created = await strapi.documents(UID).create({
        data: {
          title: input.title,
          content: input.content,
          type: input.type,
          slug: await uniqueSlug(input.title),
          author: user.documentId,
          category: category.documentId,
        },
        fields: ['title', 'slug'],
      });

      return { ok: true, data: { documentId: created.documentId, slug: created.slug as string, title: created.title as string } };
    },
  };
});
