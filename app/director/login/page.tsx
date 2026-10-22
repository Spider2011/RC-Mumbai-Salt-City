import { redirect } from 'next/navigation';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { getMemberOrNull } from '@/lib/director/dal';
import { PortalShell } from '../PortalShell';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function DirectorLoginPage() {
  const configured = isFirebaseConfigured();

  // Already signed in? Skip straight to the portal.
  if (configured && (await getMemberOrNull())) redirect('/director');

  return (
    <PortalShell>
      <LoginForm configured={configured} />
    </PortalShell>
  );
}
