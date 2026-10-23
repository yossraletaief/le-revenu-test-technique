import 'server-only';
import { StrapiError, strapiGet } from './client';
import { DiscussionDetail, discussionDetailResponseSchema, discussionListResponseSchema, type DiscussionListResponse } from './schemas';

import { SortOrder } from '../search-params';
export interface DiscussionListParams {
  page: number;
  pageSize: number;
  sort: SortOrder;
  category?: string;
}

/** Calls our custom GET /api/discussions (pagination, sort and filter are done by Strapi). */
export function getDiscussions(params: DiscussionListParams): Promise<DiscussionListResponse> {
  return strapiGet('/discussions', discussionListResponseSchema, {
    searchParams: { page: params.page, pageSize: params.pageSize, sort: params.sort, category: params.category },
    revalidate: 30,
    tags: ['discussions'],
  });
}
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Detail page data. Returns null for an unknown or malformed slug (→ the page calls notFound()). */
export async function getDiscussionBySlug(slug: string): Promise<DiscussionDetail | null> {
  if (slug.length > 80 || !SLUG_RE.test(slug)) return null;
  try {
    const res = await strapiGet(`/discussions/slug/${encodeURIComponent(slug)}`, discussionDetailResponseSchema, {
      revalidate: 30,
      tags: ['discussions', `discussion:${slug}`], // the reply action (next branch) will revalidate this tag
    });
    return res.data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error; // anything else → error.tsx
  }
}
