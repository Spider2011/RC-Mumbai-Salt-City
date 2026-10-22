import { NextResponse } from 'next/server';
import { getMemberOrNull } from '@/lib/director/dal';
import { reportedCount } from '@/lib/director/reports';

export const dynamic = 'force-dynamic';

/** Number of reported projects (a count only) for the portal's impact dashboard. */
export async function GET() {
  if (!(await getMemberOrNull())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return NextResponse.json({ count: await reportedCount() }, { headers: { 'Cache-Control': 'no-store' } });
}
