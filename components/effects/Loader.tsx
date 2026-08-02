'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Initial site loader: the year's "Aant Asti Prarambh" calligraphy logo scales
 * in over a soft gold glow while a gold ring spins around it, then fades to
 * reveal the site.
 */
export function Loader() {
  const reduceMotion = useReducedMotion();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), reduceMotion ? 400 : 2600);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="loading-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeOut' } }}
        >
          <motion.div
            className="relative flex items-center justify-center"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.85 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: reduceMotion ? 0.3 : 0.9, ease: [0.16, 1, 0.3, 1] },
            }}
          >
            {/* Soft gold glow behind the mark */}
            <span
              aria-hidden
              className="pointer-events-none absolute h-[130%] w-[130%] rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 68%)',
              }}
            />

            {/* Spinning gold ring — the loading indicator */}
            {!reduceMotion && (
              <motion.span
                aria-hidden
                className="absolute h-[124%] w-[124%] rounded-full border border-white/5"
                style={{ borderTopColor: 'var(--accent-gold)', borderRightColor: 'rgba(212,175,55,0.35)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              />
            )}

            {/* Year logo (calligraphy on transparent bg) */}
            <Image
              src="/images/loader/aant-logo.png"
              alt="अन्त अस्ति प्रारम्भ — Aant Asti Prarambh"
              width={640}
              height={640}
              priority
              className="relative h-40 w-40 md:h-48 md:w-48"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
