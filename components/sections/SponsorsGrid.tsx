import Image from 'next/image';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import { GoldDivider } from '@/components/ui/GoldDivider';
import type { EventSponsorRow } from '@/types';

interface SponsorsGridProps {
  rows: EventSponsorRow[];
}

const ROW_CONFIG = [
  { cardClass: 'w-[200px] h-[125px] sm:w-[240px] sm:h-[150px]', gap: 'gap-4 sm:gap-6' },
  { cardClass: 'w-[140px] h-[88px] sm:w-[180px] sm:h-[112px]', gap: 'gap-4 sm:gap-6' },
  { cardClass: 'w-[95px] h-[62px] sm:w-[140px] sm:h-[90px]',   gap: 'gap-2 sm:gap-6' },
  { cardClass: 'w-[130px] h-[82px] sm:w-[160px] sm:h-[100px]', gap: 'gap-4 sm:gap-6' },
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
              <div className={`flex flex-nowrap items-end justify-center ${cfg.gap}`}>
                {row.sponsors.map((sponsor, sIdx) => (
                  <div key={sIdx} className="group flex flex-col items-center gap-2">
                    <div
                      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white shadow-md transition-transform duration-300 group-hover:-translate-y-1 ${cfg.cardClass}`}
                    >
                      <Image
                        src={sponsor.logo}
                        alt={sponsor.tier}
                        fill
                        className="object-contain p-2 sm:p-4"
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
