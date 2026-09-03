'use client';

import { ClipboardList, LogOut } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import type { ProjectReportDetail } from '@/lib/director/schema';
import type { MemberSession } from '@/lib/director/dal';
import { logout } from './actions';
import { ReportForm } from './ReportForm';
import { ReportsReview } from './ReportsReview';
import { ChangePassword } from './ChangePassword';

interface Props {
  director: MemberSession;
  reports: ProjectReportDetail[];
}

export function DirectorDashboard({ director, reports }: Props) {
  return (
    <div className="grid gap-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-muted)]">Signed in as</p>
          <h1 className="font-display text-2xl font-light text-[var(--text-primary)]">
            {director.fullName}
          </h1>
          {director.avenue && <p className="text-sm text-[var(--accent-gold)]">{director.avenue}</p>}
        </div>
        <div className="flex items-center gap-2">
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

      {/* Report form */}
      <GlassCard className="p-8 md:p-10" tilt={false} variant="heavy">
        <ReportForm member={director} />
      </GlassCard>

      {/* Avenue reports — review own + fellow directors' reports in this avenue */}
      <div>
        <h2 className="font-display mb-4 flex items-center gap-2 text-lg font-light text-[var(--text-primary)]">
          <ClipboardList className="h-5 w-5 text-[var(--accent-gold)]" />
          {director.avenue ? `Reports in ${director.avenue}` : 'Your reports'}
        </h2>
        <ReportsReview reports={reports} emptyText="No reports in your avenue yet — your first one will show here." />
      </div>
    </div>
  );
}
