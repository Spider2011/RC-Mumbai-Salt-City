'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SITE, THEME_PILLARS } from '@/lib/constants';
import { fadeUp, fadeLeft, fadeRight, staggerContainer, drawPath } from '@/lib/motion';

export function YearThemeSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      className="relative overflow-hidden py-24 md:py-32"
      aria-labelledby="theme-heading"
    >
      {/* Dawn-to-dusk vertical gradient */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,107,107,0.12) 0%, rgba(255,169,77,0.06) 25%, rgba(132,94,194,0.10) 70%, rgba(44,115,210,0.14) 100%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <motion.div variants={fadeUp}>
            <Eyebrow>The Year Theme · {SITE.year}</Eyebrow>
          </motion.div>
        </motion.div>

        {/* Two-column glass card */}
        <GlassCard className="overflow-hidden" tilt={false} hover={false}>
          <div className="grid gap-8 p-8 md:grid-cols-2 md:p-14">
            <motion.div
              variants={fadeLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-15%' }}
              className="flex flex-col justify-center"
            >
              <h2
                id="theme-heading"
                className="font-sanskrit text-[clamp(2.5rem,6vw,4.5rem)] leading-tight text-gradient-gold"
              >
                {SITE.themeDevanagari}
              </h2>
              <p className="font-display mt-4 text-[clamp(1.3rem,3vw,2rem)] font-light italic text-[var(--text-primary)]">
                {SITE.themeTranslation}
              </p>
            </motion.div>

            <motion.div
              variants={fadeRight}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-15%' }}
              className="flex items-center"
            >
              <p className="text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
                Every sunset is a sunrise elsewhere. Every ending is the soil from which a beginning
                grows. This year, we honour the cycle — of leadership, of service, of self. We do not
                start from zero. We start from everything that came before us, and we add our chapter
                to a story that has no final page.
              </p>
            </motion.div>
          </div>
        </GlassCard>

        {/* Animated drawing line + pillars */}
        <div className="relative mt-16">
          <svg
            viewBox="0 0 1000 20"
            className="absolute left-0 top-1/2 hidden w-full -translate-y-1/2 md:block"
            preserveAspectRatio="none"
            aria-hidden
          >
            <motion.path
              d="M0 10 L1000 10"
              fill="none"
              stroke="var(--accent-gold)"
              strokeWidth="1"
              strokeOpacity="0.4"
              variants={reduceMotion ? undefined : drawPath}
              initial={reduceMotion ? undefined : 'hidden'}
              whileInView={reduceMotion ? undefined : 'visible'}
              viewport={{ once: true, margin: '-10%' }}
            />
          </svg>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10%' }}
            className="relative grid gap-6 md:grid-cols-3"
          >
            {THEME_PILLARS.map((pillar) => (
              <motion.div key={pillar.title} variants={fadeUp} className="flex flex-col items-center text-center">
                <span className="mb-4 h-3 w-3 rounded-full bg-[var(--accent-gold)] shadow-[0_0_12px_rgba(212,175,55,0.8)]" />
                <h3 className="font-accent text-sm font-semibold uppercase tracking-[0.25em] text-gradient-gold">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{pillar.sub}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
