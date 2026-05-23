'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { springSnappy, springBouncy } from '@/lib/motion';

interface GlassButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'gold' | 'ghost';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
  ariaLabel?: string;
  /** Add a continuous breathing glow (for hero CTA) */
  breathe?: boolean;
}

export function GlassButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  disabled = false,
  ariaLabel,
  breathe = false,
}: GlassButtonProps) {
  const reduceMotion = useReducedMotion();

  const base =
    'group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-3';

  const variants = {
    primary:
      'glass text-[var(--text-primary)] hover:bg-white/10 border border-white/15',
    gold:
      'glass text-[var(--text-primary)] border border-[var(--accent-gold)]/50 hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10',
    ghost:
      'bg-transparent text-[var(--text-secondary)] border border-white/10 hover:text-[var(--text-primary)] hover:border-white/25',
  };

  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { scale: 1.03, filter: 'brightness(1.1)', transition: springSnappy },
        whileTap: { scale: 0.96, transition: springBouncy },
        ...(breathe && {
          animate: { scale: [1, 1.04, 1] },
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
        }),
      };

  const content = (
    <motion.span className="contents" {...motionProps}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'gold' && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-gold)]/0 via-[var(--accent-gold)]/10 to-[var(--accent-gold)]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </motion.span>
  );

  const classes = cn(base, variants[variant], disabled && 'opacity-50 pointer-events-none', className);

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={classes}
    >
      {content}
    </button>
  );
}
