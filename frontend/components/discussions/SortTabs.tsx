import Link from 'next/link';
import { homeHref, SORT_OPTIONS, type SortOrder } from '@/lib/search-params';

/** Segmented control from the mockup, made of links: works without JavaScript. */
export function SortTabs({ sort, category }: { sort: SortOrder; category?: string }) {
  return (
    <nav aria-label="Trier les discussions" className="inline-flex gap-0.5 self-start rounded-[10px] bg-fill p-[3px]">
      {SORT_OPTIONS.map((o) => {
        const current = o.value === sort;
        return (
          <Link
            key={o.value}
            href={homeHref({ category, sort: o.value })}
            aria-current={current ? 'true' : undefined}
            className={`inline-flex min-h-9 items-center rounded-lg px-3.5 text-sm whitespace-nowrap ${current ? 'bg-surface font-semibold text-ink shadow-sm' : 'font-medium text-ink-2 hover:text-ink'}`}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}