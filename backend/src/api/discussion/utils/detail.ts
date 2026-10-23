type DateLike = string | Date;

interface RawUser { username?: string | null; [key: string]: unknown }
interface RawReply { documentId: string; content: string; createdAt: DateLike; author?: RawUser | null }

/** Shape returned by the Document Service query in the discussion service. */
export interface RawDiscussionRow {
  documentId: string;
  title: string;
  slug: string;
  type: 'question' | 'discussion';
  content: string;
  createdAt: DateLike;
  author?: RawUser | null;
  category?: { name: string; slug: string; description?: string | null } | null;
  replies?: RawReply[] | null;
}

export interface PublicAuthor { username: string }

export interface ReplyItem {
  documentId: string;
  content: string;
  createdAt: string;
  author: PublicAuthor | null;
}

export interface DiscussionDetail {
  documentId: string;
  title: string;
  slug: string;
  type: 'question' | 'discussion';
  content: string;
  createdAt: string;
  lastActivityAt: string;
  author: PublicAuthor | null;
  category: { name: string; slug: string; description: string | null } | null;
  replyCount: number;
  replies: ReplyItem[];
}

const iso = (d: DateLike): string => new Date(d).toISOString();

/** Allowlist of public author fields: whatever else the row contains (email…) is dropped here. */
const publicAuthor = (u?: RawUser | null): PublicAuthor | null =>
  typeof u?.username === 'string' ? { username: u.username } : null;

export function toDiscussionDetail(row: RawDiscussionRow): DiscussionDetail {
  const replies: ReplyItem[] = (row.replies ?? []).map((r) => ({
    documentId: r.documentId,
    content: r.content,
    createdAt: iso(r.createdAt),
    author: publicAuthor(r.author),
  }));

  return {
    documentId: row.documentId,
    title: row.title,
    slug: row.slug,
    type: row.type,
    content: row.content,
    createdAt: iso(row.createdAt),
    lastActivityAt: replies.at(-1)?.createdAt ?? iso(row.createdAt), // replies are sorted ascending
    author: publicAuthor(row.author),
    category: row.category
      ? { name: row.category.name, slug: row.category.slug, description: row.category.description ?? null }
      : null,
    replyCount: replies.length,
    replies,
  };
}
