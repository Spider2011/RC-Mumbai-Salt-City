/**
 * Report photos and documents are stored inside Firestore (the free Spark plan
 * has no Cloud Storage), split into chunks that stay under Firestore's 1 MiB
 * document limit and Vercel's 4.5 MB request limit. Pure helpers only.
 */
import { ALLOWED_DOC_EXTENSIONS, MAX_DOC_BYTES } from './schema';

export const CHUNK_BYTES = 700 * 1024;
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

export type FileKind = 'photo' | 'doc';

const DOC_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export function chunkCount(size: number): number {
  return Math.max(1, Math.ceil(size / CHUNK_BYTES));
}

export interface NewFile {
  name: string;
  type: string;
  size: number;
  kind: FileKind;
}

/** Validates an upload request. The stored content type is decided here, never taken from the browser. */
export function validateNewFile(raw: { name?: unknown; size?: unknown; kind?: unknown }):
  | { ok: true; value: NewFile }
  | { ok: false; error: string } {
  const kind = raw.kind === 'photo' || raw.kind === 'doc' ? raw.kind : null;
  const size = typeof raw.size === 'number' && Number.isInteger(raw.size) ? raw.size : -1;
  const name = cleanFileName(typeof raw.name === 'string' ? raw.name : '');
  if (!kind) return { ok: false, error: 'bad_kind' };
  if (size <= 0) return { ok: false, error: 'bad_size' };

  if (kind === 'photo') {
    if (size > MAX_PHOTO_BYTES) return { ok: false, error: 'too_large' };
    return { ok: true, value: { name: name.replace(/\.[^.]*$/, '') + '.jpg', type: 'image/jpeg', size, kind } };
  }

  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (!(ALLOWED_DOC_EXTENSIONS as readonly string[]).includes(ext)) return { ok: false, error: 'bad_type' };
  if (size > MAX_DOC_BYTES) return { ok: false, error: 'too_large' };
  return { ok: true, value: { name, type: DOC_TYPES[ext], size, kind } };
}

export function cleanFileName(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? '';
  const cleaned = base.replace(/[\u0000-\u001f"\\]/g, '').trim().slice(0, 120);
  return cleaned || 'file';
}

/** Inline for photos and PDFs, download for Word files; RFC 5987 so any name is safe in the header. */
export function contentDisposition(name: string, type: string): string {
  const mode = type === 'image/jpeg' || type === 'application/pdf' ? 'inline' : 'attachment';
  const ascii = cleanFileName(name).replace(/[^\x20-\x7e]/g, '_');
  return `${mode}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(cleanFileName(name))}`;
}
