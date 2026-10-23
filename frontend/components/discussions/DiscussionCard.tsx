import Link from 'next/link';
import { formatDate, formatRelative, pluralize } from '@/lib/format';
import { homeHref } from '@/lib/search-params';
import type { DiscussionListItem } from '@/lib/strapi/schemas';
import { ReplyCount } from './ReplyCount';
import { TypeTag } from './TypeTag';

interface Props { discussion: DiscussionListItem; now?: Date }

/**
 * The whole card is clickable through a "stretched link" on the title (::after covering the card),
 * so there is a single real link per card for screen readers; the category link sits above it (z-10).
 */
export function DiscussionCard({ discussion, now }: Props) {
  const { title, slug, excerpt, type, createdAt, author, category, replyCount } = discussion;
  return (
    <article className="group relative grid grid-cols-1 gap-2 border-t border-line px-4 py-3.5 transition-colors first:border-t-0 hover:bg-surface-2 md:grid-cols-[62px_minmax(0,1fr)] md:gap-4 md:px-[18px] md:py-4">
      <div className="hidden md:block"><ReplyCount count={replyCount} /></div>
      <div className="min-w-0">
        <div className="mb-1.5 flex flex-wrap items-center gap-2 text-[12.5px]">
          {category && (
            <Link href={homeHref({ category: category.slug })} className="relative z-10 font-semibold text-brand-text hover:text-ink">
              {category.name}
            </Link>
          )}
          <TypeTag type={type} />
        </div>
        <h3 className="font-display text-[18.5px] leading-snug font-bold tracking-tight text-ink group-hover:text-brand-text">
          <Link href={`/discussions/${slug}`} className="outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:after:outline-3 focus-visible:after:-outline-offset-3 focus-visible:after:outline-brand/45">
            {title}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{excerpt}</p>
        <p className="mt-2.5 flex flex-wrap items-center gap-x-1.5 text-[13px] text-ink-3">
          <b className="font-semibold text-ink-2">{author?.username ?? 'Membre supprimé'}</b>
          <span aria-hidden="true">·</span>
          <time dateTime={createdAt} title={formatDate(createdAt)}>{formatRelative(createdAt, now)}</time>
          <span className="md:hidden"><span aria-hidden="true">· </span>{pluralize(replyCount, 'réponse', 'réponses')}</span>
        </p>
      </div>
    </article>
  );
}