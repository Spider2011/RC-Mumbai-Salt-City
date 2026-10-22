'use client';

import type { FileKind } from './files-core';

/** Uploads a photo or document to the portal's file store in chunks; returns its file id. */
export async function uploadFile(blob: Blob, name: string, kind: FileKind): Promise<string> {
  const start = await fetch('/api/director/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, size: blob.size, kind }),
  });
  if (!start.ok) throw new Error(`upload refused (${start.status})`);
  const { id, chunkSize, chunkCount } = (await start.json()) as { id: string; chunkSize: number; chunkCount: number };

  for (let i = 0; i < chunkCount; i++) {
    const part = blob.slice(i * chunkSize, (i + 1) * chunkSize);
    const res = await fetch(`/api/director/files/${id}?part=${i}`, { method: 'PUT', body: part });
    if (!res.ok) throw new Error(`chunk ${i} failed (${res.status})`);
  }

  const done = await fetch(`/api/director/files/${id}`, { method: 'PATCH' });
  if (!done.ok) throw new Error(`upload incomplete (${done.status})`);
  return id;
}
