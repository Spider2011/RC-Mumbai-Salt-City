import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { EventProjectCard } from '@/components/sections/EventProjectCard';
import { Footer } from '@/components/sections/Footer';
import { AVENUES, SITE } from '@/lib/constants';
import { EVENTS, getEventStatus } from '@/lib/events';
import { fadeUp } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'Projects',
  description: `Avenues of service and signature projects — ${SITE.name}.`,
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Work"
        sanskrit="सेवा"
        title={
          <>
            Where ideas become <span className="italic text-gradient-sunrise">impact.</span>
          </>
        }
        subtitle="Service flows through eleven avenues. Here is how we channel it — past, present, and ongoing."
      />

      <div className="mx-auto max-w-7xl px-6 pb-24">
        {/* Avenues overview */}
        <ScrollReveal>
          <h2 className="font-display mb-6 text-3xl font-light text-[var(--text-primary)]">
            The Eleven Avenues
          </h2>
        </ScrollReveal>
        <div className="mb-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AVENUES.map((avenue, i) => (
            <ScrollReveal key={avenue.id} variants={fadeUp} delay={(i % 4) * 0.06}>
              <GlassCard className="h-full p-6" glowColor={avenue.color}>
                <span
                  className="mb-3 block h-1 w-10 rounded-full"
                  style={{ background: avenue.color }}
                />
                <h3 className="font-display text-xl text-[var(--text-primary)]">{avenue.title}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{avenue.description}</p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Projects & events — sourced from the Events data so both stay in sync */}
        <ScrollReveal>
          <h2 className="font-display mb-6 text-3xl font-light text-[var(--text-primary)]">
            Projects &amp; Events
          </h2>
        </ScrollReveal>
        <div className="grid gap-5 md:grid-cols-3">
          {EVENTS.map((event, i) => (
            <ScrollReveal key={event.id} variants={fadeUp} delay={(i % 3) * 0.08}>
              <EventProjectCard event={event} initialStatus={getEventStatus(event)} />
            </ScrollReveal>
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}
