import 'server-only';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase/admin';
import { canReadFile, type Viewer } from './access';
import { CHUNK_BYTES, chunkCount, type FileKind, type NewFile } from './files-core';

/**
 * Firestore layout:
 *   files/{id}                 metadata (owner, avenue, type, size, complete…)
 *   files/{id}/chunks/{0000}   { i, data: bytes } — CHUNK_BYTES each, the last one shorter
 */
export interface StoredFile {
  ownerId: string;
  ownerAvenue: string;
  reportId: string | null;
  reportAvenue: string | null;
  name: string;
  type: string;
  size: number;
  kind: FileKind;
  chunkCount: number;
  complete: boolean;
}

const files = () => db().collection('files');
const chunkId = (i: number) => String(i).padStart(4, '0');

export async function createFile(owner: Viewer, file: NewFile): Promise<{ id: string; chunkSize: number; chunkCount: number }> {
  const ref = files().doc();
  const doc: StoredFile = {
    ownerId: owner.userId,
    ownerAvenue: owner.avenue,
    reportId: null,
    reportAvenue: null,
    name: file.name,
    type: file.type,
    size: file.size,
    kind: file.kind,
    chunkCount: chunkCount(file.size),
    complete: false,
  };
  await ref.set({ ...doc, createdAt: FieldValue.serverTimestamp() });
  return { id: ref.id, chunkSize: CHUNK_BYTES, chunkCount: doc.chunkCount };
}

export type ChunkResult = 'ok' | 'not_found' | 'forbidden' | 'bad_part' | 'bad_length';

/** Stores one chunk. Each chunk must be exactly the expected length, so a finished file is always whole. */
export async function writeChunk(owner: Viewer, id: string, index: number, bytes: Buffer): Promise<ChunkResult> {
  const ref = files().doc(id);
  const meta = (await ref.get()).data() as StoredFile | undefined;
  if (!meta) return 'not_found';
  if (meta.ownerId !== owner.userId || meta.complete) return 'forbidden';
  if (!Number.isInteger(index) || index < 0 || index >= meta.chunkCount) return 'bad_part';
  const expected = Math.min(CHUNK_BYTES, meta.size - index * CHUNK_BYTES);
  if (bytes.length !== expected) return 'bad_length';
  await ref.collection('chunks').doc(chunkId(index)).set({ i: index, data: bytes });
  return 'ok';
}

export async function completeFile(owner: Viewer, id: string): Promise<'ok' | 'not_found' | 'forbidden' | 'incomplete'> {
  const ref = files().doc(id);
  const meta = (await ref.get()).data() as StoredFile | undefined;
  if (!meta) return 'not_found';
  if (meta.ownerId !== owner.userId) return 'forbidden';
  if (meta.complete) return 'ok';
  const stored = (await ref.collection('chunks').count().get()).data().count;
  if (stored !== meta.chunkCount) return 'incomplete';
  await ref.update({ complete: true });
  return 'ok';
}

/** Loads metadata for the given ids (missing ones are skipped). */
export async function getFiles(ids: string[]): Promise<Map<string, StoredFile>> {
  const unique = [...new Set(ids)].filter(Boolean);
  if (unique.length === 0) return new Map();
  const snaps = await db().getAll(...unique.map((id) => files().doc(id)));
  const out = new Map<string, StoredFile>();
  for (const s of snaps) if (s.exists) out.set(s.id, s.data() as StoredFile);
  return out;
}

export async function attachToReport(ids: string[], reportId: string, reportAvenue: string): Promise<void> {
  const batch = db().batch();
  for (const id of ids) batch.update(files().doc(id), { reportId, reportAvenue });
  await batch.commit();
}

export async function deleteFiles(ids: string[]): Promise<void> {
  await Promise.all([...new Set(ids)].filter(Boolean).map((id) => db().recursiveDelete(files().doc(id))));
}

/** Streams a finished file to a viewer allowed to read it, one chunk at a time. */
export async function openFile(
  viewer: Viewer,
  id: string,
): Promise<{ meta: StoredFile; stream: ReadableStream<Uint8Array> } | 'not_found' | 'forbidden'> {
  const ref = files().doc(id);
  const meta = (await ref.get()).data() as StoredFile | undefined;
  if (!meta || !meta.complete) return 'not_found';
  if (!canReadFile(viewer, meta)) return 'forbidden';

  let next = 0;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (next >= meta.chunkCount) return controller.close();
      const chunk = (await ref.collection('chunks').doc(chunkId(next)).get()).data();
      next += 1;
      if (!chunk) return controller.error(new Error('missing chunk'));
      controller.enqueue(new Uint8Array(chunk.data as Buffer));
    },
  });
  return { meta, stream };
}
