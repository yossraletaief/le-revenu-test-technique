/** Shown instantly while the Server Component fetches (streaming). */
export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-7 pt-6 md:grid-cols-[212px_minmax(0,1fr)]" aria-busy="true" aria-live="polite">
      <span className="sr-only">Chargement des discussions…</span>
      <div className="hidden md:block" />
      <div className="flex flex-col gap-4">
        <div className="h-40 animate-pulse rounded-[18px] bg-fill" />
        <div className="overflow-hidden rounded-card border border-hairline bg-surface">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex gap-4 border-t border-line p-4 first:border-t-0">
              <div className="hidden h-[58px] w-[62px] animate-pulse rounded-tile bg-fill md:block" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-fill" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-fill" />
                <div className="h-3 w-full animate-pulse rounded bg-fill" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}