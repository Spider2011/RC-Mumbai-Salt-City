/**
 * Who may see what in the director portal. Pure functions (no I/O) shared by
 * pages and API routes; these replace the old Supabase row-level policies:
 *   • directors read their own reports and any report in their avenue
 *   • core members read everything
 *   • only admins (President / Secretary) delete
 */
import type { MemberRole } from './schema';

export interface Viewer {
  userId: string;
  role: MemberRole;
  avenue: string;
  isAdmin: boolean;
}

export function canReadReport(viewer: Viewer, report: { directorId: string; avenue: string }): boolean {
  return (
    report.directorId === viewer.userId ||
    viewer.role === 'core' ||
    (viewer.avenue !== '' && viewer.avenue === report.avenue)
  );
}

/** A file is readable by its owner, by core, or by anyone in the owner's or its report's avenue. */
export function canReadFile(
  viewer: Viewer,
  file: { ownerId: string; ownerAvenue: string; reportAvenue: string | null },
): boolean {
  if (file.ownerId === viewer.userId || viewer.role === 'core') return true;
  if (viewer.avenue === '') return false;
  return viewer.avenue === file.ownerAvenue || viewer.avenue === file.reportAvenue;
}

export function canDeleteReport(viewer: Viewer): boolean {
  return viewer.isAdmin;
}

export function canUseTracker(viewer: Viewer): boolean {
  return viewer.role === 'core';
}
