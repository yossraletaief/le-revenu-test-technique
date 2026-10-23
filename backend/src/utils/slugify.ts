export const SLUG_MAX = 80;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Turns "Ouvrir un PEA avec 5 000 € ?" into "ouvrir-un-pea-avec-5-000". */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, SLUG_MAX)
    .replace(/^-+|-+$/g, ''); // trim after slicing so a cut never leaves a trailing dash
}

/** True for strings that could have been produced by slugify(). */
export const isSlug = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= SLUG_MAX && SLUG_RE.test(value);
