'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { SITE, THEME_PILLARS } from '@/lib/constants';

type Tab = 'Our Club' | 'District 3141';
const TABS: Tab[] = ['Our Club', 'District 3141'];

function OurClubContent() {
  return (
    <div className="space-y-8">
      <GlassCard className="p-8 md:p-12" tilt={false}>
        <h2 className="font-display text-3xl font-light text-[var(--text-primary)]">
          Who we are
        </h2>
        <p className="mt-5 leading-relaxed text-[var(--text-secondary)]">
          The Rotaract Club of Mumbai Salt City, chartered under Rotary International District 3141,
          is a fellowship of young leaders and professionals committed to the ideal of Service Above
          Self. We exchange ideas with community leaders, develop our own leadership, and serve where
          we are needed most — across seven distinct avenues.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
          Rooted in Mumbai&apos;s coastal identity — the salt, the sea, the relentless tide — we draw
          our metaphor from the very land we serve. Tides recede so they may return. Salt dissolves
          so it may preserve. Every ending feeds a beginning.
        </p>
      </GlassCard>

      <GoldDivider className="my-8" animate />

      {/* Year theme deep-dive */}
      <div className="mb-10 text-center">
        <h2 className="font-sanskrit text-[clamp(2rem,5vw,3.5rem)] text-gradient-gold">
          {SITE.themeDevanagari}
        </h2>
        <p className="font-display mt-2 text-xl italic text-[var(--text-primary)]">
          {SITE.themeTranslation}
        </p>
      </div>

      <GlassCard className="p-8 md:p-12" tilt={false}>
        <p className="leading-relaxed text-[var(--text-secondary)]">
          The Sanskrit phrase <em className="text-[var(--text-primary)]">Aant Asti Prarambh</em> —
          &ldquo;the end is the beginning&rdquo; — is the spine of our year. It is drawn from a
          worldview as old as the Upaniṣads: that time is not a line with a start and a finish, but a
          wheel. Leadership passes. Members graduate. Projects conclude. And yet the club endures,
          because every conclusion is the seed of what comes next.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
          We chose this theme not as decoration but as discipline. It asks us to honour those who
          came before, to be fully present in the service of today, and to build deliberately for
          those who will inherit what we leave behind.
        </p>
      </GlassCard>

      {/* Pillars */}
      <div className="grid gap-5 md:grid-cols-3">
        {THEME_PILLARS.map((pillar) => (
          <GlassCard key={pillar.title} className="h-full p-7 text-center" glowColor="#D4AF37">
            <h3 className="font-accent text-sm font-semibold uppercase tracking-[0.25em] text-gradient-gold">
              {pillar.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
              {pillar.sub}
            </p>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="p-8 md:p-12" tilt={false} variant="heavy">
        <p className="eyebrow">From the President · {SITE.year}</p>
        <blockquote className="font-display mt-5 text-[clamp(1.3rem,3vw,2rem)] font-light italic leading-snug text-[var(--text-primary)]">
          &ldquo;We do not start from zero. We start from everything that came before us — and we add
          our chapter to a story that has no final page.&rdquo;
        </blockquote>
        <p className="mt-6 text-sm text-[var(--text-secondary)]">
          — {SITE.president}, President
        </p>
      </GlassCard>
    </div>
  );
}

function DistrictContent() {
  return (
    <div className="space-y-8">
      <GlassCard className="p-8 md:p-12" tilt={false}>
        <h2 className="font-display text-3xl font-light text-[var(--text-primary)]">
          Rotary International District 3141
        </h2>
        <p className="mt-5 leading-relaxed text-[var(--text-secondary)]">
          District 3141 is one of Rotary International&apos;s most vibrant districts, encompassing
          Mumbai and the Konkan coast. It brings together hundreds of Rotary and Rotaract clubs
          united by a shared commitment to humanitarian service, fellowship, and ethical leadership.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
          As a Rotaract club chartered under District 3141, the Rotaract Club of Mumbai Salt City
          participates in district-wide service projects, leadership conclaves, and inter-club
          collaborations — amplifying our local impact to a regional scale.
        </p>
      </GlassCard>

      <div className="grid gap-5 md:grid-cols-2">
        <GlassCard className="p-7" glowColor="#D4AF37">
          <h3 className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            District
          </h3>
          <p className="font-display mt-2 text-3xl font-light text-[var(--text-primary)]">RID 3141</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Rotary International District covering Greater Mumbai and the Konkan region.
          </p>
        </GlassCard>

        <GlassCard className="p-7" glowColor="#D4AF37">
          <h3 className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            District Theme
          </h3>
          <p className="font-display mt-2 text-3xl font-light italic text-[var(--text-primary)]">
            Alchemy
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Transforming intent into impact — the district&apos;s call to turn every act of service
            into gold.
          </p>
        </GlassCard>

        <GlassCard className="p-7" glowColor="#D4AF37">
          <h3 className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            District Rotaract Representative
          </h3>
          <p className="font-display mt-2 text-2xl font-light text-[var(--text-primary)]">
            Shreehari Nair
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Leading the Rotaract movement across District 3141 for the year.
          </p>
        </GlassCard>

        <GlassCard className="p-7">
          <h3 className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            Rotaract Mission
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            To provide young people with opportunities to enhance the knowledge and skills that will
            assist them in personal development, address the physical and social needs of their
            communities, and promote better relations between all people worldwide.
          </p>
        </GlassCard>

        <GlassCard className="p-7">
          <h3 className="font-accent text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
            Our Sponsor Club
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            The Rotaract Club of Mumbai Salt City is sponsored by the Rotary Club of Mumbai Salt
            City, which mentors the club and supports its initiatives under the District 3141 umbrella.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

export function AboutTabs() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [active, setActive] = useState<Tab>(tabParam === 'district' ? 'District 3141' : 'Our Club');

  // Keep the tab in sync when the nav dropdown navigates to /about?tab=district
  // while this page is already mounted.
  useEffect(() => {
    setActive(tabParam === 'district' ? 'District 3141' : 'Our Club');
  }, [tabParam]);

  return (
    <>
      {/* Tab bar */}
      <div className="mb-10 flex gap-2 border-b border-white/10 pb-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="relative px-5 pb-4 pt-1 text-sm transition-colors"
            style={{
              color: active === tab ? 'var(--accent-gold)' : 'var(--text-secondary)',
            }}
          >
            {tab}
            {active === tab && (
              <motion.span
                layoutId="about-tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent-gold)]"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — starts visible, no opacity:0 initial state */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          initial={{ opacity: 1, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        >
          {active === 'Our Club' ? <OurClubContent /> : <DistrictContent />}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
