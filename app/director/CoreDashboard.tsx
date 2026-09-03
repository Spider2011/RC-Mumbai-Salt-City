'use client';

import { LogOut, Users } from 'lucide-react';
import type { ProjectReportDetail } from '@/lib/director/schema';
import type { MemberSession } from '@/lib/director/dal';
import { logout } from './actions';
import { ReportsReview } from './ReportsReview';
import { ChangePassword } from './ChangePassword';

interface Props {
  member: MemberSession;
  reports: ProjectReportDetail[];
}

export function CoreDashboard({ member, reports }: Props) {
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

      <ReportsReview reports={reports} showAvenueFilter />

      <ChangePassword />
    </div>
  );
}
