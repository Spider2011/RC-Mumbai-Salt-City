'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { STATS } from '@/lib/constants';
import { fadeUp, fadeRight, staggerContainer, floatDrift } from '@/lib/motion';

export function MissionSection() {
  return (
    <section className="section mx-auto max-w-7xl px-6" aria-labelledby="mission-heading">
      <div className="grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: mission glass card */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
        >
          <GlassCard className="p-8 md:p-12" tilt={false}>
            <motion.div variants={fadeUp}>
              <Eyebrow>We Are The Continuum</Eyebrow>
            </motion.div>
            <motion.h2
              id="mission-heading"
              variants={fadeUp}
              className="font-display mt-5 text-[clamp(1.8rem,3.5vw,2.8rem)] font-light leading-[1.15] text-[var(--text-primary)]"
            >
              Inclusive hubs where ideas
              <br />
              <span className="italic text-gradient-twilight">become impact.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="mt-6 max-w-xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
            >
              The Rotaract Club of Mumbai Salt City is an inclusive hub that brings together people
              of all ages to exchange ideas with community leaders, develop leadership skills, and
              enjoy meaningful service. Whether in bustling cities or quiet villages, Rotaract breaks
              down barriers — driving positive change in communities around the world, and right
              here in ours.
            </motion.p>
          </GlassCard>
        </motion.div>

        {/* Right: floating Sanskrit glyph */}
        <motion.div
          variants={fadeRight}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-15%' }}
          className="relative hidden h-full min-h-[300px] items-center justify-center lg:flex"
          aria-hidden
        >
          <motion.span
            {...floatDrift}
            className="font-sanskrit select-none text-[clamp(6rem,14vw,11rem)] leading-none text-[var(--text-primary)]/[0.06]"
          >
            अन्त
          </motion.span>
        </motion.div>
      </div>

      {/* Stat cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-10%' }}
        className="mt-12 grid gap-5 sm:grid-cols-3"
      >
        {STATS.map((stat) => (
          <motion.div key={stat.label} variants={fadeUp}>
            <GlassCard className="flex flex-col items-center p-8 text-center" glowColor="#D4AF37">
              <span className="font-accent text-gradient-gold text-5xl font-semibold">
                {stat.value}
              </span>
              <span className="mt-3 text-lg font-medium text-[var(--text-primary)]">
                {stat.label}
              </span>
              <span className="mt-1 text-sm text-[var(--text-secondary)]">{stat.sub}</span>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
