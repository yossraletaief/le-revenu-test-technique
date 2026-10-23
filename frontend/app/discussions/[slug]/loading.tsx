export default function Loading() {
  return (
    <div className="grid grid-cols-1 gap-7 pt-6 md:grid-cols-[200px_minmax(0,1fr)]" aria-busy="true">
      <span className="sr-only">Chargement de la discussion…</span>
      <div className="hidden md:block" />
      <div className="flex flex-col gap-4">
        <div className="h-4 w-40 animate-pulse rounded bg-fill" />
        <div className="space-y-3 rounded-card border border-hairline bg-surface p-5">
          <div className="h-8 w-3/4 animate-pulse rounded bg-fill" />
          <div className="h-10 w-48 animate-pulse rounded bg-fill" />
          <div className="h-24 w-full animate-pulse rounded bg-fill" />
        </div>
        <div className="h-28 animate-pulse rounded-card bg-fill" />
      </div>
    </div>
  );
}
