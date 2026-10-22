import { getMember } from '@/lib/director/dal';
import { listReportsFor } from '@/lib/director/reports';
import { DirectorDashboard } from './DirectorDashboard';
import { CoreDashboard } from './CoreDashboard';
import { IdleLogout } from './IdleLogout';
import { PortalShell } from './PortalShell';

export const dynamic = 'force-dynamic';

export default async function DirectorHomePage() {
  const member = await getMember();
  // Directors get their own and their avenue's reports; core members get every avenue's.
  const reports = await listReportsFor(member);

  return (
    <PortalShell>
      <IdleLogout />
      {member.role === 'core' ? (
        <CoreDashboard member={member} reports={reports} />
      ) : (
        <DirectorDashboard director={member} reports={reports} />
      )}
    </PortalShell>
  );
}
