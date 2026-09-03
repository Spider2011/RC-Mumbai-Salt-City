'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CalendarDays, ImageOff, X, ArrowRight, FileText } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { SelectField } from '@/components/ui/FormField';
import { Portal } from '@/components/ui/Portal';
import { AVENUE_OPTIONS, type ProjectReportDetail } from '@/lib/director/schema';

interface Props {
  reports: ProjectReportDetail[];
  /** Show the avenue dropdown filter (core view spans all avenues). */
  showAvenueFilter?: boolean;
  emptyText?: string;
}

const ALL = 'All avenues';

function formatDate(r: ProjectReportDetail): string {
  return r.project_date ?? new Date(r.created_at).toLocaleDateString();
}

export function ReportsReview({ reports, showAvenueFilter = false, emptyText = 'No reports here yet.' }: Props) {
  const [avenue, setAvenue] = useState<string>(ALL);
  const [selected, setSelected] = useState<ProjectReportDetail | null>(null);

  const filtered = useMemo(
    () => (!showAvenueFilter || avenue === ALL ? reports : reports.filter((r) => r.avenue === avenue)),
    [avenue, reports, showAvenueFilter]
  );

  // Close the modal on Escape, and lock background scroll while it's open.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selected]);

  return (
    <div className="grid gap-4">
      {showAvenueFilter && (
        <div className="max-w-xs">
          <SelectField label="Filter by avenue" name="avenueFilter" value={avenue} onChange={setAvenue}>
            <option value={ALL}>{ALL}</option>
            {AVENUE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </SelectField>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">{emptyText}</p>
      ) : (
        <>
          <p className="text-xs text-[var(--text-muted)]">
            {filtered.length} {filtered.length === 1 ? 'report' : 'reports'}
          </p>
          {filtered.map((r) => (
            <button key={r.id} type="button" onClick={() => setSelected(r)} className="w-full text-left">
              <GlassCard className="p-5 transition-colors hover:border-[var(--accent-gold)]/30" tilt={false}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-display truncate text-lg font-light text-[var(--text-primary)]">
                      {r.title}
                    </h3>
                    <p className="mt-0.5 text-sm text-[var(--accent-gold)]">{r.avenue}</p>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/12 px-3 py-1 text-xs text-[var(--text-secondary)]">
                    {r.director_name}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(r)}
                  </span>
                  {r.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {r.location}
                    </span>
                  )}
                  {r.photoUrls.length > 0 && (
                    <span>
                      {r.photoUrls.length} photo{r.photoUrls.length === 1 ? '' : 's'}
                    </span>
                  )}
                  {r.reportDocUrl && (
                    <span className="flex items-center gap-1.5 text-[var(--accent-gold)]">
                      <FileText className="h-3.5 w-3.5" /> Report file
                    </span>
                  )}
                </div>

                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {r.description}
                </p>

                <span className="mt-3 inline-flex items-center gap-1 text-sm text-[var(--accent-gold)]">
                  View report <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </GlassCard>
            </button>
          ))}
        </>
      )}

      <Portal>
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            role="dialog"
            aria-modal="true"
            aria-label={selected.title}
          >
            <motion.div
              className="relative my-auto w-full max-w-2xl rounded-2xl border border-white/12 bg-[#0e1322] p-6 shadow-2xl sm:p-8"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>

              <p className="text-sm text-[var(--accent-gold)]">{selected.avenue}</p>
              <h2 className="font-display mt-1 pr-10 text-2xl font-light text-[var(--text-primary)]">
                {selected.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                <span className="rounded-full border border-white/12 px-3 py-1 text-[var(--text-secondary)]">
                  {selected.director_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDate(selected)}
                </span>
                {selected.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {selected.location}
                  </span>
                )}
                {typeof selected.beneficiaries === 'number' && selected.beneficiaries > 0 && (
                  <span>{selected.beneficiaries.toLocaleString()} reached</span>
                )}
              </div>

              <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                {selected.description}
              </p>

              {selected.reportDocUrl && (
                <a
                  href={selected.reportDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--accent-gold)]/40 bg-[var(--accent-gold)]/[0.06] px-4 py-2.5 text-sm text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-gold)]/10"
                >
                  <FileText className="h-4 w-4 text-[var(--accent-gold)]" />
                  Open full report file
                </a>
              )}

              {selected.photoUrls.length > 0 ? (
                <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {selected.photoUrls.map((url, i) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${selected.title} photo ${i + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-6 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <ImageOff className="h-3.5 w-3.5" /> No photos attached
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </div>
  );
}
