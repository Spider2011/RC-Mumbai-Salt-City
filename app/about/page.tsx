import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Footer } from '@/components/sections/Footer';
import { AboutTabs } from '@/components/sections/AboutTabs';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About',
  description: `The story of ${SITE.name} and the philosophy behind ${SITE.theme}.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        sanskrit="अन्त"
        title={
          <>
            A continuum of <span className="italic text-gradient-twilight">service.</span>
          </>
        }
        subtitle="We are not the first to serve this city, and we will not be the last. We are a chapter — and we intend to write it well."
      />

      <div className="mx-auto max-w-4xl px-6 pb-24">
        {/* Our Club / District 3141 tabs */}
        <Suspense>
          <AboutTabs />
        </Suspense>
      </div>

      <Footer />
    </>
  );
}
