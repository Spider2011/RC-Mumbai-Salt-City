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

const EVENTS: ClubEvent[] = [
  {
    id: 'e1',
    title: 'JeevanDaan — Blood Donation Drive',
    date: '5th July 2026',
    description:
      'Our flagship community service initiative — a blood donation camp uniting members and citizens in the act of giving life.',
    type: 'past',
  },
  {
    id: 'e2',
    title: 'Skill Workshop Webinar',
    date: '15th July 2026',
    description:
      'An online skill-building session bridging international best practices with local impact, open to Rotaractors across districts.',
    type: 'past',
  },
  {
    id: 'e3',
    title: 'World Chess Day',
    date: '20th July 2026',
    description:
      'Celebrating the global game — an international collaboration promoting strategic thinking and cross-cultural fellowship.',
    type: 'upcoming',
  },
  {
    id: 'e4',
    title: 'PickleBall Tournament',
    date: '25th July 2026',
    description:
      'Building camaraderie on the court — an inter-club sports event fostering teamwork, wellness, and friendly competition.',
    type: 'upcoming',
  },
  {
    id: 'e5',
    title: 'Installation Ceremony',
    date: '2nd August 2026',
    description:
      'The formal beginning of our year — the moment one chapter closes and the next begins.',
    type: 'upcoming',
  },
  {
    id: 'e6',
    title: 'Oh My Friend Ganesha',
    date: '14th September 2026',
    description:
      'A festive club service initiative celebrating the spirit of Ganesh Chaturthi with the community.',
    type: 'upcoming',
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
