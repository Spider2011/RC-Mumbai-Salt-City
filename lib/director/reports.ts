import 'server-only';
import { FieldValue, Timestamp, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase/admin';
import { canReadReport, type Viewer } from './access';
import { attachToReport, deleteFiles, getFiles } from './files';
import { MAX_REPORT_PHOTOS, type CleanReport, type ProjectReportDetail } from './schema';

/** Firestore `reports/{id}`. */
interface StoredReport {
  directorId: string;
  directorName: string;
  avenue: string;
  title: string;
  projectDate: string | null;
  location: string;
  beneficiaries: number;
  description: string;
  photoIds: string[];
  reportDocId: string | null;
  createdAt: Timestamp;
}

const LIST_LIMIT = 100;
const reports = () => db().collection('reports');
const fileUrl = (id: string) => `/api/director/files/${id}`;

function toDetail(doc: QueryDocumentSnapshot): ProjectReportDetail {
  const r = doc.data() as StoredReport;
  return {
    id: doc.id,
    director_name: r.directorName,
    avenue: r.avenue,
    title: r.title,
    project_date: r.projectDate,
    location: r.location,
    beneficiaries: r.beneficiaries,
    description: r.description,
    created_at: r.createdAt.toDate().toISOString(),
    photoUrls: (r.photoIds ?? []).map(fileUrl),
    reportDocUrl: r.reportDocId ? fileUrl(r.reportDocId) : null,
  };
}

/**
 * Newest first. Core members see everything; a director sees their own reports
 * plus their avenue's. Equality-only queries, so no composite indexes are needed.
 */
export async function listReportsFor(viewer: Viewer): Promise<ProjectReportDetail[]> {
  let docs: QueryDocumentSnapshot[];
  if (viewer.role === 'core') {
    docs = (await reports().orderBy('createdAt', 'desc').limit(LIST_LIMIT).get()).docs;
  } else {
    const queries = [reports().where('directorId', '==', viewer.userId).get()];
    if (viewer.avenue) queries.push(reports().where('avenue', '==', viewer.avenue).get());
    const seen = new Map<string, QueryDocumentSnapshot>();
    for (const snap of await Promise.all(queries)) for (const d of snap.docs) seen.set(d.id, d);
    docs = [...seen.values()]
      .sort((a, b) => (b.get('createdAt') as Timestamp).toMillis() - (a.get('createdAt') as Timestamp).toMillis())
      .slice(0, LIST_LIMIT);
  }
  return docs
    .filter((d) => canReadReport(viewer, { directorId: d.get('directorId'), avenue: d.get('avenue') }))
    .map(toDetail);
}

export type CreateResult = { ok: true } | { ok: false; field?: 'reportDoc' | 'photos'; message: string };

/** Saves a report, after checking every attached file is the director's own, finished, and of the right kind. */
export async function createReport(
  director: Viewer & { fullName: string },
  report: CleanReport,
  photoIds: string[],
  reportDocId: string,
): Promise<CreateResult> {
  const photos = [...new Set(photoIds)].slice(0, MAX_REPORT_PHOTOS);
  const meta = await getFiles([reportDocId, ...photos]);
  const ok = (id: string, kind: 'photo' | 'doc') => {
    const f = meta.get(id);
    return Boolean(f && f.ownerId === director.userId && f.complete && f.kind === kind && f.reportId === null);
  };
  if (!ok(reportDocId, 'doc')) return { ok: false, field: 'reportDoc', message: 'Please attach your report document again.' };
  if (!photos.every((id) => ok(id, 'photo'))) return { ok: false, field: 'photos', message: 'One of the photos did not upload. Please try again.' };

  const ref = reports().doc();
  await ref.set({
    directorId: director.userId,
    directorName: director.fullName,
    avenue: report.avenue,
    title: report.title,
    projectDate: report.projectDate,
    location: report.location,
    beneficiaries: report.beneficiaries,
    description: report.description,
    photoIds: photos,
    reportDocId,
    createdAt: FieldValue.serverTimestamp(),
  });
  await attachToReport([reportDocId, ...photos], ref.id, report.avenue);
  return { ok: true };
}

/** Deletes a report and its photos and document. Callers must check canDeleteReport first. */
export async function removeReport(id: string): Promise<boolean> {
  const ref = reports().doc(id);
  const report = (await ref.get()).data() as StoredReport | undefined;
  if (!report) return false;
  await deleteFiles([...(report.photoIds ?? []), ...(report.reportDocId ? [report.reportDocId] : [])]);
  await ref.delete();
  return true;
}

export async function reportedCount(): Promise<number> {
  return (await reports().count().get()).data().count;
}
