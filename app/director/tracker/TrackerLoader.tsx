'use client';

import dynamic from 'next/dynamic';

// Browser-only: the tracker restores saved filters from localStorage on first render.
const Tracker = dynamic(() => import('./Tracker'), { ssr: false });

export function TrackerLoader(props: { fontClassName: string; memberName: string }) {
  return <Tracker {...props} />;
}
