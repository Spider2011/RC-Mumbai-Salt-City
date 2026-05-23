'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  gold: boolean;
}

/** Deterministic PRNG (mulberry32) — keeps render pure and SSR-stable. */
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
 * Slow-drifting particle field — orchestrated entirely via Framer Motion
 * (no CSS keyframes), echoing salt crystals / ocean spray suspended in dark water.
 * Uses a deterministic PRNG so render stays pure (no hydration mismatch, no setState-in-effect).
 */
export function ParticleField({ count = 40, className }: ParticleFieldProps) {
  const reduceMotion = useReducedMotion();

  const particles = useMemo<Particle[]>(() => {
    const rnd = seeded(count * 1000 + 7);
    const r = (min: number, max: number) => min + rnd() * (max - min);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: r(0, 100),
      y: r(0, 100),
      size: r(1, 3),
      duration: r(14, 30),
      delay: r(0, 8),
      drift: r(-40, 40),
      opacity: r(0.15, 0.6),
      gold: rnd() > 0.7,
    }));
  }, [count]);

  if (reduceMotion) {
    // Static dim field
    return (
      <div className={className} aria-hidden>
        {particles.slice(0, 20).map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity * 0.5,
              background: p.gold ? 'var(--accent-gold)' : 'var(--text-primary)',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={className} aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.gold ? 'var(--accent-gold)' : 'var(--text-primary)',
            boxShadow: p.gold ? '0 0 6px rgba(212,175,55,0.6)' : 'none',
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, p.opacity, p.opacity, 0],
            y: [0, -30, -10, -50],
            x: [0, p.drift * 0.5, p.drift, p.drift * 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
