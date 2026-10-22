import 'server-only';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { adminAuth } from './admin';

export const SESSION_COOKIE = 'rcmsc_session';
/** Firebase's own lifetime for the session; the browser cookie itself ends on close. */
const SESSION_MS = 5 * 24 * 60 * 60 * 1000;

export type SignInResult = { ok: true; cookie: string; uid: string } | { ok: false; error: 'invalid' | 'throttled' };

/**
 * Checks an email + password with Firebase Auth (REST API, so no Firebase code
 * ships to the browser) and swaps the ID token for a session cookie value.
 */
export async function signInWithPassword(email: string, password: string): Promise<SignInResult> {
  const emulator = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const base = emulator ? `http://${emulator}/identitytoolkit.googleapis.com` : 'https://identitytoolkit.googleapis.com';
  const key = process.env.FIREBASE_WEB_API_KEY ?? 'emulator';

  const res = await fetch(`${base}/v1/accounts:signInWithPassword?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
    cache: 'no-store',
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
    return { ok: false, error: body?.error?.message?.startsWith('TOO_MANY_ATTEMPTS') ? 'throttled' : 'invalid' };
  }
  const { idToken, localId } = (await res.json()) as { idToken: string; localId: string };
  const cookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MS });
  return { ok: true, cookie, uid: localId };
}

/** Decodes a session cookie, or null if it is missing, expired or revoked. */
export async function verifySession(cookie: string | undefined, checkRevoked: boolean): Promise<DecodedIdToken | null> {
  if (!cookie) return null;
  try {
    return await adminAuth().verifySessionCookie(cookie, checkRevoked);
  } catch {
    return null;
  }
}

/** No maxAge/expires: a browser-session cookie, so members are signed out when the browser closes. */
export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}
