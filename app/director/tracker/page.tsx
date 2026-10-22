import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Cinzel, Cormorant_Garamond, IBM_Plex_Sans, Noto_Serif_Devanagari } from 'next/font/google';
import { getMember } from '@/lib/director/dal';
import { canUseTracker } from '@/lib/director/access';
import { IdleLogout } from '../IdleLogout';
import { TrackerLoader } from './TrackerLoader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project tracker',
  description: 'Core team project calendar for RY 2026–27: leads, dates and checklists.',
};

const cinzel = Cinzel({ subsets: ['latin'], weight: ['500', '700'], variable: '--tr-font-display', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--tr-font-serif', display: 'swap' });
const plex = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--tr-font-sans', display: 'swap' });
const deva = Noto_Serif_Devanagari({ subsets: ['devanagari'], weight: ['500'], variable: '--tr-font-deva', display: 'swap' });

/** Core team only: directors are sent back to the portal, signed-out visitors to the login page. */
export default async function TrackerPage() {
  const member = await getMember();
  if (!canUseTracker(member)) redirect('/director');

  return (
    <>
      <IdleLogout />
      <TrackerLoader
        fontClassName={[cinzel.variable, cormorant.variable, plex.variable, deva.variable].join(' ')}
        memberName={member.fullName}
      />
    </>
  );
}
