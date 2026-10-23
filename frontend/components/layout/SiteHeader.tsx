import Link from 'next/link';
import { Logo } from './Logo';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-glass backdrop-blur-xl backdrop-saturate-[180%]">
      <div className="mx-auto flex h-[62px] max-w-[1260px] items-center gap-5 px-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Le Revenu, accueil de la communauté">
          <Logo />
          <span aria-hidden="true" className="hidden h-5 w-px bg-line-strong sm:block" />
          <span className="text-[15px] font-semibold text-ink-2">Communauté</span>
        </Link>
      </div>
    </header>
  );
}