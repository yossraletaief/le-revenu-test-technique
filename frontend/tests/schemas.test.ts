import { describe, expect, it } from 'vitest';
import { discussionListResponseSchema } from '@/lib/strapi/schemas';

describe('discussionListResponseSchema', () => {
  it('rejects a payload where Strapi returned an unexpected shape', () => {
    const bad = { data: [{ title: 'x' }], meta: { pagination: { page: 1, pageSize: 10, pageCount: 1, total: 1 } } };
    expect(discussionListResponseSchema.safeParse(bad).success).toBe(false);
  });
});
