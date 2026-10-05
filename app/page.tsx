import { Hero } from '@/components/sections/Hero';
import { MissionSection } from '@/components/sections/MissionSection';
import { YearThemeSection } from '@/components/sections/YearThemeSection';
import { GallerySection } from '@/components/sections/GallerySection';
import { CTASection } from '@/components/sections/CTASection';
import { Footer } from '@/components/sections/Footer';
import { SanskritMarquee } from '@/components/effects/SanskritMarquee';
import type { Metadata } from 'next';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE.url}/#website`,
      url: `${SITE.url}/`,
      name: SITE.shortName,
      alternateName: [SITE.name, 'rcmsc.in'],
      inLanguage: 'en-IN',
      publisher: { '@id': `${SITE.url}/#organization` },
    },
    {
      '@type': 'NGO',
      '@id': `${SITE.url}/#organization`,
      name: SITE.name,
      alternateName: SITE.shortName,
      url: `${SITE.url}/`,
      logo: `${SITE.url}/images/logo.png`,
      slogan: SITE.tagline,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Mumbai',
        addressRegion: 'Maharashtra',
        addressCountry: 'IN',
      },
      sameAs: [SITE.instagram, SITE.linkedin, SITE.facebook, SITE.twitter],
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Hero />
      <MissionSection />
      <SanskritMarquee />
      <YearThemeSection />
      <GallerySection />
      <CTASection />
      <Footer />
    </>
  );
}
