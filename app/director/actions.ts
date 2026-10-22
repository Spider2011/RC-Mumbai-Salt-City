'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { adminAuth } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { SESSION_COOKIE, sessionCookieOptions, signInWithPassword, verifySession } from '@/lib/firebase/session';
import { getMember } from '@/lib/director/dal';
import { canDeleteReport } from '@/lib/director/access';
import { createReport, removeReport } from '@/lib/director/reports';
import { validateReport, type ReportResult } from '@/lib/director/schema';

export interface LoginState {
  error?: string;
}

/** Sign a member in with email + password. Redirects to the portal on success. */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) return { error: 'Enter your email and password.' };
  if (!isFirebaseConfigured()) return { error: 'The portal is not connected yet.' };

  const result = await signInWithPassword(email, password);
  if (!result.ok) {
    return {
      error: result.error === 'throttled' ? 'Too many attempts. Wait a few minutes and try again.' : 'Invalid email or password.',
    };
  }

  (await cookies()).set(SESSION_COOKIE, result.cookie, sessionCookieOptions());
  redirect('/director');
}

/** Sign out: ends this member's sessions everywhere, then clears the cookie. */
export async function logout(): Promise<void> {
  const store = await cookies();
  const decoded = await verifySession(store.get(SESSION_COOKIE)?.value, false);
  if (decoded) await adminAuth().revokeRefreshTokens(decoded.uid).catch(() => undefined);
  store.delete(SESSION_COOKIE);
  redirect('/director/login');
}

export interface DeleteResult {
  ok: boolean;
  error?: string;
}

/** Delete a project report with its photos and document. Admins (President / Secretary) only. */
export async function deleteReport(reportId: string): Promise<DeleteResult> {
  const member = await getMember();
  if (!canDeleteReport(member)) return { ok: false, error: 'You are not allowed to delete reports.' };
  // Firestore ids, or the UUIDs kept from the Supabase migration.
  if (!/^[A-Za-z0-9-]{1,40}$/.test(reportId)) return { ok: false, error: 'Missing report id.' };

  const removed = await removeReport(reportId).catch(() => false);
  if (!removed) return { ok: false, error: 'Could not delete the report. Please try again.' };

  revalidatePath('/director');
  return { ok: true };
}

export interface PasswordState {
  ok?: boolean;
  error?: string;
}

/**
 * Set a new password for the signed-in member. Firebase revokes existing
 * sessions on a password change, so we sign in again with the new password to
 * keep this browser signed in.
 */
export async function changePassword(_prev: PasswordState, formData: FormData): Promise<PasswordState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (password !== confirm) return { error: 'The two passwords do not match.' };

  const store = await cookies();
  const decoded = await verifySession(store.get(SESSION_COOKIE)?.value, true);
  if (!decoded?.email) return { error: 'Your session has expired. Please sign in again.' };

  try {
    await adminAuth().updateUser(decoded.uid, { password });
  } catch {
    return { error: 'Could not update your password. Please try again.' };
  }

  const fresh = await signInWithPassword(decoded.email, password);
  if (fresh.ok) store.set(SESSION_COOKIE, fresh.cookie, sessionCookieOptions());
  return { ok: true };
}

/**
 * Save a project report for the signed-in member. Photos and the document are
 * uploaded first (chunked, via /api/director/files); their ids arrive here.
 * Re-validates on the server, which is the real gate.
 */
export async function submitReport(formData: FormData): Promise<ReportResult> {
  const director = await getMember();

  const result = validateReport({
    title: String(formData.get('title') ?? ''),
    avenue: String(formData.get('avenue') ?? ''),
    projectDate: String(formData.get('projectDate') ?? ''),
    location: String(formData.get('location') ?? ''),
    beneficiaries: String(formData.get('beneficiaries') ?? ''),
    description: String(formData.get('description') ?? ''),
  });
  if (!result.ok) return { ok: false, errors: result.errors };

  const reportDocId = String(formData.get('reportDoc') ?? '').trim();
  if (!reportDocId) return { ok: false, errors: { reportDoc: 'Please attach your report document.' } };

  const photoIds = formData.getAll('photoIds').map(String).filter(Boolean);
  const saved = await createReport(director, result.value, photoIds, reportDocId).catch(() => null);
  if (!saved) return { ok: false, message: 'Could not save your report. Please try again.' };
  if (!saved.ok) {
    return saved.field === 'reportDoc' ? { ok: false, errors: { reportDoc: saved.message } } : { ok: false, message: saved.message };
  }

  revalidatePath('/director');
  return { ok: true };
}
