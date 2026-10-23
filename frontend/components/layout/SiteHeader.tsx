import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { logout } from '@/lib/auth/actions';
import { getCurrentUser } from '@/lib/auth/session';
import { Logo } from './Logo';

/** Server Component: reading the session cookie makes pages dynamic, which they already are (searchParams). */
export async function SiteHeader() {
  const user = await getCurrentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-glass backdrop-blur-xl backdrop-saturate-[180%]">
      <div className="mx-auto flex h-[62px] max-w-[1260px] items-center gap-5 px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Le Revenu, accueil de la communauté">
          <Logo />
          <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong sm:block" />
          <span className="text-[15px] font-semibold text-ink-2">Communauté</span>
        </Link>
        <div className="ml-auto flex items-center gap-2.5">
          {user ? (
            <>
              <span className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-[3px] pr-2.5 pl-[3px] text-sm font-semibold">
                <Avatar username={user.username} />
                <span className="hidden sm:inline">{user.username}</span>
              </span>
              <form action={logout}>
                <button type="submit" className="inline-flex min-h-11 items-center rounded-[10px] px-3 text-sm font-semibold text-ink-2 hover:bg-fill hover:text-ink">
                  Se déconnecter
                </button>
              </form>
            </>
          ) : (
            <Link href="/connexion" className="inline-flex min-h-11 items-center rounded-[10px] bg-brand px-4 text-sm font-semibold text-brand-ink hover:brightness-95">
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
