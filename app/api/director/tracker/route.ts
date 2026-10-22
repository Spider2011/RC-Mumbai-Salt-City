import { NextResponse } from 'next/server';
import { getMemberOrNull } from '@/lib/director/dal';
import { canUseTracker } from '@/lib/director/access';
import { loadPlan, runTrackerAction } from '@/lib/director/tracker';
import { planToLists } from '@/lib/director/tracker-core';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const STATUS: Record<string, number> = { not_found: 404, bad_action: 400, bad_field: 400, bad_value: 400 };

/** Core members only. Directors and signed-out visitors get nothing. */
async function guard() {
  const member = await getMemberOrNull();
  if (!member) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401, headers: NO_STORE });
  if (!canUseTracker(member)) return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403, headers: NO_STORE });
  return null;
}

export async function GET() {
  const denied = await guard();
  if (denied) return denied;
  return NextResponse.json({ ok: true, ...planToLists(await loadPlan()) }, { headers: NO_STORE });
}

export async function POST(req: Request) {
  const denied = await guard();
  if (denied) return denied;

  const raw = await req.text();
  if (raw.length > 4000) return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413, headers: NO_STORE });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400, headers: NO_STORE });
  }
  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400, headers: NO_STORE });
  }

  const result = await runTrackerAction(body as Record<string, unknown>);
  return NextResponse.json(result, { status: result.ok ? 200 : STATUS[result.error], headers: NO_STORE });
}
