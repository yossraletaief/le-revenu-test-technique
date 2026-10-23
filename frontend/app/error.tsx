'use client'; // required by Next.js for error boundaries

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error); // technical details stay in the console, not on screen
  }, [error]);

  return (
    <div role="alert" className="mx-auto my-16 max-w-md rounded-card border border-hairline bg-surface p-8 text-center shadow-card">
      <h1 className="font-display text-2xl">Les discussions sont momentanément indisponibles</h1>
      <p className="mt-2 text-ink-2">Réessayez dans quelques instants.</p>
      <button type="button" onClick={reset} className="mt-5 inline-flex min-h-11 items-center rounded-[10px] bg-brand px-4 font-semibold text-brand-ink hover:brightness-95">
        Réessayer
      </button>
    </div>
  );
}