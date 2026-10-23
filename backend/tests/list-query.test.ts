import { describe, expect, it } from 'vitest';
import { excerpt, parseListQuery } from '../src/api/discussion/utils/list-query';

describe('parseListQuery', () => {
  it('applies defaults when no params are given', () => {
    expect(parseListQuery({})).toEqual({ ok: true, value: { page: 1, pageSize: 10, sort: 'desc' } });
  });

  it('accepts a valid category filter and ascending sort', () => {
    const r = parseListQuery({ category: 'assurance-vie', sort: 'date:asc', page: '2', pageSize: '5' });
    expect(r).toEqual({ ok: true, value: { page: 2, pageSize: 5, sort: 'asc', category: 'assurance-vie' } });
  });

  it('rejects a pageSize above the maximum', () => {
    const r = parseListQuery({ pageSize: '500' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toHaveProperty('pageSize');
  });

  it('rejects sort fields outside the allowlist', () => {
    const r = parseListQuery({ sort: 'title:asc' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors).toHaveProperty('sort');
  });

  it('rejects a category that is not a slug', () => {
    const r = parseListQuery({ category: "bourse'; DROP TABLE" });
    expect(r.ok).toBe(false);
  });

  it('rejects repeated params', () => {
    expect(parseListQuery({ page: ['1', '2'] }).ok).toBe(false);
  });
});

describe('excerpt', () => {
  it('keeps short text unchanged', () => {
    expect(excerpt('Bonjour à tous')).toBe('Bonjour à tous');
  });
  it('cuts long text on a word boundary and adds an ellipsis', () => {
    const r = excerpt('mot '.repeat(100), 20);
    expect(r.endsWith('…')).toBe(true);
    expect(r.length).toBeLessThanOrEqual(21);
  });
});
