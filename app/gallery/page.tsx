import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { Footer } from '@/components/sections/Footer';
import { GalleryGrid } from '@/components/sections/GalleryGrid';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Gallery',
  description: `Moments frozen in salt — ${SITE.name}.`,
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="The Archive"
        sanskrit="स्मृति"
        title={
          <>
            Moments, frozen in <span className="italic text-gradient-twilight">salt.</span>
          </>
        }
        subtitle="A growing archive of our journey. Each frame, a chapter that ended so another could begin."
      />

      <div className="mx-auto max-w-7xl px-6 pb-24">
        <GalleryGrid />
      </div>

      <Footer />
    </>
  );
}
