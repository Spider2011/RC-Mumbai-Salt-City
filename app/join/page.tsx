import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { Footer } from '@/components/sections/Footer';
import { JoinForm } from '@/components/sections/JoinForm';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Join Us',
  description: `Become a Rotaractor — join ${SITE.name}.`,
};

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow="Join the Cycle"
        sanskrit="प्रारम्भ"
        title={
          <>
            Become part of the <span className="italic text-gradient-sunrise">continuum.</span>
          </>
        }
        subtitle="Every Rotaractor was once exactly where you are — at the threshold. Step through."
      />

      <div className="mx-auto max-w-2xl px-6 pb-24">
        <JoinForm />
      </div>

      <Footer />
    </>
  );
}
