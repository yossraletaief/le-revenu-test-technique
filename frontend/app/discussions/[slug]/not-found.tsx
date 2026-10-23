import Link from 'next/link';

export default function DiscussionNotFound() {
  return (
    <div className="mx-auto my-16 max-w-md rounded-card border border-hairline bg-surface p-8 text-center shadow-card">
      <h1 className="font-display text-2xl">Discussion introuvable</h1>
      <p className="mt-2 text-ink-2">Elle a peut-être été supprimée, ou le lien est incorrect.</p>
      <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-[10px] bg-brand px-4 font-semibold text-brand-ink">
        Voir toutes les discussions
      </Link>
    </div>
  );
}
