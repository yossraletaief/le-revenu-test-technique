import { notFound } from 'next/navigation';
import { CategoryChips, CategoryNav } from '@/components/layout/CategoryNav';
import { DiscussionList } from '@/components/discussions/DiscussionList';
import { SortTabs } from '@/components/discussions/SortTabs';
import { Pagination } from '@/components/ui/Pagination';
import { pluralize } from '@/lib/format';
import { homeHref, parseHomeSearchParams } from '@/lib/search-params';
import { getCategories } from '@/lib/strapi/categories';
import { getDiscussions } from '@/lib/strapi/discussions';

const PAGE_SIZE = 10;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Server Component: data fetched on the server, filters/sort/page read from the URL. */
export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const state = parseHomeSearchParams(await searchParams);

  // Both requests run in parallel.
  const [categories, list] = await Promise.all([
    getCategories(),
    getDiscussions({ ...state, pageSize: PAGE_SIZE }),
  ]);

  const active = state.category ? categories.find((c) => c.slug === state.category) : undefined;
  if (state.category && !active) notFound(); // unknown category slug → real 404
  const { page, pageCount, total } = list.meta.pagination;
  if (total > 0 && page > pageCount) notFound(); // page out of range

  return (
    <div className="grid grid-cols-1 items-start gap-7 pt-4 pb-24 md:grid-cols-[200px_minmax(0,1fr)] md:pt-6 lg:grid-cols-[212px_minmax(0,1fr)]">
      <CategoryNav categories={categories} active={state.category} sort={state.sort} />

      <main className="flex min-w-0 flex-col gap-[18px]">
        {active ? (
          <section className="rounded-card border border-hairline bg-surface p-[22px] shadow-card">
            <h1 className="font-display text-[28px] font-bold tracking-tight">{active.name}</h1>
            {active.description && <p className="mt-1 max-w-[60ch] text-ink-2">{active.description}</p>}
            <p className="mt-2 text-[13px] text-ink-3">{pluralize(total, 'discussion', 'discussions')}</p>
          </section>
        ) : (
          <section className="relative overflow-hidden rounded-[18px] bg-[radial-gradient(120%_140%_at_100%_0%,color-mix(in_srgb,var(--brand)_55%,transparent)_0%,transparent_55%),linear-gradient(160deg,var(--hero-top),var(--hero))] px-5 py-[22px] text-white shadow-card-lg md:px-7 md:pt-7 md:pb-6">
            <h1 className="max-w-[22ch] font-display text-[25px] leading-tight font-bold tracking-tight md:text-[32px]">
              La communauté des lecteurs du Revenu
            </h1>
            <p className="mt-2 max-w-[52ch] text-white/80">
              Posez vos questions d&apos;argent, partagez vos expériences et échangez avec la rédaction.
            </p>
            <p className="mt-4 text-[13px] text-white/90">
              <b className="block text-xl font-bold tabular-nums">{total}</b>discussions
            </p>
          </section>
        )}

        <CategoryChips categories={categories} active={state.category} sort={state.sort} />
        <SortTabs sort={state.sort} category={state.category} />
        <DiscussionList discussions={list.data} />
        <Pagination page={page} pageCount={pageCount} href={(p) => homeHref({ ...state, page: p })} />
      </main>
    </div>
  );
}