import { NextResponse } from 'next/server';
import { getMemberOrNull } from '@/lib/director/dal';
import { completeFile, openFile, writeChunk } from '@/lib/director/files';
import { CHUNK_BYTES, contentDisposition } from '@/lib/director/files-core';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

const ID_RE = /^[A-Za-z0-9]{1,40}$/;
const STATUS: Record<string, number> = { not_found: 404, forbidden: 403, bad_part: 400, bad_length: 400, incomplete: 409 };

async function auth(ctx: Ctx) {
  const member = await getMemberOrNull();
  const { id } = await ctx.params;
  return { member, id: ID_RE.test(id) ? id : null };
}

/** Download / view a stored photo or document. */
export async function GET(_req: Request, ctx: Ctx) {
  const { member, id } = await auth(ctx);
  if (!member) return new NextResponse('Unauthorized', { status: 401 });
  if (!id) return new NextResponse('Not found', { status: 404 });

  const file = await openFile(member, id);
  if (typeof file === 'string') return new NextResponse(file === 'forbidden' ? 'Forbidden' : 'Not found', { status: STATUS[file] });

  return new NextResponse(file.stream, {
    headers: {
      'Content-Type': file.meta.type,
      'Content-Length': String(file.meta.size),
      'Content-Disposition': contentDisposition(file.meta.name, file.meta.type),
      'X-Content-Type-Options': 'nosniff',
      // Files never change once complete.
      'Cache-Control': 'private, max-age=86400, immutable',
    },
  });
}

/** Upload one chunk: PUT /api/director/files/{id}?part=N with the raw bytes as the body. */
export async function PUT(req: Request, ctx: Ctx) {
  const { member, id } = await auth(ctx);
  if (!member) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const part = Number(new URL(req.url).searchParams.get('part'));
  const bytes = Buffer.from(await req.arrayBuffer());
  if (bytes.length > CHUNK_BYTES) return NextResponse.json({ error: 'bad_length' }, { status: 413 });

  const result = await writeChunk(member, id, part, bytes);
  return result === 'ok' ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result }, { status: STATUS[result] });
}

/** Mark an upload finished once every chunk is stored. */
export async function PATCH(_req: Request, ctx: Ctx) {
  const { member, id } = await auth(ctx);
  if (!member) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!id) return NextResponse.json({ error: 'not_found' }, { status: 404 });

  const result = await completeFile(member, id);
  return result === 'ok' ? NextResponse.json({ ok: true }) : NextResponse.json({ error: result }, { status: STATUS[result] });
}
