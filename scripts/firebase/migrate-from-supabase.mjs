// One-time move of the director portal from Supabase to Firebase.
//
//   node --env-file=.env.local scripts/firebase/migrate-from-supabase.mjs --users <auth-users.csv> [--dry-run]
//
// Needs in .env.local:
//   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (read the old data)
//   FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY   (write the new data)
//
// The CSV comes from Supabase's SQL editor (see firebase/README.md):
//   select id, email, encrypted_password from auth.users;
// Its bcrypt hashes are imported as-is, so everyone keeps their current password.
//
// Safe to re-run: reports keep their Supabase ids and files get ids derived
// from their old storage path, so a second run overwrites instead of duplicating.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Timestamp } from 'firebase-admin/firestore';
import { CHUNK_BYTES, arg, auth, db } from './_admin.mjs';

const SUPABASE_URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'project-reports';
const DRY = arg('dry-run') === true;
const usersCsv = arg('users');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.');
  process.exit(1);
}
if (typeof usersCsv !== 'string') {
  console.error('Pass the exported users file: --users path/to/auth-users.csv');
  process.exit(1);
}

const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` };

async function rest(table, query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, { headers });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status} ${await res.text()}`);
  return res.json();
}

async function download(path) {
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path.split('/').map(encodeURIComponent).join('/')}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`download ${path}: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Minimal CSV reader (handles quoted fields) for the SQL editor export. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

const DOC_TYPES = { pdf: 'application/pdf', doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' };
const fileId = (path) => 'm' + createHash('sha1').update(path).digest('hex').slice(0, 19);
const safeName = (s) => s.replace(/[\u0000-\u001f"\\/:*?<>|]/g, '').trim().slice(0, 100) || 'report';

async function writeFile(id, meta, bytes) {
  const ref = db.collection('files').doc(id);
  const chunkCount = Math.max(1, Math.ceil(bytes.length / CHUNK_BYTES));
  await db.recursiveDelete(ref); // clear any half-finished earlier run
  for (let i = 0; i < chunkCount; i++) {
    await ref.collection('chunks').doc(String(i).padStart(4, '0')).set({ i, data: bytes.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES) });
  }
  await ref.set({ ...meta, size: bytes.length, chunkCount, complete: true, createdAt: Timestamp.now() });
}

async function main() {
// ── Read everything from Supabase ───────────────────────────────────────────
const users = parseCsv(readFileSync(usersCsv, 'utf8'));
const members = await rest('members', 'select=*');
const reports = await rest('project_reports', 'select=*&order=created_at.asc');
const memberById = new Map(members.map((m) => [m.id, m]));
const files = reports.flatMap((r) => [...(r.photo_paths ?? []), ...(r.report_doc ? [r.report_doc] : [])]);

console.log(`Supabase: ${users.length} logins, ${members.length} member profiles, ${reports.length} reports, ${files.length} files.`);
const missingHash = users.filter((u) => !u.encrypted_password);
if (missingHash.length) console.log(`  ${missingHash.length} login(s) have no password hash and will need a new password: ${missingHash.map((u) => u.email).join(', ')}`);
if (DRY) {
  console.log('Dry run: nothing was written.');
  return;
}

// ── Logins (keeping passwords) ──────────────────────────────────────────────
const toImport = users.map((u) => ({
  uid: u.id,
  email: u.email,
  emailVerified: true,
  ...(u.encrypted_password ? { passwordHash: Buffer.from(u.encrypted_password) } : {}),
}));
let imported = 0;
for (let i = 0; i < toImport.length; i += 1000) {
  const result = await auth.importUsers(toImport.slice(i, i + 1000), { hash: { algorithm: 'BCRYPT' } });
  imported += result.successCount;
  for (const e of result.errors) {
    const who = toImport[i + e.index].email;
    if (e.error.code === 'auth/uid-already-exists' || e.error.code === 'auth/email-already-exists') console.log(`  ${who}: already in Firebase, left as is`);
    else console.log(`  ${who}: ${e.error.message}`);
  }
}
console.log(`Logins imported: ${imported}`);

// ── Member profiles ─────────────────────────────────────────────────────────
const emailById = new Map(users.map((u) => [u.id, u.email]));
for (const m of members) {
  await db.collection('members').doc(m.id).set({
    fullName: m.full_name,
    role: m.role === 'core' ? 'core' : 'director',
    avenue: m.avenue ?? '',
    isAdmin: m.is_admin === true,
    email: emailById.get(m.id) ?? '',
  });
}
console.log(`Member profiles written: ${members.length}`);

// ── Reports, photos and documents ───────────────────────────────────────────
let fileCount = 0;
for (const r of reports) {
  const owner = { ownerId: r.director_id, ownerAvenue: memberById.get(r.director_id)?.avenue ?? '', reportId: r.id, reportAvenue: r.avenue };
  const photoIds = [];
  for (const path of r.photo_paths ?? []) {
    const id = fileId(path);
    await writeFile(id, { ...owner, name: path.split('/').pop().replace(/\.[^.]*$/, '') + '.jpg', type: 'image/jpeg', kind: 'photo' }, await download(path));
    photoIds.push(id);
    fileCount++;
  }
  let reportDocId = null;
  if (r.report_doc) {
    const ext = r.report_doc.split('.').pop().toLowerCase();
    reportDocId = fileId(r.report_doc);
    await writeFile(reportDocId, { ...owner, name: `${safeName(r.title)}.${ext}`, type: DOC_TYPES[ext] ?? 'application/octet-stream', kind: 'doc' }, await download(r.report_doc));
    fileCount++;
  }
  await db.collection('reports').doc(r.id).set({
    directorId: r.director_id,
    directorName: r.director_name,
    avenue: r.avenue,
    title: r.title,
    projectDate: r.project_date ?? null,
    location: r.location ?? '',
    beneficiaries: r.beneficiaries ?? 0,
    description: r.description,
    photoIds,
    reportDocId,
    createdAt: Timestamp.fromDate(new Date(r.created_at)),
  });
  console.log(`  ✓ ${r.title} (${photoIds.length} photo${photoIds.length === 1 ? '' : 's'}${reportDocId ? ' + document' : ''})`);
}

// ── Check ───────────────────────────────────────────────────────────────────
const [rc, mc] = await Promise.all([db.collection('reports').count().get(), db.collection('members').count().get()]);
console.log(`\nDone. Firebase now has ${mc.data().count} members and ${rc.data().count} reports (${fileCount} files copied).`);
console.log('Delete the users CSV now: it contains password hashes.');
}

// Close Firestore so Node exits cleanly (process.exit mid-close crashes on Windows).
try {
  await main();
} finally {
  await db.terminate();
}
