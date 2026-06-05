'use client';

import { motion, useReducedMotion, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRef, type ReactNode } from 'react';
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

const MotionLink = motion.create(Link);

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

  // Magnetic pull — translate the button toward the cursor with spring smoothing.
  const ref = useRef<HTMLElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 260, damping: 22, mass: 0.4 });
  const ySpring = useSpring(y, { stiffness: 260, damping: 22, mass: 0.4 });

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (reduceMotion || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const pull = 0.28;
    x.set((e.clientX - cx) * pull);
    y.set((e.clientY - cy) * pull);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  const base =
    'group relative inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-medium tracking-wide transition-colors duration-300 cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-3 will-change-transform';

  const variantClasses = {
    primary: 'glass text-[var(--text-primary)] hover:bg-white/10 border border-white/15',
    gold: 'glass text-[var(--text-primary)] border border-[var(--accent-gold)]/50 hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10',
    ghost:
      'bg-transparent text-[var(--text-secondary)] border border-white/10 hover:text-[var(--text-primary)] hover:border-white/25',
  };

  const motionProps = reduceMotion
    ? {}
    : {
        style: { x: xSpring, y: ySpring },
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        whileHover: { scale: 1.05, filter: 'brightness(1.1)', transition: springSnappy },
        whileTap: { scale: 0.96, transition: springBouncy },
        ...(breathe && {
          animate: { scale: [1, 1.04, 1] },
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const },
        }),
      };

  const inner = (
    <>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'gold' && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--accent-gold)]/0 via-[var(--accent-gold)]/15 to-[var(--accent-gold)]/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
      )}
    </>
  );

  const classes = cn(
    base,
    variantClasses[variant],
    disabled && 'opacity-50 pointer-events-none',
    className
  );

  if (href) {
    return (
      <MotionLink
        href={href}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        aria-label={ariaLabel}
        {...motionProps}
      >
        {inner}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
