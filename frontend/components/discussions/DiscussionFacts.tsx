import Link from 'next/link';
import { formatDate, formatRelative } from '@/lib/format';
import { homeHref } from '@/lib/search-params';
import type { DiscussionDetail } from '@/lib/strapi/schemas';

/** Right column from the mockup: "Cette discussion" + the category card. */
export function DiscussionFacts({ discussion }: { discussion: DiscussionDetail }) {
  const { replyCount, lastActivityAt, category } = discussion;
  return (
    <aside className="flex flex-col gap-[18px]">
      <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
        <h2 className="mb-3 text-[13px] font-semibold">Cette discussion</h2>
        <dl className="grid grid-cols-2 gap-x-2.5 gap-y-3">
          <div><dt className="text-xs text-ink-3">Réponses</dt><dd className="font-semibold tabular-nums">{replyCount}</dd></div>
          <div>
            <dt className="text-xs text-ink-3">Dernière activité</dt>
            <dd className="text-[13.5px] font-semibold"><time dateTime={lastActivityAt} title={formatDate(lastActivityAt)}>{formatRelative(lastActivityAt)}</time></dd>
          </div>
        </dl>
      </section>
      {category && (
        <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
          <h2 className="font-display text-lg tracking-tight">{category.name}</h2>
          {category.description && <p className="mt-1.5 mb-3 text-sm text-ink-2">{category.description}</p>}
          <Link href={homeHref({ category: category.slug })} className="inline-flex min-h-11 items-center rounded-lg border border-hairline bg-surface px-3 text-[13px] font-semibold shadow-sm hover:bg-surface-2">
            Voir les discussions de cet espace
          </Link>
        </section>
      )}
    </aside>
  );
}
