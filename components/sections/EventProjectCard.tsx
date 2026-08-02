'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { statusMeta } from '@/lib/events';
import { useEventStatus } from '@/lib/use-event-status';
import type { Event as ClubEvent, EventStatus } from '@/types';

interface EventProjectCardProps {
  event: ClubEvent;
  initialStatus: EventStatus;
}

/**
 * Event card for the Avenues page — mirrors the Events list but shows the
 * live status (Completed / Ongoing / Upcoming) computed from the date/time.
 */
export function EventProjectCard({ event, initialStatus }: EventProjectCardProps) {
  const status = useEventStatus(event, initialStatus);
  const badge = statusMeta(status, 'Completed');
  const isPast = status === 'past';

  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <GlassCard className="flex h-full flex-col p-7" tilt={false}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            {event.avenue}
          </span>
          <span
            className="rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide"
            style={{ color: badge.color, borderColor: badge.border }}
            suppressHydrationWarning
          >
            {badge.label}
          </span>
        </div>
        <h3 className="font-display text-2xl text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-gold)]">
          {event.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
          {event.description}
        </p>
        <span
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent-gold)]"
          suppressHydrationWarning
        >
          {isPast ? 'View gallery' : 'Register'}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </GlassCard>
    </Link>
  );
}
