import { describe, expect, it } from 'vitest';
import { homeHref, parseHomeSearchParams } from '@/lib/search-params';

describe('parseHomeSearchParams', () => {
  it('uses defaults for an empty URL', () => {
    expect(parseHomeSearchParams({})).toEqual({ page: 1, sort: 'date:desc' });
  });
  it('keeps valid values', () => {
    expect(parseHomeSearchParams({ page: '2', sort: 'date:asc', category: 'assurance-vie' }))
      .toEqual({ page: 2, sort: 'date:asc', category: 'assurance-vie' });
  });
  it('falls back to defaults on invalid values instead of failing', () => {
    expect(parseHomeSearchParams({ page: '-3', sort: 'title:asc', category: '<script>' }))
      .toEqual({ page: 1, sort: 'date:desc' });
  });
});

describe('homeHref', () => {
  it('omits default values', () => {
    expect(homeHref({ page: 1, sort: 'date:desc' })).toBe('/');
  });
  it('builds a filtered, sorted, paginated URL', () => {
    expect(homeHref({ category: 'bourse', sort: 'date:asc', page: 2 })).toBe('/?category=bourse&sort=date%3Aasc&page=2');
  });
});
