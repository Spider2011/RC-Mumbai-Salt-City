'use client';

import { motion } from 'framer-motion';
import { Camera, ArrowRight } from 'lucide-react';
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
      >
        {PLACEHOLDERS.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10',
              item.span
            )}
            style={{
              background:
                'linear-gradient(135deg, rgba(132,94,194,0.2), rgba(44,115,210,0.2))',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)] transition-opacity group-hover:opacity-0">
              <Camera className="h-7 w-7" strokeWidth={1.5} />
              <span className="text-xs tracking-wide">[Photo Placeholder]</span>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                View Story
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
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
