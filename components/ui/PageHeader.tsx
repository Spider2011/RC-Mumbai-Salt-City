'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { Eyebrow } from './Eyebrow';
import { fadeUp, staggerContainer } from '@/lib/motion';

interface PageHeaderProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: ReactNode;
  sanskrit?: string;
}

/**
 * Consistent hero header for inner pages — accounts for the fixed navbar,
 * includes a faint Devanagari watermark for thematic continuity.
 */
export function PageHeader({ eyebrow, title, subtitle, sanskrit }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden pb-12 pt-36 md:pt-44">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(132,94,194,0.12), transparent 60%)',
        }}
      />
      {sanskrit && (
        <span
          aria-hidden
          className="font-sanskrit pointer-events-none absolute -top-4 left-1/2 -translate-x-1/2 text-[clamp(5rem,18vw,14rem)] leading-none text-[var(--text-primary)]/[0.03]"
        >
          {sanskrit}
        </span>
      )}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-4xl px-6 text-center"
      >
        <motion.div variants={fadeUp} className="flex justify-center">
          <Eyebrow>{eyebrow}</Eyebrow>
        </motion.div>
        <motion.h1
          variants={fadeUp}
          className="font-display mt-5 text-[clamp(2.5rem,7vw,5rem)] font-light leading-[1.05] text-[var(--text-primary)]"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] md:text-lg"
          >
            {subtitle}
          </motion.p>
        )}
      </motion.div>
    </header>
  );
}
