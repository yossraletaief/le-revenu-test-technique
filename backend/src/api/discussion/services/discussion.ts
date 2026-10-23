import { factories } from '@strapi/strapi';
import { excerpt, type ListQuery } from '../utils/list-query';

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

export default factories.createCoreService('api::discussion.discussion', ({ strapi }) => ({
  /**
   * Paginated list for the home page.
   * 2 queries for the page + 1 grouped count(*) for replies: no N+1, replies are never loaded.
   */
  async list({ page, pageSize, sort, category }: ListQuery): Promise<DiscussionListResult> {
    const filters = category ? { category: { slug: { $eq: category } } } : {};
    const documents = strapi.documents('api::discussion.discussion');

    const [rows, total] = await Promise.all([
      documents.findMany({
        filters,
        sort: { createdAt: sort },
        start: (page - 1) * pageSize,
        limit: pageSize,
        fields: ['title', 'slug', 'type', 'content', 'createdAt'],
        populate: {
          author: { fields: ['username'] }, // never the email
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
}));
