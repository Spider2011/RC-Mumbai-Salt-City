'use client';

import { GoldDivider } from '@/components/ui/GoldDivider';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { EventGallery } from '@/components/sections/EventGallery';
import { EventRegisterForm } from '@/components/sections/EventRegisterForm';
import { useEventStatus } from '@/lib/use-event-status';
import type { Event as ClubEvent, EventStatus } from '@/types';

interface EventDetailBodyProps {
  event: ClubEvent;
  initialStatus: EventStatus;
}

/**
 * Past events show their gallery; ongoing and upcoming events show the
 * registration form. Status is live (recomputed from the event's date/time),
 * so the page switches on its own once an event begins or ends.
 */
export function EventDetailBody({ event, initialStatus }: EventDetailBodyProps) {
  const status = useEventStatus(event, initialStatus);
  const hasGallery = status === 'past' && event.gallery && event.gallery.length > 0;

  if (status === 'past') {
    if (!hasGallery) {
      return (
        <ScrollReveal>
          <GlassCard className="mt-8 p-10 text-center" tilt={false}>
            <p className="text-[var(--text-secondary)]">
              Photos from this event will appear here soon.
            </p>
          </GlassCard>
        </ScrollReveal>
      );
    }
    return (
      <>
        <GoldDivider className="my-16" animate />
        <ScrollReveal>
          <h2 className="font-display mb-8 text-3xl font-light text-[var(--text-primary)]">
            Gallery
          </h2>
        </ScrollReveal>
        <EventGallery images={event.gallery!} eventTitle={event.title} />
      </>
    );
  }

  return (
    <>
      <GoldDivider className="my-16" animate />
      <ScrollReveal>
        {status === 'ongoing' && (
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#4ade80]/50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#4ade80]">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#4ade80]" />
            Happening now
          </span>
        )}
        <h2 className="font-display mb-3 text-3xl font-light text-[var(--text-primary)]">
          Register
        </h2>
        <p className="mb-8 max-w-xl text-[var(--text-secondary)]">
          Reserve your place for {event.title}. We&apos;ll email the final details ahead of the day.
        </p>
      </ScrollReveal>
      <ScrollReveal>
        <EventRegisterForm eventTitle={event.title} />
      </ScrollReveal>
    </>
  );
}
