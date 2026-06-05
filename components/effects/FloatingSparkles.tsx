'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { Sparkle } from 'lucide-react';

interface FloatingSparklesProps {
  count?: number;
  className?: string;
}

/** Deterministic PRNG (mulberry32) so render stays pure and SSR-stable. */
function seeded(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Decorative sparkles that drift and rotate in their parent. Used inside page
 * headers and CTA sections to add ambient motion. Pointer-events-none.
 */
export function FloatingSparkles({ count = 8, className }: FloatingSparklesProps) {
  const reduceMotion = useReducedMotion();

  const sparks = useMemo(() => {
    const rnd = seeded(count * 73 + 11);
    const r = (min: number, max: number) => min + rnd() * (max - min);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: r(4, 96),
      y: r(8, 92),
      size: r(8, 16),
      delay: r(0, 6),
      duration: r(8, 16),
      drift: r(10, 30),
      rotate: r(0, 360),
      opacity: r(0.18, 0.45),
    }));
  }, [count]);

  if (reduceMotion) return null;

  return (
    <div aria-hidden className={className}>
      {sparks.map((s) => (
        <motion.span
          key={s.id}
          className="absolute text-[var(--accent-gold)]"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
          initial={{ rotate: s.rotate, scale: 0.6 }}
          animate={{
            y: [0, -s.drift, 0, s.drift * 0.6, 0],
            x: [0, s.drift * 0.4, -s.drift * 0.3, s.drift * 0.5, 0],
            rotate: [s.rotate, s.rotate + 180, s.rotate + 360],
            scale: [0.6, 1, 0.8, 1.1, 0.6],
          }}
          transition={{
            duration: s.duration,
            delay: s.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Sparkle className="h-full w-full" strokeWidth={1.2} fill="currentColor" />
        </motion.span>
      ))}
    </div>
  );
}
