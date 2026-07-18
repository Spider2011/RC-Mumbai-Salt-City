'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fadeUp, staggerFast } from '@/lib/motion';
import { Lightbox, type LightboxImage } from '@/components/effects/Lightbox';

interface EventGalleryProps {
  images: string[];
  eventTitle: string;
}

// Pixels per second the strip drifts on its own.
const AUTO_SCROLL_SPEED = 80;

/**
 * Photo gallery shown on a past event's detail page. A 2-row horizontal strip
 * that auto-scrolls continuously and loops. Pauses on hover / touch / focus,
 * respects prefers-reduced-motion, and opens a full-screen lightbox on click.
 */
export function EventGallery({ images, eventTitle }: EventGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const total = images.length;

  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  // Auto-scroll loop — drives scrollLeft each frame, wraps at the end.
  // Paused while the lightbox is open, on pointer/touch/focus, or reduced motion.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || reduceMotion) return;

    let raf = 0;
    let last = performance.now();

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const max = el.scrollWidth - el.clientWidth;
      if (!pausedRef.current && openIndex === null && max > 0) {
        let next = el.scrollLeft + AUTO_SCROLL_SPEED * dt;
        if (next >= max) next = 0; // loop back to the start
        el.scrollLeft = next;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reduceMotion, openIndex]);

  const pause = useCallback(() => {
    pausedRef.current = true;
  }, []);
  const resume = useCallback(() => {
    pausedRef.current = false;
  }, []);

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
      {/* Auto-scrolling horizontal strip — 2 rows, ~3 columns per viewport. */}
      <motion.div
        ref={scrollRef}
        variants={staggerFast}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-8% 0px' }}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        onFocusCapture={pause}
        onBlurCapture={resume}
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
        Auto-scrolling · hover to pause · {total} photos
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
