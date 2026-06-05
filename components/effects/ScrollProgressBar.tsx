'use client';

import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';

/**
 * Sitewide scroll progress indicator. A thin gradient bar pinned to the top of
 * the viewport that fills as the user scrolls. Spring-smoothed so it feels alive.
 */
export function ScrollProgressBar() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  if (reduceMotion) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[2px] origin-left"
      style={{
        scaleX,
        background:
          'linear-gradient(90deg, var(--accent-sunrise-from), var(--accent-gold), var(--accent-twilight-from))',
        boxShadow: '0 0 12px rgba(212, 175, 55, 0.55)',
      }}
    />
  );
}
