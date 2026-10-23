import { Prose } from '@/components/ui/Prose';
import type { Reply } from '@/lib/strapi/schemas';
import { Byline } from './Byline';

export function ReplyList({ replies, now }: { replies: Reply[]; now?: Date }) {
  const n = replies.length;
  return (
    <section aria-labelledby="replies-title" className="flex flex-col gap-3">
      <h2 id="replies-title" className="font-display text-[21px] font-bold tracking-tight">
        {n === 0 ? "Aucune réponse pour l'instant" : `${n} réponse${n > 1 ? 's' : ''}`}
      </h2>
      {n === 0 && <p className="text-ink-2">Soyez le premier à partager votre expérience.</p>}
      {replies.map((r) => (
        <article key={r.documentId} id={`reponse-${r.documentId}`} className="rounded-card border border-hairline bg-surface px-4 py-4 shadow-card md:px-5">
          <Byline username={r.author?.username ?? null} createdAt={r.createdAt} now={now} />
          <Prose text={r.content} className="mt-2.5 text-[15px]" />
        </article>
      ))}
    </section>
  );
}
