import { getMember } from '@/lib/director/dal';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProjectReportDetail } from '@/lib/director/schema';
import { DirectorDashboard } from './DirectorDashboard';
import { CoreDashboard } from './CoreDashboard';

export const dynamic = 'force-dynamic';

const SIGNED_URL_TTL = 60 * 60; // 1 hour

type RawRow = Omit<ProjectReportDetail, 'photoUrls' | 'reportDocUrl'> & {
  photo_paths: string[] | null;
  report_doc: string | null;
};

export default async function DirectorHomePage() {
  const member = await getMember();
  const supabase = await createSupabaseServerClient();

  // Row Level Security decides which rows come back: a director sees their own
  // avenue's reports; a core member sees every avenue's.
  const { data } = await supabase
    .from('project_reports')
    .select(
      'id, director_name, avenue, title, project_date, location, beneficiaries, description, photo_paths, report_doc, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data ?? []) as RawRow[];

  const reports: ProjectReportDetail[] = await Promise.all(
    rows.map(async ({ photo_paths, report_doc, ...rest }) => {
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

      let reportDocUrl: string | null = null;
      if (report_doc) {
        const { data: docSigned } = await supabase.storage
          .from('project-reports')
          .createSignedUrl(report_doc, SIGNED_URL_TTL);
        reportDocUrl = docSigned?.signedUrl ?? null;
      }

      return { ...rest, photoUrls, reportDocUrl };
    })
  );

  if (member.role === 'core') {
    return <CoreDashboard member={member} reports={reports} />;
  }
  return <DirectorDashboard director={member} reports={reports} />;
}
