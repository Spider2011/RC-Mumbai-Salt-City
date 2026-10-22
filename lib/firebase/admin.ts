import 'server-only';
import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { usingEmulators } from './config';

function app(): App {
  if (getApps().length > 0) return getApp();
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('Firebase is not configured. Set FIREBASE_PROJECT_ID.');
  if (usingEmulators()) return initializeApp({ projectId });

  // Accept the key however it was pasted: wrapped in quotes, with literal "\n", or with real line breaks.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
  return initializeApp({
    projectId,
    credential: cert({ projectId, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey }),
  });
}

export function adminAuth(): Auth {
  return getAuth(app());
}

export function db(): Firestore {
  return getFirestore(app());
}
