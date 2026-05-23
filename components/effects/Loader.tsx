'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { drawPath } from '@/lib/motion';

/**
 * Initial site loader: a Sanskrit "ॐ"-inspired glyph drawn stroke-by-stroke
 * via SVG pathLength, then fades to reveal the site.
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
          <div className="flex flex-col items-center gap-6">
            <svg viewBox="0 0 200 200" className="h-32 w-32">
              {/* Decorative ring */}
              <motion.circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke="rgba(212,175,55,0.5)"
                strokeWidth="0.75"
                variants={drawPath}
                initial="hidden"
                animate="visible"
              />
              {/* Stylized Aum / lotus glyph */}
              <motion.path
                d="M70 110 Q60 80 90 80 Q120 80 110 110 Q105 130 80 125 M110 95 Q140 85 145 115 Q148 140 120 135 M100 70 Q105 55 120 60"
                fill="none"
                stroke="var(--accent-gold)"
                strokeWidth="2.5"
                strokeLinecap="round"
                variants={drawPath}
                initial="hidden"
                animate="visible"
              />
              <motion.circle
                cx="135"
                cy="62"
                r="4"
                fill="var(--accent-gold)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: 1.8, duration: 0.4 } }}
              />
            </svg>
            <motion.p
              className="font-sanskrit text-sm tracking-widest text-[var(--accent-gold)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 1.4, duration: 0.6 } }}
            >
              अन्त अस्ति प्रारम्भ
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
