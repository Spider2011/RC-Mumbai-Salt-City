import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { EventsTimeline } from '@/components/sections/EventsTimeline';
import { Footer } from '@/components/sections/Footer';
import { SITE } from '@/lib/constants';
import type { Event as ClubEvent } from '@/types';

export const metadata: Metadata = {
  title: 'Events',
  description: `Upcoming events and recaps — ${SITE.name}.`,
};

// TODO: expand with real events and images (/public/images/events/)
const EVENTS: ClubEvent[] = [
  {
    id: 'e1',
    title: 'Installation Ceremony',
    date: 'July 2026',
    description: 'The formal beginning of our year — where one chapter ends and ours begins.',
    type: 'upcoming',
  },
  {
    id: 'e2',
    title: 'Monsoon Service Sprint',
    date: 'August 2026',
    description: 'A month of intensive community projects across the city.',
    type: 'upcoming',
  },
  {
    id: 'e3',
    title: 'Charter Anniversary',
    date: 'Earlier this year',
    description: 'Celebrating the legacy that brought us here.',
    type: 'past',
  },
];

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
