import { z } from 'zod';

/** Runtime contracts of the Strapi API. TS types are inferred from them: one source of truth. */
export const categorySchema = z.object({
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable().optional(),
});

export const categoriesResponseSchema = z.object({ data: z.array(categorySchema) });

export const discussionTypeSchema = z.enum(['question', 'discussion']);

export const discussionListItemSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
  type: discussionTypeSchema,
  excerpt: z.string(),
  createdAt: z.string(),
  author: z.object({ username: z.string() }).nullable(),
  category: z.object({ name: z.string(), slug: z.string() }).nullable(),
  replyCount: z.number().int().nonnegative(),
});

export const paginationSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  pageCount: z.number().int(),
  total: z.number().int(),
});

export const discussionListResponseSchema = z.object({
  data: z.array(discussionListItemSchema),
  meta: z.object({ pagination: paginationSchema }),
});

export type Category = z.infer<typeof categorySchema>;
export type DiscussionType = z.infer<typeof discussionTypeSchema>;
export type DiscussionListItem = z.infer<typeof discussionListItemSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type DiscussionListResponse = z.infer<typeof discussionListResponseSchema>;
