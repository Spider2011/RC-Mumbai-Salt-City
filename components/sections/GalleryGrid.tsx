'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { fadeUp, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';

// 12 placeholder tiles with editorial mosaic spans.
// Replace placeholder divs with actual images later. Paths go in /public/images/gallery/
const TILES = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  span:
    i === 0 ? 'sm:col-span-2 sm:row-span-2' : i === 5 ? 'sm:row-span-2' : i === 8 ? 'sm:col-span-2' : '',
}));

export function GalleryGrid() {
  return (
    <motion.div
      variants={staggerFast}
      initial="hidden"
      animate="visible"
      className="grid auto-rows-[160px] grid-cols-2 gap-4 sm:grid-cols-4"
    >
      {TILES.map((tile) => (
        <motion.div
          key={tile.id}
          variants={fadeUp}
          whileHover={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className={cn(
            'group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10',
            tile.span
          )}
          style={{
            background: 'linear-gradient(135deg, rgba(132,94,194,0.2), rgba(44,115,210,0.2))',
            backdropFilter: 'blur(10px)',
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-[var(--text-muted)]">
            <Camera className="h-6 w-6" strokeWidth={1.5} />
            <span className="text-xs tracking-wide">[Photo Placeholder]</span>
          </div>
          <div className="absolute inset-0 bg-[var(--bg-primary)]/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100" />
        </motion.div>
      ))}
    </motion.div>
  );
}
