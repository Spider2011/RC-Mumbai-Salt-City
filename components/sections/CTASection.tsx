'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { GlassButton } from '@/components/ui/GlassButton';
import { fadeUp, staggerContainer } from '@/lib/motion';

export function CTASection() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-28 md:py-40" aria-labelledby="cta-heading">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 120%, rgba(132,94,194,0.18), transparent 60%)',
        }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-15%' }}
        className="relative mx-auto max-w-3xl px-6 text-center"
      >
        <motion.h2
          id="cta-heading"
          variants={fadeUp}
          className="font-display text-[clamp(2.2rem,6vw,4.5rem)] font-light italic leading-[1.05] text-[var(--text-primary)]"
        >
          Your story begins
          <br />
          where another <span className="text-gradient-sunrise">ends.</span>
        </motion.h2>
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-6 max-w-lg text-base text-[var(--text-secondary)] md:text-lg"
        >
          Become a Rotaractor. Become a part of the continuum.
        </motion.p>
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <GlassButton href="/join" variant="gold" breathe>
            Join Our Club
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </GlassButton>
          <GlassButton href="/projects" variant="ghost">
            Explore Projects
          </GlassButton>
        </motion.div>
      </motion.div>

      {/* Animated wave */}
      <div className="wave-container" aria-hidden>
        <svg viewBox="0 0 1440 120" className="h-[80px] w-full md:h-[120px]" preserveAspectRatio="none">
          <motion.path
            fill="rgba(44,115,210,0.10)"
            initial={false}
            animate={
              reduceMotion
                ? undefined
                : {
                    d: [
                      'M0,40 C360,100 720,0 1080,50 C1260,75 1380,40 1440,30 L1440,120 L0,120 Z',
                      'M0,60 C360,20 720,90 1080,30 C1260,5 1380,60 1440,70 L1440,120 L0,120 Z',
                      'M0,40 C360,100 720,0 1080,50 C1260,75 1380,40 1440,30 L1440,120 L0,120 Z',
                    ],
                  }
            }
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            fill="rgba(132,94,194,0.08)"
            initial={false}
            animate={
              reduceMotion
                ? undefined
                : {
                    d: [
                      'M0,70 C400,30 800,90 1200,50 C1320,38 1400,60 1440,65 L1440,120 L0,120 Z',
                      'M0,50 C400,90 800,30 1200,70 C1320,82 1400,55 1440,50 L1440,120 L0,120 Z',
                      'M0,70 C400,30 800,90 1200,50 C1320,38 1400,60 1440,65 L1440,120 L0,120 Z',
                    ],
                  }
            }
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </section>
  );
}
