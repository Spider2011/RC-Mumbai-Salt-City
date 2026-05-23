'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MandalaProps {
  className?: string;
  /** rotation duration in seconds; lower = faster */
  duration?: number;
  /** rotation direction */
  reverse?: boolean;
  onClick?: () => void;
}

/**
 * Layered mandala / chakra ring. Pure SVG, infinitely rotating via Framer Motion.
 * Echoes the cyclical theme — "Aant Asti Prarambh".
 */
export function Mandala({ className, duration = 120, reverse = false, onClick }: MandalaProps) {
  const reduceMotion = useReducedMotion();
  const stroke = 'rgba(212, 175, 55, 0.5)';
  const strokeFaint = 'rgba(245, 245, 247, 0.18)';

  const spin = (d: number, rev = false) =>
    reduceMotion
      ? {}
      : {
          animate: { rotate: rev ? -360 : 360 },
          transition: { duration: d, repeat: Infinity, ease: 'linear' as const },
        };

  // 24 radial spokes
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  // 12 petals
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <svg
      viewBox="0 0 400 400"
      className={cn('h-full w-full', onClick && 'cursor-pointer', className)}
      onClick={onClick}
      role={onClick ? 'button' : 'presentation'}
      aria-hidden={!onClick}
      aria-label={onClick ? 'Mandala' : undefined}
    >
      {/* Outer ring — slow */}
      <motion.g {...spin(duration)} style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="190" fill="none" stroke={strokeFaint} strokeWidth="0.75" />
        <circle cx="200" cy="200" r="178" fill="none" stroke={stroke} strokeWidth="0.5" strokeDasharray="2 6" />
        {spokes.map((a) => (
          <line
            key={a}
            x1="200"
            y1="22"
            x2="200"
            y2="34"
            stroke={stroke}
            strokeWidth="0.75"
            transform={`rotate(${a} 200 200)`}
          />
        ))}
      </motion.g>

      {/* Mid ring — faster, reverse */}
      <motion.g {...spin(duration * 0.66, !reverse)} style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="148" fill="none" stroke={strokeFaint} strokeWidth="0.75" />
        {petals.map((a) => (
          <path
            key={a}
            d="M200 60 Q214 100 200 140 Q186 100 200 60 Z"
            fill="none"
            stroke={stroke}
            strokeWidth="0.6"
            transform={`rotate(${a} 200 200)`}
          />
        ))}
      </motion.g>

      {/* Inner ring */}
      <motion.g {...spin(duration * 0.5)} style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="100" fill="none" stroke={strokeFaint} strokeWidth="0.75" />
        <circle cx="200" cy="200" r="88" fill="none" stroke={stroke} strokeWidth="0.4" strokeDasharray="1 4" />
        {spokes.slice(0, 12).map((a) => (
          <line
            key={a}
            x1="200"
            y1="100"
            x2="200"
            y2="112"
            stroke={stroke}
            strokeWidth="0.6"
            transform={`rotate(${a * 2} 200 200)`}
          />
        ))}
      </motion.g>

      {/* Core */}
      <motion.g {...spin(duration * 0.4, !reverse)} style={{ transformOrigin: '200px 200px' }}>
        <circle cx="200" cy="200" r="56" fill="none" stroke={stroke} strokeWidth="0.6" />
        {petals.map((a) => (
          <path
            key={a}
            d="M200 144 Q208 172 200 200 Q192 172 200 144 Z"
            fill="rgba(212,175,55,0.04)"
            stroke={stroke}
            strokeWidth="0.4"
            transform={`rotate(${a} 200 200)`}
          />
        ))}
        <circle cx="200" cy="200" r="8" fill="none" stroke={stroke} strokeWidth="0.75" />
        <circle cx="200" cy="200" r="2" fill={stroke} />
      </motion.g>
    </svg>
  );
}
