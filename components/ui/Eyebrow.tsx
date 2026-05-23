import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span className={cn('eyebrow inline-flex items-center gap-2', className)}>
      <span aria-hidden className="h-px w-6 bg-[var(--accent-gold)]/60" />
      {children}
    </span>
  );
}
