import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { safeRedirectPath } from '@/lib/auth/redirect';
import { getCurrentUser } from '@/lib/auth/session';

export const metadata: Metadata = { title: 'Connexion' };

const DEMO_ACCOUNTS = ['camille@demo.local', 'vincent@demo.local', 'odile@demo.local', 'thomas@demo.local'];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const raw = (await searchParams).next;
  const next = safeRedirectPath(Array.isArray(raw) ? raw[0] : raw);
  if (await getCurrentUser()) redirect(next);

  return (
    <main className="mx-auto my-10 flex max-w-[440px] flex-col gap-5 rounded-2xl bg-surface p-6 shadow-card-lg">
      <h1 className="font-display text-[23px] tracking-tight">Rejoindre la communauté</h1>
      <LoginForm next={next} />
      <aside className="rounded-tile bg-surface-2 px-3 py-2.5 text-[13px] text-ink-2">
        <p className="font-semibold text-ink">Comptes de démonstration</p>
        <ul className="mt-1 list-disc pl-5">{DEMO_ACCOUNTS.map((a) => <li key={a}>{a}</li>)}</ul>
        <p className="mt-1">Mot de passe : la valeur de <code>SEED_DEMO_PASSWORD</code> dans <code>backend/.env</code>.</p>
      </aside>
    </main>
  );
}
