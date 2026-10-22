// Shared Firebase Admin setup for the scripts in this folder.
// Run them with:  node --env-file=.env.local scripts/firebase/<script>.mjs
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
if (!projectId) {
  console.error('Set FIREBASE_PROJECT_ID (and the service account variables) in .env.local first.');
  process.exit(1);
}

const app = process.env.FIREBASE_AUTH_EMULATOR_HOST
  ? initializeApp({ projectId })
  : initializeApp({
      projectId,
      credential: cert({
        projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });

export const auth = getAuth(app);
export const db = getFirestore(app);

/** Keep in sync with AVENUE_OPTIONS in lib/director/schema.ts. */
export const AVENUES = [
  'Club Service', 'Community Service', 'Professional Development', 'International Service',
  'PR and Marketing', 'Digital Communication', 'Entrepreneurship Development', 'Editor',
  'Partners-In-Service', 'Sports', 'Social Media',
];

/** Must match CHUNK_BYTES in lib/director/files-core.ts. */
export const CHUNK_BYTES = 700 * 1024;

export function arg(name, fallback = undefined) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const next = process.argv[i + 1];
  return next === undefined || next.startsWith('--') ? true : next;
}
