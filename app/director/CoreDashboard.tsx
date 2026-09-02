'use client';

import { useMemo, useState } from 'react';
import { LogOut, Users, MapPin, CalendarDays, ImageOff } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AVENUE_OPTIONS, type ProjectReportDetail } from '@/lib/director/schema';
import type { MemberSession } from '@/lib/director/dal';
import { logout } from './actions';

interface Props {
  member: MemberSession;
  reports: ProjectReportDetail[];
}

const ALL = 'All avenues';

export function CoreDashboard({ member, reports }: Props) {
  const [avenue, setAvenue] = useState<string>(ALL);

  const filtered = useMemo(
    () => (avenue === ALL ? reports : reports.filter((r) => r.avenue === avenue)),
    [avenue, reports]
  );

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

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {[ALL, ...AVENUE_OPTIONS].map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAvenue(a)}
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              avenue === a
                ? 'border-[var(--accent-gold)]/60 bg-[var(--accent-gold)]/10 text-[var(--text-primary)]'
                : 'border-white/12 text-[var(--text-secondary)] hover:border-white/30'
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Reports */}
      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">No reports here yet.</p>
      ) : (
        <div className="grid gap-5">
          {filtered.map((r) => (
            <GlassCard key={r.id} className="p-6" tilt={false}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-display text-xl font-light text-[var(--text-primary)]">
                    {r.title}
                  </h2>
                  <p className="mt-0.5 text-sm text-[var(--accent-gold)]">{r.avenue}</p>
                </div>
                <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-[var(--text-secondary)]">
                  {r.director_name}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {r.project_date ?? new Date(r.created_at).toLocaleDateString()}
                </span>
                {r.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {r.location}
                  </span>
                )}
                {typeof r.beneficiaries === 'number' && r.beneficiaries > 0 && (
                  <span>{r.beneficiaries.toLocaleString()} reached</span>
                )}
              </div>

              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                {r.description}
              </p>

              {r.photoUrls.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                  {r.photoUrls.map((url, i) => (
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
                        alt={`${r.title} photo ${i + 1}`}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="mt-4 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                  <ImageOff className="h-3.5 w-3.5" /> No photos attached
                </p>
              )}
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
