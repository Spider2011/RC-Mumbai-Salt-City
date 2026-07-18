import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { EventsTimeline } from '@/components/sections/EventsTimeline';
import { Footer } from '@/components/sections/Footer';
import { EVENTS } from '@/lib/events';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Events',
  description: `Upcoming events and recaps — ${SITE.name}.`,
};

export default function EventsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Gatherings"
        sanskrit="समय"
        title={
          <>
            Moments worth <span className="italic text-gradient-twilight">marking.</span>
          </>
        }
        subtitle="Every gathering is a turning of the wheel. Here is where we have been, and where we are headed."
      />

      <div className="mx-auto max-w-5xl px-6 pb-24">
        <ScrollReveal>
          <h2 className="font-display mb-12 text-3xl font-light text-[var(--text-primary)]">
            The wheel of the year
          </h2>
        </ScrollReveal>
        <EventsTimeline events={EVENTS} />
      </div>

      <Footer />
    </>
  );
}
