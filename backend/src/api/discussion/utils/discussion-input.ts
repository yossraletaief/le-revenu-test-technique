import { isSlug } from '../../../utils/slugify';

export const TITLE_MIN = 10;
export const TITLE_MAX = 150;
export const CONTENT_MAX = 10_000;
export const DISCUSSION_TYPES = ['question', 'discussion'] as const;
export type DiscussionTypeValue = (typeof DISCUSSION_TYPES)[number];

export interface DiscussionInput {
  title: string;
  content: string;
  type: DiscussionTypeValue;
  /** Category slug, resolved to a real category by the service. */
  category: string;
}

export type DiscussionParseResult = { ok: true; value: DiscussionInput } | { ok: false; errors: Record<string, string> };

const isType = (v: unknown): v is DiscussionTypeValue =>
  typeof v === 'string' && (DISCUSSION_TYPES as readonly string[]).includes(v);

/**
 * Business validation of POST /api/discussions, independent of the frontend.
 * Reads ONLY title, content, type and category: author and slug are never taken from the client.
 */
export function parseDiscussionInput(body: unknown): DiscussionParseResult {
  const data = (body as { data?: Record<string, unknown> } | null)?.data;
  if (typeof data !== 'object' || data === null) return { ok: false, errors: { data: 'Le corps doit contenir un objet data' } };

  const errors: Record<string, string> = {};

  // Collapse whitespace first: "a         b" must not pass the 10-character rule.
  const title = typeof data.title === 'string' ? data.title.replace(/\s+/g, ' ').trim() : '';
  if (title.length < TITLE_MIN) errors.title = `Le titre doit contenir au moins ${TITLE_MIN} caractères.`;
  else if (title.length > TITLE_MAX) errors.title = `Le titre ne doit pas dépasser ${TITLE_MAX} caractères.`;

  const content = typeof data.content === 'string' ? data.content.trim() : '';
  if (content.length === 0) errors.content = 'Le contenu est obligatoire.';
  else if (content.length > CONTENT_MAX) errors.content = `Le contenu ne doit pas dépasser ${CONTENT_MAX} caractères.`;

  if (!isType(data.type)) errors.type = 'Choisissez « Question » ou « Discussion ».';
  if (!isSlug(data.category)) errors.category = 'Choisissez une catégorie.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { title, content, type: data.type as DiscussionTypeValue, category: data.category as string } };
}
