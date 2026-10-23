export const SORT_OPTIONS = [
  { value: 'date:desc', label: 'Plus récentes' },
  { value: 'date:asc', label: 'Plus anciennes' },
] as const;

export type SortOrder = (typeof SORT_OPTIONS)[number]['value'];

export interface HomeState {
  page: number;
  sort: SortOrder;
  category?: string;
}

type RawParams = Record<string, string | string[] | undefined>;

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const first = (v: string | string[] | undefined): string | undefined => (Array.isArray(v) ? v[0] : v);
const isSort = (v: string | undefined): v is SortOrder => SORT_OPTIONS.some((o) => o.value === v);

/** Turns untrusted URL params into a valid state; bad values fall back to defaults instead of erroring. */
export function parseHomeSearchParams(params: RawParams): HomeState {
  const page = Number(first(params.page));
  const sort = first(params.sort);
  const category = first(params.category);
  return {
    page: Number.isInteger(page) && page >= 1 ? page : 1,
    sort: isSort(sort) ? sort : 'date:desc',
    ...(category && SLUG_RE.test(category) ? { category } : {}),
  };
}

/** Builds a home URL, omitting default values so URLs stay short and canonical. */
export function homeHref(state: Partial<HomeState>): string {
  const q = new URLSearchParams();
  if (state.category) q.set('category', state.category);
  if (state.sort && state.sort !== 'date:desc') q.set('sort', state.sort);
  if (state.page && state.page > 1) q.set('page', String(state.page));
  const qs = q.toString();
  return qs ? `/?${qs}` : '/';
}