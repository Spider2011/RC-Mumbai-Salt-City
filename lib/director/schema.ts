/**
 * Shared types + constants for the director portal. Safe to import from both
 * server and client (no server-only APIs here).
 */

/** The eleven avenues of service — kept in sync with lib/constants AVENUES. */
export const AVENUE_OPTIONS = [
  'Club Service',
  'Community Service',
  'Professional Development',
  'International Service',
  'PR and Marketing',
  'Digital Communication',
  'Entrepreneurship Development',
  'Editor',
  'Partners-In-Service',
  'Sports',
  'Social Media',
] as const;

export type Avenue = (typeof AVENUE_OPTIONS)[number];

export const MAX_REPORT_PHOTOS = 8;

/** Portal roles: directors submit reports; core members review all of them. */
export type MemberRole = 'director' | 'core';

/** A director's saved project report, as read back for their dashboard. */
export interface ProjectReportRow {
  id: string;
  title: string;
  avenue: string;
  project_date: string | null;
  created_at: string;
}

/** A full report row plus resolved (signed) photo URLs — for the core review view. */
export interface ProjectReportDetail {
  id: string;
  director_name: string;
  avenue: string;
  title: string;
  project_date: string | null;
  location: string | null;
  beneficiaries: number | null;
  description: string;
  created_at: string;
  photoUrls: string[];
}

/** Result shape returned by the submitReport server action. */
export interface ReportResult {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
}

/**
 * Validates a raw report payload. Returns cleaned values or a field-keyed
 * error map. Kept dependency-free and explicit so the same rules can run on
 * the client (for instant feedback) and the server (as the real gate).
 */
export function validateReport(raw: {
  title: string;
  avenue: string;
  projectDate: string;
  location: string;
  beneficiaries: string;
  description: string;
}): { ok: true; value: CleanReport } | { ok: false; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const title = raw.title.trim();
  const description = raw.description.trim();
  const location = raw.location.trim();

  if (title.length < 3) errors.title = 'Give the project a title (at least 3 characters).';
  if (title.length > 160) errors.title = 'Title is too long (max 160 characters).';
  if (!AVENUE_OPTIONS.includes(raw.avenue as Avenue)) errors.avenue = 'Choose an avenue.';
  if (!raw.projectDate) errors.projectDate = 'Add the date of the project.';
  if (description.length < 20)
    errors.description = 'Describe the project in a little more detail (at least 20 characters).';
  if (description.length > 4000) errors.description = 'Description is too long (max 4000 characters).';

  const beneficiaries = raw.beneficiaries === '' ? 0 : Number(raw.beneficiaries);
  if (!Number.isInteger(beneficiaries) || beneficiaries < 0 || beneficiaries > 1_000_000)
    errors.beneficiaries = 'Enter a whole number of people reached (or leave it blank).';

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { title, avenue: raw.avenue as Avenue, projectDate: raw.projectDate, location, beneficiaries, description },
  };
}

export interface CleanReport {
  title: string;
  avenue: Avenue;
  projectDate: string;
  location: string;
  beneficiaries: number;
  description: string;
}
