import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase/config';

/**
 * Proxy (Next.js 16's renamed Middleware). Scoped by `config.matcher` to run
 * ONLY on /director routes, so the rest of the public site is untouched.
 *
 * It does two things for the director portal:
 *   1. Refreshes the Supabase auth session cookie on each request.
 *   2. Redirects unauthenticated visitors to the (unlinked) login page.
 *
 * Every response is marked `no-store` so the CDN never caches an authenticated
 * page or, critically, its `Set-Cookie` header — otherwise one signed-in user's
 * session could be served to every other visitor.
 */
function noStore(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
  return res;
}

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === '/director/login') return noStore(NextResponse.next());

  // Portal not wired up yet — send everything to the login page, which shows
  // a setup notice instead of crashing.
  if (!isSupabaseConfigured()) {
    return noStore(NextResponse.redirect(new URL('/director/login', request.url)));
  }

  let response = NextResponse.next({ request });
  const { url, anonKey } = getSupabaseConfig();

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return noStore(NextResponse.redirect(new URL('/director/login', request.url)));
  }

  return noStore(response);
}

export const config = {
  matcher: ['/director/:path*'],
};
