'use client';

import { motion, type Variants } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from '@/lib/motion';

interface ScrollRevealProps {
  children: ReactNode;
  variants?: Variants;
  className?: string;
  /** trigger once or every time it enters view */
  once?: boolean;
  /** viewport margin */
  margin?: string;
  /** delay before animation */
  delay?: number;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

/**
 * Wraps content with a scroll-triggered reveal using useInView semantics
 * (whileInView). Defaults to fade + translate-up.
 */
export function ScrollReveal({
  children,
  variants = fadeUp,
  className,
  once = true,
  margin = '-12%',
  delay = 0,
  as = 'div',
}: ScrollRevealProps) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: margin as `${number}%` }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </MotionTag>
  );
}
