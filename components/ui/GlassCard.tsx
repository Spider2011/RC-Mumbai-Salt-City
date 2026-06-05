'use client';

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { springSnappy } from '@/lib/motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  /** Enable 3D mouse-tracked tilt (desktop). Default true. */
  tilt?: boolean;
  /** Enable hover lift + glow. Default true. */
  hover?: boolean;
  /** Glass intensity */
  variant?: 'default' | 'heavy' | 'subtle';
  /** Optional accent color for glow */
  glowColor?: string;
}

export function GlassCard({
  children,
  className,
  tilt = true,
  hover = true,
  variant = 'default',
  glowColor,
}: GlassCardProps) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt — mouse-tracked rotation with spring smoothing.
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springSnappy);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springSnappy);

  // Reactive specular highlight that follows the cursor.
  const glareX = useTransform(mouseX, [-0.5, 0.5], ['10%', '90%']);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ['10%', '90%']);

  const enableTilt = tilt && !reduceMotion;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!enableTilt || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const glassClass =
    variant === 'heavy' ? 'glass-heavy' : variant === 'subtle' ? 'glass-subtle' : 'glass';

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={
        enableTilt
          ? { rotateX, rotateY, transformStyle: 'preserve-3d', transformPerspective: 1100 }
          : undefined
      }
      whileHover={
        hover && !reduceMotion
          ? { scale: 1.025, y: -6, transition: springSnappy }
          : undefined
      }
      className={cn(
        glassClass,
        'glass-glow relative overflow-hidden rounded-2xl',
        glowColor && 'transition-shadow duration-300',
        className
      )}
    >
      {/* Accent glow at top */}
      {glowColor && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${glowColor}33, transparent 70%)`,
          }}
        />
      )}

      {/* Cursor-tracked specular highlight (desktop tilt only) */}
      {enableTilt && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]: string[]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.10), transparent 45%)`
            ),
          }}
        />
      )}

      {children}
    </motion.div>
  );
}
