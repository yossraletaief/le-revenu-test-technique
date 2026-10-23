import Link from 'next/link';
import type { ReactNode } from 'react';
import { homeHref, type SortOrder } from '@/lib/search-params';
import type { Category } from '@/lib/strapi/schemas';

interface Props { categories: Category[]; active?: string; sort: SortOrder }

function NavLink({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={`rounded-tile px-2.5 py-[7px] text-sm ${current ? 'bg-fill-2 font-semibold text-ink' : 'font-medium text-ink-2 hover:bg-fill hover:text-ink'}`}
    >
      {children}
    </Link>
  );
}

/** Desktop sidebar (≥ 768px). Keeps the current sort, resets the page. */
export function CategoryNav({ categories, active, sort }: Props) {
  return (
    <nav aria-label="Espaces" className="sticky top-[86px] hidden flex-col gap-0.5 md:flex">
      <NavLink href={homeHref({ sort })} current={!active}>Toutes les discussions</NavLink>
      <p className="px-2.5 pt-[18px] pb-1.5 text-[11.5px] font-semibold text-ink-3">Espaces</p>
      {categories.map((c) => (
        <NavLink key={c.slug} href={homeHref({ category: c.slug, sort })} current={active === c.slug}>{c.name}</NavLink>
      ))}
    </nav>
  );
}

/** Mobile replacement for the sidebar: horizontally scrollable chips (< 768px). */
export function CategoryChips({ categories, active, sort }: Props) {
  const chip = (current: boolean) =>
    `inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-[13px] text-[13.5px] font-medium shadow-sm ${
      current ? 'border-brand bg-brand text-brand-ink' : 'border-hairline bg-surface text-ink-2'
    }`;
  return (
    <nav aria-label="Espaces" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] md:hidden">
      <Link href={homeHref({ sort })} aria-current={!active ? 'page' : undefined} className={chip(!active)}>Tout</Link>
      {categories.map((c) => (
        <Link key={c.slug} href={homeHref({ category: c.slug, sort })} aria-current={active === c.slug ? 'page' : undefined} className={chip(active === c.slug)}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}