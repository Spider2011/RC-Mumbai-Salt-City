import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { db } from '@/lib/firebase/admin';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { SESSION_COOKIE, verifySession } from '@/lib/firebase/session';
import type { MemberRole } from '@/lib/director/schema';

export interface MemberSession {
  userId: string;
  email: string;
  fullName: string;
  avenue: string;
  role: MemberRole;
  /** President / Secretary — may delete reports. */
  isAdmin: boolean;
}

/**
 * The portal's Data Access Layer. Verifies the Firebase session cookie
 * (including revocation, so signing out ends the session everywhere) and loads
 * the member profile from `members/{uid}`. Memoized per request.
 */
export const getMemberOrNull = cache(async (): Promise<MemberSession | null> => {
  if (!isFirebaseConfigured()) return null;
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
  const decoded = await verifySession(cookie, true);
  if (!decoded) return null;

  const profile = (await db().collection('members').doc(decoded.uid).get()).data() ?? {};
  return {
    userId: decoded.uid,
    email: decoded.email ?? '',
    fullName: typeof profile.fullName === 'string' && profile.fullName ? profile.fullName : decoded.email ?? 'Member',
    avenue: typeof profile.avenue === 'string' ? profile.avenue : '',
    role: profile.role === 'core' ? 'core' : 'director',
    isAdmin: profile.isAdmin === true,
  };
});

/** Like getMemberOrNull, but sends anyone without a valid session to the login page. */
export const getMember = cache(async (): Promise<MemberSession> => {
  const member = await getMemberOrNull();
  if (!member) redirect('/director/login');
  return member;
});
