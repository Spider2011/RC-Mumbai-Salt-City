import type { Metadata } from 'next';
import { CalendarDays, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { Footer } from '@/components/sections/Footer';
import { SITE } from '@/lib/constants';
import { fadeUp } from '@/lib/motion';
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

function EventCard({ event }: { event: ClubEvent }) {
  return (
    <GlassCard className="flex h-full flex-col p-7">
      <span className="inline-flex items-center gap-2 text-sm text-[var(--accent-gold)]">
        {event.type === 'upcoming' ? (
          <Clock className="h-4 w-4" />
        ) : (
          <CalendarDays className="h-4 w-4" />
        )}
        {event.date}
      </span>
      <h3 className="font-display mt-3 text-2xl text-[var(--text-primary)]">{event.title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
        {event.description}
      </p>
    </GlassCard>
  );
}

export default function EventsPage() {
  const upcoming = EVENTS.filter((e) => e.type === 'upcoming');
  const past = EVENTS.filter((e) => e.type === 'past');

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

      <div className="mx-auto max-w-7xl px-6 pb-24">
        <ScrollReveal>
          <h2 className="font-display mb-6 text-3xl font-light text-[var(--text-primary)]">
            Upcoming
          </h2>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {upcoming.map((event, i) => (
            <ScrollReveal key={event.id} variants={fadeUp} delay={(i % 3) * 0.08}>
              <EventCard event={event} />
            </ScrollReveal>
          ))}
        </div>

        <GoldDivider className="my-16" animate />

        <ScrollReveal>
          <h2 className="font-display mb-6 text-3xl font-light text-[var(--text-primary)]">
            Recap
          </h2>
        </ScrollReveal>
        {past.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {past.map((event, i) => (
              <ScrollReveal key={event.id} variants={fadeUp} delay={(i % 3) * 0.08}>
                <EventCard event={event} />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <ScrollReveal>
            <GlassCard className="p-10 text-center" tilt={false}>
              <p className="text-[var(--text-secondary)]">
                Our story is just beginning. Recaps will appear here as the year unfolds.
              </p>
            </GlassCard>
          </ScrollReveal>
        )}
      </div>

      <Footer />
    </>
  );
}
