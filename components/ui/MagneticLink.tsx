'use client';

import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';

interface MagneticLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  /** Strength of the cursor pull (0–1). Default 0.22 — subtle. */
  pull?: number;
  ariaLabel?: string;
  onClick?: () => void;
}

const MotionLink = motion.create(Link);

/**
 * Link wrapper that subtly slides toward the cursor with spring smoothing.
 * Used on nav links and other inline anchors for tactile feel.
 */
export function MagneticLink({
  href,
  children,
  className,
  pull = 0.22,
  ariaLabel,
  onClick,
}: MagneticLinkProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xs = useSpring(x, { stiffness: 280, damping: 24, mass: 0.35 });
  const ys = useSpring(y, { stiffness: 280, damping: 24, mass: 0.35 });

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * pull);
    y.set((e.clientY - (r.top + r.height / 2)) * pull);
  }
  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      className={className}
      aria-label={ariaLabel}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={reduceMotion ? undefined : { x: xs, y: ys }}
    >
      {children}
    </MotionLink>
  );
}
