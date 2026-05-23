'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { KONAMI, SHLOKA } from '@/lib/constants';

/**
 * Easter egg: Konami code (↑↑↓↓←→←→ B A) reveals the Īśopaniṣad invocation.
 * Also triggerable externally (mandala 7-clicks) via the `triggerShloka` event.
 */
export function ShlokaEasterEgg() {
  const [open, setOpen] = useState(false);

  const reveal = useCallback(() => setOpen(true), []);

  useEffect(() => {
    let buffer: string[] = [];

    function onKey(e: KeyboardEvent) {
      buffer.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
      buffer = buffer.slice(-KONAMI.length);
      if (KONAMI.every((k, i) => buffer[i] === k)) {
        reveal();
        buffer = [];
      }
      if (e.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener('triggerShloka', reveal as EventListener);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('triggerShloka', reveal as EventListener);
    };
  }, [reveal]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Sacred verse"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[var(--bg-primary)]/90 backdrop-blur-xl" />

          <motion.div
            className="glass-heavy glass-glow relative max-w-2xl rounded-3xl px-8 py-12 text-center md:px-14 md:py-16"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1, transition: { delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
              aria-label="Close verse"
            >
              <X className="h-5 w-5" />
            </button>

            <p className="font-sanskrit whitespace-pre-line text-[clamp(1.25rem,3vw,2rem)] leading-relaxed text-gradient-gold">
              {SHLOKA.devanagari}
            </p>
            <div className="gold-divider mx-auto my-7 w-24" />
            <p className="font-display whitespace-pre-line text-base italic text-[var(--text-secondary)]">
              {SHLOKA.transliteration}
            </p>
            <p className="font-display mt-7 whitespace-pre-line text-[clamp(1.1rem,2vw,1.4rem)] font-light leading-relaxed text-[var(--text-primary)]">
              {SHLOKA.translation}
            </p>
            <p className="eyebrow mt-7 justify-center">{SHLOKA.source}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
