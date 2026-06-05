'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { fadeUp, staggerFast } from '@/lib/motion';
import { Lightbox, type LightboxImage } from '@/components/effects/Lightbox';
import { cn } from '@/lib/utils';

// Cycle a small set of mosaic spans so the masonry feels editorial across 70 tiles.
const SPAN_PATTERN = [
  'sm:col-span-2 sm:row-span-2',
  '',
  '',
  'sm:row-span-2',
  '',
  'sm:col-span-2',
  '',
  '',
  '',
  'sm:row-span-2',
  '',
  '',
];

const TILES = Array.from({ length: 70 }, (_, i) => ({
  num: i + 1,
  src: `/images/gallery/${String(i + 1).padStart(2, '0')}.jpg`,
  span: SPAN_PATTERN[i % SPAN_PATTERN.length],
}));

const LIGHTBOX_IMAGES: LightboxImage[] = TILES.map((t) => ({
  src: t.src,
  alt: `Gallery photo ${t.num}`,
}));

export function GalleryGrid() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const total = TILES.length;

  const handleClose = useCallback(() => setOpenIndex(null), []);
  const handlePrev = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i - 1 + total) % total)),
    [total]
  );
  const handleNext = useCallback(
    () => setOpenIndex((i) => (i === null ? null : (i + 1) % total)),
    [total]
  );

  return (
    <>
      <motion.div
        variants={staggerFast}
        initial="hidden"
        animate="visible"
        className="grid auto-rows-[160px] grid-cols-2 gap-4 sm:grid-cols-4"
        style={{ perspective: 1600 }}
      >
        {TILES.map((tile, i) => (
          <motion.button
            type="button"
            key={tile.num}
            onClick={() => setOpenIndex(i)}
            variants={fadeUp}
            whileHover={{ scale: 1.03, y: -4, rotateY: 6, rotateX: -3 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            aria-label={`Open photo ${tile.num} of ${total}`}
            className={cn(
              'group relative cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 text-left focus-visible:outline-2 focus-visible:outline-offset-2',
              tile.span
            )}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Image
              src={tile.src}
              alt={`Gallery photo ${tile.num}`}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Bottom veil for hover legibility */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/55 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
            />
            {/* Frame index */}
            <span
              aria-hidden
              className="font-accent absolute bottom-3 left-3 text-[0.7rem] uppercase tracking-[0.25em] text-[var(--text-secondary)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            >
              № {String(tile.num).padStart(2, '0')}
            </span>
          </motion.button>
        ))}
      </motion.div>

      <Lightbox
        images={LIGHTBOX_IMAGES}
        index={openIndex}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
}
