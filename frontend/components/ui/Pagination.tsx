import Link from 'next/link';

interface Props { page: number; pageCount: number; href: (page: number) => string }

export function Pagination({ page, pageCount, href }: Props) {
  if (pageCount <= 1) return null;
  const link = 'inline-flex min-h-11 items-center rounded-[10px] border border-hairline bg-surface px-4 text-sm font-semibold shadow-sm hover:bg-surface-2';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      {page > 1 ? <Link href={href(page - 1)} className={link} rel="prev">← Précédente</Link> : <span />}
      <span className="text-sm text-ink-3">Page {page} sur {pageCount}</span>
      {page < pageCount ? <Link href={href(page + 1)} className={link} rel="next">Suivante →</Link> : <span />}
    </nav>
  );
}