import Image from 'next/image';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { GoldDivider } from '@/components/ui/GoldDivider';
import type { EventSponsorRow } from '@/types';

interface SponsorsGridProps {
  rows: EventSponsorRow[];
}

const ROW_CONFIG = [
  { cardClass: 'w-[240px] h-[150px]' },
  { cardClass: 'w-[180px] h-[112px]' },
  { cardClass: 'w-[140px] h-[90px]' },
  { cardClass: 'w-[160px] h-[100px]' },
];

export function SponsorsGrid({ rows }: SponsorsGridProps) {
  return (
    <div className="mt-12">
      <GoldDivider className="mb-12" animate />

      <ScrollReveal>
        <h2 className="font-display mb-2 text-center text-3xl font-light text-[var(--text-primary)]">
          Our Sponsors
        </h2>
        <p className="mb-10 text-center text-sm text-[var(--text-secondary)]">
          Thank you to the partners who make this night possible.
        </p>
      </ScrollReveal>

      <div className="flex flex-col items-center gap-8">
        {rows.map((row, rowIdx) => {
          const cfg = ROW_CONFIG[rowIdx] ?? ROW_CONFIG[ROW_CONFIG.length - 1];
          return (
            <ScrollReveal key={rowIdx}>
              <div className="flex flex-wrap items-end justify-center gap-6">
                {row.sponsors.map((sponsor, sIdx) => (
                  <div key={sIdx} className="group flex flex-col items-center gap-2">
                    <div
                      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white shadow-md transition-transform duration-300 group-hover:-translate-y-1 ${cfg.cardClass}`}
                    >
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.tier}
                        fill
                        className="object-contain p-4"
                        sizes="260px"
                      />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--accent-gold)]">
                      {sponsor.tier}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}
