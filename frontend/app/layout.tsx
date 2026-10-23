import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Playfair_Display } from 'next/font/google';
import { SiteHeader } from '@/components/layout/SiteHeader';
import './globals.css';

// Self-hosted by next/font at build time: no request to Google from the visitor's browser.
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Communauté Le Revenu', template: '%s · Communauté Le Revenu' },
  description: "Posez vos questions d'argent, partagez vos expériences et échangez avec la rédaction du Revenu.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={playfair.variable}>
      <body className="min-h-dvh font-sans text-[15px] leading-normal antialiased">
        <SiteHeader />
        <div className="mx-auto max-w-[1260px] px-4">{children}</div>
      </body>
    </html>
  );
}