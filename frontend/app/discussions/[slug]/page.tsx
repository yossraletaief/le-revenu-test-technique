import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryNav } from '@/components/layout/CategoryNav';
import { DiscussionArticle } from '@/components/discussions/DiscussionArticle';
import { DiscussionFacts } from '@/components/discussions/DiscussionFacts';
import { ReplyList } from '@/components/discussions/ReplyList';
import { homeHref } from '@/lib/search-params';
import { getCategories } from '@/lib/strapi/categories';
import { getDiscussionBySlug } from '@/lib/strapi/discussions';

type Params = Promise<{ slug: string }>;

/** Same fetch as the page: Next memoizes identical fetches within one render, so Strapi is called once. */
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const discussion = await getDiscussionBySlug((await params).slug);
  if (!discussion) return { title: 'Discussion introuvable' };
  return { title: discussion.title, description: discussion.content.replace(/\s+/g, ' ').slice(0, 160) };
}

export default async function DiscussionPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [discussion, categories] = await Promise.all([getDiscussionBySlug(slug), getCategories()]);
  if (!discussion) notFound();

  return (
    <div className="grid grid-cols-1 items-start gap-7 pt-4 pb-24 md:grid-cols-[200px_minmax(0,1fr)] md:pt-6 xl:grid-cols-[212px_minmax(0,1fr)_304px]">
      <CategoryNav categories={categories} active={discussion.category?.slug} sort="date:desc" />

      <main className="flex min-w-0 flex-col gap-[18px]">
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-ink-3">
          <Link href="/" className="hover:text-ink">Accueil</Link>
          {discussion.category && (
            <>
              <span aria-hidden="true">›</span>
              <Link href={homeHref({ category: discussion.category.slug })} className="hover:text-ink">{discussion.category.name}</Link>
            </>
          )}
        </nav>

        <DiscussionArticle discussion={discussion} />
        <ReplyList replies={discussion.replies} />

        {/* Replaced by the reply form in feat/permissions-auth. */}
        <div className="rounded-card border border-hairline bg-surface px-5 py-[26px] text-center shadow-card">
          <h3 className="font-display text-[19px] tracking-tight">Vous avez un avis ou une expérience à partager ?</h3>
          <p className="mt-1.5 text-ink-3">La connexion pour répondre arrive dans la prochaine étape.</p>
        </div>
      </main>

      <div className="md:col-start-2 xl:col-start-auto">
        <DiscussionFacts discussion={discussion} />
      </div>
    </div>
  );
}
