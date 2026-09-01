import { getDirector } from '@/lib/director/dal';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { ProjectReportRow } from '@/lib/director/schema';
import { DirectorDashboard } from './DirectorDashboard';

export const dynamic = 'force-dynamic';

export default async function DirectorHomePage() {
  const director = await getDirector();

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('project_reports')
    .select('id, title, avenue, project_date, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  const reports = (data ?? []) as ProjectReportRow[];

  return <DirectorDashboard director={director} reports={reports} />;
}
