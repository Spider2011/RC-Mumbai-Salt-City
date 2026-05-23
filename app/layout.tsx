import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Space_Grotesk, Tiro_Devanagari_Sanskrit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SITE } from '@/lib/constants';
import { SmoothScroll } from '@/components/effects/SmoothScroll';
import { CustomCursor } from '@/components/effects/CustomCursor';
import { AmbientMandala } from '@/components/effects/AmbientMandala';
import { ShlokaEasterEgg } from '@/components/effects/ShlokaEasterEgg';
import { Loader } from '@/components/effects/Loader';
import { PageTransition } from '@/components/effects/PageTransition';
import { GlassNav } from '@/components/ui/GlassNav';

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const tiroDevanagari = Tiro_Devanagari_Sanskrit({
  variable: '--font-tiro',
  subsets: ['devanagari', 'latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} · ${SITE.year}`,
    template: `%s · ${SITE.shortName}`,
  },
  description: `${SITE.name} (${SITE.district}). ${SITE.themeTranslation} — ${SITE.theme}. An inclusive hub where ideas become impact.`,
  keywords: ['Rotaract', 'Mumbai Salt City', 'RID 3141', 'service', 'leadership', SITE.theme],
  openGraph: {
    title: `${SITE.name} · ${SITE.year}`,
    description: `${SITE.themeTranslation} — ${SITE.theme}`,
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A0E1A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} ${spaceGrotesk.variable} ${tiroDevanagari.variable}`}
    >
      <body className="noise relative min-h-dvh">
        <Loader />
        <CustomCursor />
        <AmbientMandala />
        <ShlokaEasterEgg />
        <SmoothScroll>
          <GlassNav />
          <PageTransition>
            <main className="relative z-[10]">{children}</main>
          </PageTransition>
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
