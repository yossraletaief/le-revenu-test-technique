import { describe, expect, it } from 'vitest';
import { safeRedirectPath } from '@/lib/auth/redirect';

describe('safeRedirectPath', () => {
  it('keeps same-site relative paths', () => {
    expect(safeRedirectPath('/discussions/ouvrir-un-pea')).toBe('/discussions/ouvrir-un-pea');
  });
  it('blocks open redirects', () => {
    for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '', null, 42]) {
      expect(safeRedirectPath(bad)).toBe('/');
    }
  });
});
