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

export const publicAuthorSchema = z.object({ username: z.string() }).nullable();

export const replySchema = z.object({
  documentId: z.string(),
  content: z.string(),
  createdAt: z.string(),
  author: publicAuthorSchema,
});

export const discussionDetailSchema = z.object({
  documentId: z.string(),
  title: z.string(),
  slug: z.string(),
  type: discussionTypeSchema,
  content: z.string(),
  createdAt: z.string(),
  lastActivityAt: z.string(),
  author: publicAuthorSchema,
  category: z.object({ name: z.string(), slug: z.string(), description: z.string().nullable() }).nullable(),
  replyCount: z.number().int().nonnegative(),
  replies: z.array(replySchema),
});

export const discussionDetailResponseSchema = z.object({ data: discussionDetailSchema });

export type Reply = z.infer<typeof replySchema>;
export type DiscussionDetail = z.infer<typeof discussionDetailSchema>;

/** /api/users/me returns the email too: zod keeps only what we declare, so it never goes further. */
export const meSchema = z.object({ username: z.string() });
export const authResponseSchema = z.object({ jwt: z.string(), user: meSchema });

export const replyCreatedResponseSchema = z.object({
  data: replySchema.extend({ discussion: z.object({ documentId: z.string(), slug: z.string() }) }),
});

export type SessionUser = z.infer<typeof meSchema>;
