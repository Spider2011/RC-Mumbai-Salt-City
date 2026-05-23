'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GoldDividerProps {
  className?: string;
  /** Animate drawing on scroll into view */
  animate?: boolean;
}

export function GoldDivider({ className, animate = false }: GoldDividerProps) {
  const reduceMotion = useReducedMotion();

  if (!animate || reduceMotion) {
    return <div className={cn('gold-divider w-full', className)} aria-hidden />;
  }

  return (
    <motion.div
      aria-hidden
      className={cn('gold-divider w-full origin-center', className)}
      initial={{ scaleX: 0, opacity: 0 }}
      whileInView={{ scaleX: 1, opacity: 0.5 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    />
  );
}
