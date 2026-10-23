import { describe, expect, it } from 'vitest';
import { parseReplyInput } from '../src/api/reply/utils/reply-input';

describe('parseReplyInput', () => {
  it('accepts a valid reply and trims it', () => {
    expect(parseReplyInput({ data: { content: '  Merci !  ', discussion: 'abc123' } }))
      .toEqual({ ok: true, value: { content: 'Merci !', discussion: 'abc123' } });
  });

  it('drops any author sent by the client', () => {
    const r = parseReplyInput({ data: { content: 'Bonjour', discussion: 'abc123', author: 'someone-else' } });
    expect(r.ok && r.value).not.toHaveProperty('author');
  });

  it('rejects empty, whitespace-only and too long content', () => {
    for (const content of ['', '   ', 'a', 'x'.repeat(5001)]) {
      const r = parseReplyInput({ data: { content, discussion: 'abc123' } });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.errors).toHaveProperty('content');
    }
  });

  it('rejects a missing or malformed discussion id', () => {
    for (const discussion of [undefined, 42, 'ABC', 'a b', '../x']) {
      const r = parseReplyInput({ data: { content: 'Bonjour', discussion } });
      expect(r.ok).toBe(false);
    }
  });

  it('rejects a body without data', () => {
    expect(parseReplyInput(null).ok).toBe(false);
    expect(parseReplyInput({ content: 'x' }).ok).toBe(false);
  });
});
