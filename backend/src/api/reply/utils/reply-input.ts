export const REPLY_MIN = 2;
export const REPLY_MAX = 5000;
const DOCUMENT_ID_RE = /^[a-z0-9]{1,64}$/;

export interface ReplyInput { content: string; discussion: string }
export type ReplyParseResult = { ok: true; value: ReplyInput } | { ok: false; errors: Record<string, string> };

/**
 * Reads ONLY content and discussion from { data: {...} }.
 * Any other key the client sends (author, createdAt…) is ignored by construction.
 */
export function parseReplyInput(body: unknown): ReplyParseResult {
  const data = (body as { data?: Record<string, unknown> } | null)?.data;
  if (typeof data !== 'object' || data === null) return { ok: false, errors: { data: 'Le corps doit contenir un objet data' } };

  const errors: Record<string, string> = {};
  const content = typeof data.content === 'string' ? data.content.trim() : '';
  if (content.length < REPLY_MIN) errors.content = 'Votre réponse est trop courte.';
  else if (content.length > REPLY_MAX) errors.content = `Votre réponse dépasse ${REPLY_MAX} caractères.`;

  const discussion = data.discussion;
  if (typeof discussion !== 'string' || !DOCUMENT_ID_RE.test(discussion)) errors.discussion = 'Discussion invalide.';

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { content, discussion: discussion as string } };
}
