import { NextResponse } from 'next/server';
import { getMemberOrNull } from '@/lib/director/dal';
import { createFile } from '@/lib/director/files';
import { validateNewFile } from '@/lib/director/files-core';

export const dynamic = 'force-dynamic';

/** Starts an upload: returns the new file id and how to chunk it. */
export async function POST(req: Request) {
  const member = await getMemberOrNull();
  if (!member) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const check = validateNewFile(body ?? {});
  if (!check.ok) return NextResponse.json({ error: check.error }, { status: 400 });

  return NextResponse.json(await createFile(member, check.value));
}
