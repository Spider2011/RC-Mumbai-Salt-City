import 'server-only';
import { randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from '@/lib/firebase/admin';
import { applyTrackerAction, emptyPlan, type TrackerPlan, type TrackerResult } from './tracker-core';

const planRef = () => db().collection('tracker').doc('plan');

function asPlan(data: FirebaseFirestore.DocumentData | undefined): TrackerPlan {
  return data ? { projects: data.projects ?? {}, tasks: data.tasks ?? {} } : emptyPlan();
}

/** Today in Mumbai, as YYYY-MM-DD. */
function todayIST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

export async function loadPlan(): Promise<TrackerPlan> {
  return asPlan((await planRef().get()).data());
}

/** Runs one change in a transaction, so simultaneous saves never overwrite each other. */
export async function runTrackerAction(body: Record<string, unknown>): Promise<TrackerResult> {
  return db().runTransaction(async (tx) => {
    const snap = await tx.get(planRef());
    const { result, next } = applyTrackerAction(asPlan(snap.data()), body, {
      today: todayIST(),
      newId: (prefix) => prefix + randomUUID().replace(/-/g, '').slice(0, 10),
    });
    if (next) tx.set(planRef(), { ...next, updatedAt: FieldValue.serverTimestamp() });
    return result;
  });
}
