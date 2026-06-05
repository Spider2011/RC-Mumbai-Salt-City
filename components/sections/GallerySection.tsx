'use client';

import { motion } from 'framer-motion';
import { Camera, ArrowRight, Sparkle } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassButton } from '@/components/ui/GlassButton';
import { fadeUp, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Mosaic spans for visual rhythm (grid-breaking, editorial)
const PLACEHOLDERS = [
  { id: 1, span: 'sm:col-span-2 sm:row-span-2' },
  { id: 2, span: '' },
  { id: 3, span: '' },
  { id: 4, span: 'sm:row-span-2' },
  { id: 5, span: '' },
  { id: 6, span: 'sm:col-span-2' },
];

export function GallerySection() {
  return (
    <section className="section mx-auto max-w-7xl px-6" aria-labelledby="gallery-heading">
      <SectionHeading
        eyebrow="Glimpses"
        title={<span id="gallery-heading">Moments, frozen in salt.</span>}
        subtitle="Stories from our journey."
        align="center"
        className="mx-auto mb-14 max-w-2xl"
      />

      {/* Replace placeholder divs with actual images later. Paths go in /public/images/gallery/ */}
      <motion.div
        variants={staggerFast}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-8%' }}
        className="grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-4"
        style={{ perspective: 1400 }}
      >
        {PLACEHOLDERS.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={cn('group relative cursor-pointer', item.span)}
            style={{ perspective: 1200 }}
          >
            {/* Flip container */}
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{ rotateY: 180 }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            >
              {/* FRONT face */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 text-[var(--text-muted)]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  background:
                    'linear-gradient(135deg, rgba(132,94,194,0.20), rgba(44,115,210,0.20))',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Camera className="h-7 w-7" strokeWidth={1.5} />
                <span className="text-xs tracking-wide">[Photo Placeholder]</span>
                <Sparkle
                  className="absolute right-3 top-3 h-3 w-3 text-[var(--accent-gold)]/60"
                  strokeWidth={1.4}
                />
              </div>

              {/* BACK face */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/15 text-[var(--text-primary)]"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  background:
                    'linear-gradient(135deg, rgba(212,175,55,0.20), rgba(132,94,194,0.30))',
                  backdropFilter: 'blur(14px)',
                }}
              >
                <span className="font-display text-lg italic">View Story</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-gold)]">
                  Open
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>

      <div className="mt-12 flex justify-center">
        <GlassButton href="/gallery" variant="primary">
          Explore Full Gallery
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </GlassButton>
      </div>
    </section>
  );
}
