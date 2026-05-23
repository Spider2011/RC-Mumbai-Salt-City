import type { Metadata } from 'next';
import { PageHeader } from '@/components/ui/PageHeader';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { Footer } from '@/components/sections/Footer';
import { SITE, THEME_PILLARS } from '@/lib/constants';
import { fadeUp } from '@/lib/motion';

export const metadata: Metadata = {
  title: 'About',
  description: `The story of ${SITE.name} and the philosophy behind ${SITE.theme}.`,
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        sanskrit="अन्त"
        title={
          <>
            A continuum of <span className="italic text-gradient-twilight">service.</span>
          </>
        }
        subtitle="We are not the first to serve this city, and we will not be the last. We are a chapter — and we intend to write it well."
      />

      <div className="mx-auto max-w-4xl px-6 pb-24">
        {/* Club history */}
        <ScrollReveal>
          <GlassCard className="p-8 md:p-12" tilt={false}>
            <h2 className="font-display text-3xl font-light text-[var(--text-primary)]">
              Who we are
            </h2>
            <p className="mt-5 leading-relaxed text-[var(--text-secondary)]">
              The Rotaract Club of Mumbai Salt City, chartered under Rotary International District
              3141, is a fellowship of young leaders and professionals committed to the ideal of
              Service Above Self. We exchange ideas with community leaders, develop our own
              leadership, and serve where we are needed most — across seven distinct avenues.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
              {/* TODO: expand with founding year, charter details, notable milestones */}
              Rooted in Mumbai&apos;s coastal identity — the salt, the sea, the relentless tide — we
              draw our metaphor from the very land we serve. Tides recede so they may return. Salt
              dissolves so it may preserve. Every ending feeds a beginning.
            </p>
          </GlassCard>
        </ScrollReveal>

        <GoldDivider className="my-16" animate />

        {/* Year theme deep-dive */}
        <ScrollReveal>
          <div className="mb-10 text-center">
            <h2 className="font-sanskrit text-[clamp(2rem,5vw,3.5rem)] text-gradient-gold">
              {SITE.themeDevanagari}
            </h2>
            <p className="font-display mt-2 text-xl italic text-[var(--text-primary)]">
              {SITE.themeTranslation}
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <GlassCard className="p-8 md:p-12" tilt={false}>
            <p className="leading-relaxed text-[var(--text-secondary)]">
              The Sanskrit phrase <em className="text-[var(--text-primary)]">Aant Asti Prarambh</em>{' '}
              — &ldquo;the end is the beginning&rdquo; — is the spine of our year. It is drawn from a
              worldview as old as the Upaniṣads: that time is not a line with a start and a finish,
              but a wheel. Leadership passes. Members graduate. Projects conclude. And yet the club
              endures, because every conclusion is the seed of what comes next.
            </p>
            <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
              We chose this theme not as decoration but as discipline. It asks us to honour those who
              came before, to be fully present in the service of today, and to build deliberately for
              those who will inherit what we leave behind.
            </p>
          </GlassCard>
        </ScrollReveal>

        {/* Pillars */}
        <div
          className="mt-12 grid gap-5 md:grid-cols-3"
          // staggered reveal handled by ScrollReveal wrappers
        >
          {THEME_PILLARS.map((pillar, i) => (
            <ScrollReveal key={pillar.title} variants={fadeUp} delay={i * 0.1}>
              <GlassCard className="h-full p-7 text-center" glowColor="#D4AF37">
                <h3 className="font-accent text-sm font-semibold uppercase tracking-[0.25em] text-gradient-gold">
                  {pillar.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {pillar.sub}
                </p>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* President's note */}
        <GoldDivider className="my-16" animate />
        <ScrollReveal>
          <GlassCard className="p-8 md:p-12" tilt={false} variant="heavy">
            <p className="eyebrow">From the President · {SITE.year}</p>
            <blockquote className="font-display mt-5 text-[clamp(1.3rem,3vw,2rem)] font-light italic leading-snug text-[var(--text-primary)]">
              &ldquo;We do not start from zero. We start from everything that came before us — and we
              add our chapter to a story that has no final page.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-[var(--text-secondary)]">
              — {SITE.president}, President
            </p>
            {/* TODO: expand with full presidential address */}
          </GlassCard>
        </ScrollReveal>
      </div>

      <Footer />
    </>
  );
}
