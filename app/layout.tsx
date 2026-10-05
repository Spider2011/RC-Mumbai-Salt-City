import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter, Space_Grotesk, Tiro_Devanagari_Sanskrit } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { SITE } from '@/lib/constants';
import { SmoothScroll } from '@/components/effects/SmoothScroll';
import { CustomCursor } from '@/components/effects/CustomCursor';
import { AmbientMandala } from '@/components/effects/AmbientMandala';
import { ShlokaEasterEgg } from '@/components/effects/ShlokaEasterEgg';
import { IntroLoader } from '@/components/intro/IntroLoader';
import { PageTransition } from '@/components/effects/PageTransition';
import { ScrollProgressBar } from '@/components/effects/ScrollProgressBar';
import { GlassNav } from '@/components/ui/GlassNav';
import { ChatBot } from '@/components/effects/ChatBot';

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
  metadataBase: new URL(SITE.url),
  applicationName: SITE.shortName,
  title: {
    default: `${SITE.shortName} · ${SITE.name}`,
    template: `%s · ${SITE.shortName}`,
  },
  description: `${SITE.shortName} — the ${SITE.name} (${SITE.district}), Mumbai. ${SITE.themeTranslation} — ${SITE.theme}. An inclusive hub where ideas become impact.`,
  keywords: [
    SITE.shortName,
    SITE.name,
    'Rotaract',
    'Rotaract Mumbai',
    'Mumbai Salt City',
    'RID 3141',
    'service',
    'leadership',
    SITE.theme,
  ],
  openGraph: {
    title: `${SITE.shortName} · ${SITE.name}`,
    description: `${SITE.themeTranslation} — ${SITE.theme}`,
    siteName: SITE.shortName,
    locale: 'en_IN',
    type: 'website',
    images: [{ url: '/images/logo.png', width: 256, height: 256, alt: `${SITE.name} logo` }],
  },
  twitter: {
    card: 'summary',
    title: `${SITE.shortName} · ${SITE.name}`,
    description: `${SITE.themeTranslation} — ${SITE.theme}`,
    images: ['/images/logo.png'],
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
      // The intro gate script sets data-intro on <html> before hydration.
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${spaceGrotesk.variable} ${tiroDevanagari.variable}`}
    >
      <body className="noise relative min-h-dvh">
        <IntroLoader />
        <ScrollProgressBar />
        <CustomCursor />
        <AmbientMandala />
        <ShlokaEasterEgg />
        <ChatBot />
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
