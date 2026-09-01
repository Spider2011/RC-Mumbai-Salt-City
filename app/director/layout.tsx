import type { Metadata } from 'next';

/**
 * The whole /director section is hidden: not linked anywhere in the site, and
 * marked noindex so it never shows up in search engines. Reachable only by
 * directly visiting the URL and signing in.
 */
export const metadata: Metadata = {
  title: 'Director Portal',
  robots: { index: false, follow: false },
};

export default function DirectorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative z-[10] min-h-dvh px-6 py-28">
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </div>
  );
}
