'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { fadeUp, staggerFast } from '@/lib/motion';
import { Lightbox, type LightboxImage } from '@/components/effects/Lightbox';

interface EventGalleryProps {
  images: string[];
  eventTitle: string;
}

/**
 * Photo gallery shown on a past event's detail page. Masonry-ish grid of
 * tiles that open a full-screen lightbox with prev/next/keyboard nav.
 */
export function EventGallery({ images, eventTitle }: EventGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const total = images.length;

  const lightboxImages: LightboxImage[] = images.map((src, i) => ({
    src,
    alt: `${eventTitle} — photo ${i + 1}`,
  }));

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
      {/* Horizontal scroll — 2 rows, ~3 columns visible per viewport. */}
      <motion.div
        variants={staggerFast}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-8% 0px' }}
        className="event-gallery-scroll -mx-6 grid grid-flow-col grid-rows-2 gap-4 overflow-x-auto px-6 pb-4"
      >
        {images.map((src, i) => (
          <motion.button
            type="button"
            key={src}
            onClick={() => setOpenIndex(i)}
            variants={fadeUp}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
            aria-label={`Open photo ${i + 1} of ${total}`}
            className="group relative aspect-[4/3] w-[70vw] cursor-zoom-in overflow-hidden rounded-2xl border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-[42vw] lg:w-[calc((53rem-2rem)/3)]"
          >
            <Image
              src={src}
              alt={`${eventTitle} — photo ${i + 1}`}
              fill
              sizes="(min-width: 1024px) 24rem, (min-width: 640px) 42vw, 70vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/50 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100"
            />
          </motion.button>
        ))}
      </motion.div>
      <p className="mt-3 px-1 text-xs text-[var(--text-muted)]">
        Scroll sideways to see all {total} photos →
      </p>

      <Lightbox
        images={lightboxImages}
        index={openIndex}
        onClose={handleClose}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </>
  );
}
