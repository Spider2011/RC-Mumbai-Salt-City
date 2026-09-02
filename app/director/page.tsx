import { getMember } from '@/lib/director/dal';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProjectReportDetail, ProjectReportRow } from '@/lib/director/schema';
import { DirectorDashboard } from './DirectorDashboard';
import { CoreDashboard } from './CoreDashboard';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL = 60 * 60; // 1 hour

export default async function DirectorHomePage() {
  const member = await getMember();
  const supabase = await createSupabaseServerClient();

  // Directors: their own reports + the submit form.
  if (member.role !== 'core') {
    const { data } = await supabase
      .from('project_reports')
      .select('id, title, avenue, project_date, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    return <DirectorDashboard director={member} reports={(data ?? []) as ProjectReportRow[]} />;
  }

  // Core members: every report (RLS allows it), with signed photo URLs resolved.
  const { data } = await supabase
    .from('project_reports')
    .select(
      'id, director_name, avenue, title, project_date, location, beneficiaries, description, photo_paths, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data ?? []) as Array<Omit<ProjectReportDetail, 'photoUrls'> & { photo_paths: string[] }>;

  const reports: ProjectReportDetail[] = await Promise.all(
    rows.map(async ({ photo_paths, ...rest }) => {
      const paths = photo_paths ?? [];
      let photoUrls: string[] = [];
      if (paths.length > 0) {
        const { data: signed } = await supabase.storage
          .from('project-reports')
          .createSignedUrls(paths, SIGNED_URL_TTL);
        photoUrls = (signed ?? [])
          .map((s) => s.signedUrl)
          .filter((u): u is string => Boolean(u));
      }
      return { ...rest, photoUrls };
    })
  );

  return <CoreDashboard member={member} reports={reports} />;
}
