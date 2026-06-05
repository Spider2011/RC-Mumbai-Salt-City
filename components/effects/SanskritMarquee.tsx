'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SITE } from '@/lib/constants';

/**
 * Infinite-scrolling band of the year theme phrase. Acts as a sitewide
 * decorative signature between sections. Pauses on hover, respects reduced motion.
 */
export function SanskritMarquee() {
  const reduceMotion = useReducedMotion();
  const phrase = `${SITE.themeDevanagari}   ·   ${SITE.themeTranslation}   ·   `;
  // Duplicate so x: -50% loops seamlessly.
  const items = Array(8).fill(phrase);

  return (
    <section
      aria-hidden
      className="group relative overflow-hidden border-y border-white/10 py-8 md:py-10"
      style={{
        background:
          'linear-gradient(180deg, transparent, rgba(212,175,55,0.04), transparent)',
      }}
    >
      {/* Edge fades */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg-primary)] to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg-primary)] to-transparent"
      />

      <motion.div
        className="flex whitespace-nowrap will-change-transform"
        animate={reduceMotion ? undefined : { x: ['0%', '-50%'] }}
        transition={
          reduceMotion
            ? undefined
            : { duration: 38, repeat: Infinity, ease: 'linear' }
        }
        whileHover={reduceMotion ? undefined : { animationPlayState: 'paused' }}
      >
        {[...items, ...items].map((p, i) => (
          <span
            key={i}
            className="font-display mr-12 inline-flex items-center text-[clamp(1.75rem,4.5vw,3.5rem)] font-light italic text-gradient-gold"
          >
            {p}
          </span>
        ))}
      </motion.div>
    </section>
  );
}
