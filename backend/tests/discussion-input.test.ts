import { describe, expect, it } from 'vitest';
import { parseDiscussionInput } from '../src/api/discussion/utils/discussion-input';

const valid = { title: 'Faut-il ouvrir un PER à 45 ans ?', content: 'Mon contexte…', type: 'question', category: 'retraite' };

describe('parseDiscussionInput', () => {
  it('accepts a valid discussion and normalizes the title', () => {
    const r = parseDiscussionInput({ data: { ...valid, title: '  Faut-il   ouvrir un PER à 45 ans ?  ' } });
    expect(r).toEqual({ ok: true, value: valid });
  });

  it('rejects a title under 10 characters, even padded with spaces', () => {
    for (const title of ['Court', 'a         b', '']) {
      const r = parseDiscussionInput({ data: { ...valid, title } });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors.title).toMatch(/10 caractères/);
    }
  });

  it('requires content, a known type and a category slug', () => {
    const r = parseDiscussionInput({ data: { title: valid.title, content: '   ', type: 'poll', category: 'Pas un slug' } });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(['category', 'content', 'type']);
  });

  it('never keeps author or slug from the client', () => {
    const r = parseDiscussionInput({ data: { ...valid, author: 1, slug: 'mon-slug' } });
    expect(r.ok && r.value).not.toHaveProperty('author');
    expect(r.ok && r.value).not.toHaveProperty('slug');
  });
});
