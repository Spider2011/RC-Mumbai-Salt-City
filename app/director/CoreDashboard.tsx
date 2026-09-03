'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Users, Plus, X } from 'lucide-react';
import type { ProjectReportDetail } from '@/lib/director/schema';
import type { MemberSession } from '@/lib/director/dal';
import { logout } from './actions';
import { ReportsReview } from './ReportsReview';
import { ChangePassword } from './ChangePassword';
import { ReportForm } from './ReportForm';

interface Props {
  member: MemberSession;
  reports: ProjectReportDetail[];
}

export function CoreDashboard({ member, reports }: Props) {
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    if (!reportOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setReportOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [reportOpen]);

  return (
    <div className="grid gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Core team · signed in as</p>
          <h1 className="font-display text-2xl font-light text-[var(--text-primary)]">
            {member.fullName}
          </h1>
          <p className="flex items-center gap-1.5 text-sm text-[var(--accent-gold)]">
            <Users className="h-3.5 w-3.5" /> Viewing all avenue reports
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="flex items-center gap-2 rounded-full border border-[var(--accent-gold)]/50 bg-[var(--accent-gold)]/10 px-4 py-2 text-sm text-[var(--text-primary)] transition-colors hover:border-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/15"
          >
            <Plus className="h-4 w-4 text-[var(--accent-gold)]" />
            New report
          </button>
          <ChangePassword />
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:border-white/30 hover:text-[var(--text-primary)]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      <ReportsReview reports={reports} showAvenueFilter />

      {/* Submit-a-report modal */}
      <AnimatePresence>
        {reportOpen && (
          <motion.div
            className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReportOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Report a project"
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
                onClick={() => setReportOpen(false)}
                aria-label="Close"
                className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/10 hover:text-[var(--text-primary)]"
              >
                <X className="h-5 w-5" />
              </button>
              <ReportForm member={member} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
