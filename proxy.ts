import { NextResponse, type NextRequest } from 'next/server';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { SESSION_COOKIE, verifySession } from '@/lib/firebase/session';

/**
 * Proxy (Next.js 16's renamed Middleware), scoped by `config.matcher` to the
 * /director routes only. Sends anyone without a valid Firebase session cookie
 * to the (unlinked) login page. Pages re-check the session, including
 * revocation, through the DAL.
 *
 * Every response is `no-store` so the CDN never caches an authenticated page.
 */
function noStore(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  return res;
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/director/login') return noStore(NextResponse.next());

  const login = () => noStore(NextResponse.redirect(new URL('/director/login', request.url)));
  // Not wired up yet: the login page shows a setup notice instead of crashing.
  if (!isFirebaseConfigured()) return login();

  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, false);
  return session ? noStore(NextResponse.next()) : login();
}

export const config = {
  matcher: ['/director/:path*'],
};
