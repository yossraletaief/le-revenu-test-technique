export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-card border border-hairline bg-surface px-5 py-10 text-center text-ink-2 shadow-card">
      <h3 className="mb-1.5 font-display text-xl text-ink">{title}</h3>
      <p>{text}</p>
    </div>
  );
}