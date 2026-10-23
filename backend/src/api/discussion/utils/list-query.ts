export type SortDirection = 'asc' | 'desc';

export interface ListQuery {
  page: number;
  pageSize: number;
  sort: SortDirection;
  category?: string;
}

export type ParseResult =
  | { ok: true; value: ListQuery }
  | { ok: false; errors: Record<string, string> };

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;
const SORTS: Record<string, SortDirection> = { 'date:desc': 'desc', 'date:asc': 'asc' };
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Koa gives string | string[] | undefined; repeated params (?page=1&page=2) are rejected. */
function single(raw: unknown): string | undefined | null {
  if (raw === undefined || raw === '') return undefined;
  return typeof raw === 'string' ? raw : null;
}

function int(raw: unknown, fallback: number, min: number, max: number): number | null {
  const v = single(raw);
  if (v === undefined) return fallback;
  if (v === null || !/^\d+$/.test(v)) return null;
  const n = Number(v);
  return n >= min && n <= max ? n : null;
}

/** Validates the public query string of GET /api/discussions against an allowlist. */
export function parseListQuery(query: Record<string, unknown>): ParseResult {
  const errors: Record<string, string> = {};

  const page = int(query.page, 1, 1, 10_000);
  if (page === null) errors.page = 'page doit être un entier ≥ 1';

  const pageSize = int(query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  if (pageSize === null) errors.pageSize = `pageSize doit être un entier entre 1 et ${MAX_PAGE_SIZE}`;

  const rawSort = single(query.sort) ?? 'date:desc';
  const sort = rawSort === null ? undefined : SORTS[rawSort];
  if (!sort) errors.sort = 'sort accepte uniquement date:desc ou date:asc';

  const category = single(query.category);
  if (category === null || (category !== undefined && (category.length > 80 || !SLUG_RE.test(category)))) {
    errors.category = 'category doit être un slug valide';
  }

  if (Object.keys(errors).length > 0 || page === null || pageSize === null || !sort || category === null) {
    return { ok: false, errors };
  }
  return { ok: true, value: { page, pageSize, sort, ...(category ? { category } : {}) } };
}

/** Plain-text excerpt cut on a word boundary. */
export function excerpt(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(' '), 1)).trimEnd() + '…';
}
