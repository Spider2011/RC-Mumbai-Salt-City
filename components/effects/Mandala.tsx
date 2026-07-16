'use client';

import { cn } from '@/lib/utils';
import styles from './mandala.module.css';

interface MandalaProps {
  className?: string;
  duration?: number;
  reverse?: boolean;
  onClick?: () => void;
}

/**
 * Layered mandala / chakra ring. Pure SVG with CSS-driven rotation —
 * animations run on the compositor thread with zero JS cost per frame.
 */
export function Mandala({ className, duration = 120, reverse = false, onClick }: MandalaProps) {
  const stroke = 'rgba(212,175,55,0.5)';
  const strokeFaint = 'rgba(255,255,255,0.07)';

  const dur = (factor: number) =>
    ({ '--mandala-dur': `${duration * factor}s` }) as React.CSSProperties;

  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
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
      {/* Outer ring */}
      <g className={reverse ? styles.spinReverse : styles.spin} style={dur(1)}>
        <circle cx="200" cy="200" r="190" fill="none" stroke={strokeFaint} strokeWidth="0.75" />
        <circle cx="200" cy="200" r="178" fill="none" stroke={stroke} strokeWidth="0.5" strokeDasharray="2 6" />
        {spokes.map((a) => (
          <line key={a} x1="200" y1="22" x2="200" y2="34" stroke={stroke} strokeWidth="0.75" transform={`rotate(${a} 200 200)`} />
        ))}
      </g>

      {/* Mid ring */}
      <g className={reverse ? styles.spin : styles.spinReverse} style={dur(0.66)}>
        <circle cx="200" cy="200" r="148" fill="none" stroke={strokeFaint} strokeWidth="0.75" />
        {petals.map((a) => (
          <path key={a} d="M200 60 Q214 100 200 140 Q186 100 200 60 Z" fill="none" stroke={stroke} strokeWidth="0.6" transform={`rotate(${a} 200 200)`} />
        ))}
      </g>

      {/* Inner ring */}
      <g className={reverse ? styles.spinReverse : styles.spin} style={dur(0.5)}>
        <circle cx="200" cy="200" r="100" fill="none" stroke={strokeFaint} strokeWidth="0.75" />
        <circle cx="200" cy="200" r="88" fill="none" stroke={stroke} strokeWidth="0.4" strokeDasharray="1 4" />
        {spokes.slice(0, 12).map((a) => (
          <line key={a} x1="200" y1="100" x2="200" y2="112" stroke={stroke} strokeWidth="0.6" transform={`rotate(${a * 2} 200 200)`} />
        ))}
      </g>

      {/* Core */}
      <g className={reverse ? styles.spin : styles.spinReverse} style={dur(0.4)}>
        <circle cx="200" cy="200" r="56" fill="none" stroke={stroke} strokeWidth="0.6" />
        {petals.map((a) => (
          <path key={a} d="M200 144 Q208 172 200 200 Q192 172 200 144 Z" fill="rgba(212,175,55,0.04)" stroke={stroke} strokeWidth="0.4" transform={`rotate(${a} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="8" fill="none" stroke={stroke} strokeWidth="0.75" />
        <circle cx="200" cy="200" r="2" fill={stroke} />
      </g>
    </svg>
  );
}
