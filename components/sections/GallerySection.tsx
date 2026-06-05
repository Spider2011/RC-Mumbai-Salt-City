'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowRight, Sparkle } from 'lucide-react';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { GlassButton } from '@/components/ui/GlassButton';
import { fadeUp, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';

// Six photos from /public/images/gallery/, with mosaic spans for visual rhythm.
const TILES = [
  { id: '01', src: '/images/gallery/01.jpg', span: 'sm:col-span-2 sm:row-span-2' },
  { id: '07', src: '/images/gallery/07.jpg', span: '' },
  { id: '12', src: '/images/gallery/12.jpg', span: '' },
  { id: '23', src: '/images/gallery/23.jpg', span: 'sm:row-span-2' },
  { id: '29', src: '/images/gallery/29.jpg', span: '' },
  { id: '40', src: '/images/gallery/40.jpg', span: 'sm:col-span-2' },
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

      <motion.div
        variants={staggerFast}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-8%' }}
        className="grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-4"
        style={{ perspective: 1400 }}
      >
        {TILES.map((item) => (
          <motion.div
            key={item.id}
            variants={fadeUp}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            className={cn('group relative cursor-pointer', item.span)}
            style={{ perspective: 1200 }}
          >
            <motion.div
              className="relative h-full w-full"
              style={{ transformStyle: 'preserve-3d' }}
              whileHover={{ rotateY: 180 }}
              transition={{ type: 'spring', stiffness: 180, damping: 24 }}
            >
              {/* FRONT face — the photo */}
              <div
                className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <Image
                  src={item.src}
                  alt="A moment from our journey"
                  fill
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 50vw"
                  className="object-cover"
                />
                {/* Subtle dark veil + corner sparkle */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/30 via-transparent to-transparent"
                />
                <Sparkle
                  className="absolute right-3 top-3 h-3 w-3 text-[var(--accent-gold)]/80"
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
                    'linear-gradient(135deg, rgba(212,175,55,0.22), rgba(132,94,194,0.32))',
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
