'use client';

import { motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LightboxImage {
  src: string;
  alt?: string;
}

interface LightboxProps {
  images: LightboxImage[];
  /** Currently-open image index, or null when closed. */
  index: number | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * Full-screen modal that opens a single photo with prev/next/close.
 *  - Keyboard: Esc closes, ←/→ navigate
 *  - Click backdrop to close
 *  - Body scroll locked while open
 *
 * The dialog is always mounted and animates opacity/pointer-events,
 * which avoids AnimatePresence unmount issues with nested motion children.
 */
export function Lightbox({ images, index, onClose, onPrev, onNext }: LightboxProps) {
  const reduceMotion = useReducedMotion();
  const open = index !== null;
  const current = open && index !== null ? images[index] : null;
  const total = images.length;

  // Portal mount — escapes any transformed ancestor (PageTransition's motion.div
  // applies a scale transform, which makes `position: fixed` relative to it
  // instead of the viewport. Rendering at document.body fixes the offset bug.
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') onPrev();
      else if (e.key === 'ArrowRight') onNext();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, onPrev, onNext]);

  // Lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!portalRoot) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-opacity duration-200 ease-out md:p-8 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      role="dialog"
      aria-modal={open}
      aria-hidden={!open}
      aria-label={open && index !== null ? `Photo ${index + 1} of ${total}` : undefined}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close lightbox"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className="absolute inset-0 cursor-zoom-out bg-[var(--bg-primary)]/92 backdrop-blur-xl"
      />

      {current && index !== null && (
        <>
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close (Esc)"
            className="glass glass-glow absolute right-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--accent-gold)] md:right-6 md:top-6"
          >
            <X className="h-5 w-5" strokeWidth={1.6} />
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={onPrev}
            aria-label="Previous photo (Left arrow)"
            className="glass glass-glow absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--accent-gold)] md:left-6"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.6} />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={onNext}
            aria-label="Next photo (Right arrow)"
            className="glass glass-glow absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--accent-gold)] md:right-6"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.6} />
          </button>

          {/* Image — re-mounts with entry animation on frame change */}
          <motion.div
            key={current.src}
            className="relative z-[1] flex max-h-[86vh] max-w-[92vw] items-center justify-center"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            <Image
              src={current.src}
              alt={current.alt || `Gallery photo ${index + 1}`}
              width={1600}
              height={1200}
              sizes="92vw"
              className="max-h-[86vh] w-auto rounded-xl object-contain shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65)]"
              priority
            />
          </motion.div>

          {/* Frame index */}
          <div className="font-accent absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-[var(--text-muted)] md:bottom-7 md:text-[0.7rem]">
            <span className="h-px w-6 bg-current opacity-40" />
            <span>
              № {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </span>
            <span className="h-px w-6 bg-current opacity-40" />
          </div>
        </>
      )}
    </div>,
    portalRoot
  );
}
