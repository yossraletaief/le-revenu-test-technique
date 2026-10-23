import Link from 'next/link';
import { Prose } from '@/components/ui/Prose';
import { homeHref } from '@/lib/search-params';
import type { DiscussionDetail } from '@/lib/strapi/schemas';
import { Byline } from './Byline';
import { TypeTag } from './TypeTag';

export function DiscussionArticle({ discussion, now }: { discussion: DiscussionDetail; now?: Date }) {
  const { title, type, content, createdAt, author, category } = discussion;
  return (
    <article className="rounded-card border border-hairline bg-surface p-4 shadow-card md:px-[22px] md:py-5">
      <div className="flex flex-wrap items-center gap-2 text-[12.5px]">
        {category && (
          <Link href={homeHref({ category: category.slug })} className="font-semibold text-brand-text hover:text-ink">{category.name}</Link>
        )}
        <TypeTag type={type} />
      </div>
      <h1 className="mt-1.5 mb-3.5 font-display text-2xl leading-tight font-bold tracking-tight md:text-[29px]">{title}</h1>
      <Byline username={author?.username ?? null} createdAt={createdAt} size="md" now={now} />
      <Prose text={content} className="mt-3.5 text-[15.5px]" />
    </article>
  );
}
