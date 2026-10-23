import { describe, expect, it } from 'vitest';
import { toDiscussionDetail, type RawDiscussionRow } from '../src/api/discussion/utils/detail';
import { isSlug, slugify } from '../src/utils/slugify';

const row: RawDiscussionRow = {
  documentId: 'd1', title: 'Ouvrir un PEA avec 5 000 €', slug: 'ouvrir-un-pea-avec-5-000', type: 'question',
  content: 'Bonjour', createdAt: '2026-10-20T10:00:00.000Z',
  author: { username: 'Thomas_PEA', email: 'thomas@demo.local' },
  category: { name: 'Bourse & actions', slug: 'bourse' },
  replies: [
    { documentId: 'r1', content: 'Premier', createdAt: '2026-10-20T11:00:00.000Z', author: { username: 'Vincent_ETF', email: 'v@demo.local' } },
    { documentId: 'r2', content: 'Second', createdAt: new Date('2026-10-20T12:00:00.000Z'), author: null },
  ],
};

describe('toDiscussionDetail', () => {
  it('never exposes fields other than the username for authors', () => {
    expect(JSON.stringify(toDiscussionDetail(row))).not.toContain('@demo.local');
  });

  it('counts replies and uses the last reply as last activity', () => {
    const d = toDiscussionDetail(row);
    expect(d.replyCount).toBe(2);
    expect(d.lastActivityAt).toBe('2026-10-20T12:00:00.000Z');
  });

  it('falls back to the discussion date when there is no reply', () => {
    const d = toDiscussionDetail({ ...row, replies: [] });
    expect(d.replyCount).toBe(0);
    expect(d.lastActivityAt).toBe('2026-10-20T10:00:00.000Z');
  });

  it('keeps a reply whose author was deleted, with author null', () => {
    expect(toDiscussionDetail(row).replies[1]?.author).toBeNull();
  });
});

describe('slugify / isSlug', () => {
  it('produces a valid slug without accents', () => {
    expect(slugify('Épargne : quel placement ?')).toBe('epargne-quel-placement');
  });

  it('never ends with a dash after truncation', () => {
    const s = slugify(`${'a'.repeat(79)} b`);
    expect(s.endsWith('-')).toBe(false);
    expect(isSlug(s)).toBe(true);
  });

  it('rejects anything that is not a slug', () => {
    for (const bad of ['', 'Avec-Majuscule', 'a--b', '-a', 'a b', "x'; DROP", 42]) expect(isSlug(bad)).toBe(false);
  });
});
