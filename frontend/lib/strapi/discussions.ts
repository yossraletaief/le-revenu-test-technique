import 'server-only';
import { strapiGet } from './client';
import { discussionListResponseSchema, type DiscussionListResponse } from './schemas';

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