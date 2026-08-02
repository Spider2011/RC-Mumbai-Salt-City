'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  type Variants,
} from 'framer-motion';
import { ArrowRight, CalendarDays, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { getEventStatus, statusMeta } from '@/lib/events';
import { cn } from '@/lib/utils';
import type { Event as ClubEvent, EventStatus } from '@/types';

interface EventsTimelineProps {
  events: ClubEvent[];
  /** Server-computed status per event (aligned to `events`) for first render. */
  initialStatuses: EventStatus[];
}

const nodePulse: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: [0, 1.4, 1],
    opacity: 1,
    transition: { duration: 0.55, times: [0, 0.6, 1], ease: 'easeOut' },
  },
};

const cardReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

/**
 * Vertical gold timeline for the Events page. The line draws itself as you
 * scroll (scaleY, compositor-only); each event node pulses once on entering
 * the viewport. Left rail on mobile, centered alternating cards on desktop.
 *
 * Status badges are computed live from each event's date/time (see the `now`
 * state) so cards flip upcoming → ongoing → past on their own.
 */
export function EventsTimeline({ events, initialStatuses }: EventsTimelineProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // null on the server + first client render (matches `initialStatuses`);
  // set on mount and refreshed each minute for live status.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.45'],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  return (
    <div ref={ref} className="relative">
      {/* Static faint rail */}
      <div
        aria-hidden
        className="absolute bottom-0 left-[11px] top-0 w-px bg-white/10 md:left-1/2"
      />
      {/* Scroll-drawn gold line */}
      <motion.div
        aria-hidden
        style={reduceMotion ? undefined : { scaleY: lineScale }}
        className="absolute bottom-0 left-[11px] top-0 w-px origin-top bg-gradient-to-b from-[var(--accent-gold)]/80 via-[var(--accent-gold)]/40 to-transparent md:left-1/2"
      />

      <ol className="space-y-10">
        {events.map((event, i) => {
          const status: EventStatus =
            now == null ? initialStatuses[i] : getEventStatus(event, new Date(now));
          const badge = statusMeta(status);
          const isPast = status === 'past';

          return (
            <li key={event.id} className="relative pl-10 md:pl-0">
              {/* Node — pulses once when it enters the viewport */}
              <motion.span
                aria-hidden
                variants={reduceMotion ? undefined : nodePulse}
                initial={reduceMotion ? undefined : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-15% 0px -15% 0px' }}
                className="absolute left-[5px] top-8 h-[13px] w-[13px] rounded-full bg-[var(--accent-gold)] shadow-[0_0_14px_rgba(212,175,55,0.85)] md:left-1/2 md:ml-[-6.5px]"
              />

              <motion.div
                variants={reduceMotion ? undefined : cardReveal}
                initial={reduceMotion ? undefined : 'hidden'}
                whileInView="visible"
                viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                className={cn('md:w-[calc(50%-2.5rem)]', i % 2 === 1 && 'md:ml-auto')}
              >
                <Link href={`/events/${event.slug}`} className="group block h-full">
                  <GlassCard className="flex h-full flex-col p-7" tilt={false}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-2 text-sm text-[var(--accent-gold)]">
                        {isPast ? <CalendarDays className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                        {event.date}
                      </span>
                      <span
                        className="rounded-full border px-2.5 py-0.5 text-[0.65rem] uppercase tracking-wide"
                        style={{ color: badge.color, borderColor: badge.border }}
                        suppressHydrationWarning
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="font-display mt-3 text-2xl text-[var(--text-primary)] transition-colors group-hover:text-[var(--accent-gold)]">
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
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
