/**
 * The core team's project tracker. Pure rules ported from the original
 * Google Apps Script backend; the whole plan lives in one Firestore document
 * (tracker/plan), so each refresh costs a single read. The plan's contents
 * stay in Firestore only — the repository is public.
 */
import { TRACKER_AVENUES, TRACKER_STATUSES, type TrackerProject, type TrackerTask } from './tracker-shared';

export interface TrackerPlan {
  projects: Record<string, TrackerProject>;
  tasks: Record<string, TrackerTask>;
}

export type TrackerError = 'bad_action' | 'bad_field' | 'bad_value' | 'not_found';
export type TrackerResult =
  | { ok: true; task?: TrackerTask; project?: TrackerProject }
  | { ok: false; error: TrackerError };

const EDITABLE = ['date', 'time', 'venue', 'lead', 'team', 'status'] as const;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function clean(v: unknown, max: number): string {
  return String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
}

export function emptyPlan(): TrackerPlan {
  return { projects: {}, tasks: {} };
}

export function planToLists(plan: TrackerPlan): { projects: TrackerProject[]; tasks: TrackerTask[] } {
  return { projects: Object.values(plan.projects), tasks: Object.values(plan.tasks) };
}

interface Ctx {
  today: string;
  newId: (prefix: 'p' | 't') => string;
}

const fail = (error: TrackerError) => ({ result: { ok: false as const, error }, next: null });

/** Applies one tracker change. Returns the result for the client and the new plan (null if nothing changed). */
export function applyTrackerAction(
  plan: TrackerPlan,
  body: Record<string, unknown>,
  ctx: Ctx,
): { result: TrackerResult; next: TrackerPlan | null } {
  switch (body.action) {
    case 'updateProject': {
      const field = String(body.field) as (typeof EDITABLE)[number];
      if (!EDITABLE.includes(field)) return fail('bad_field');
      const value = clean(body.value, 140);
      if (field === 'status' && !TRACKER_STATUSES.includes(value)) return fail('bad_value');
      if (field === 'date' && !DATE_RE.test(value)) return fail('bad_value');
      const project = plan.projects[String(body.id)];
      if (!project) return fail('not_found');
      const updated = { ...project, [field]: value };
      return { result: { ok: true }, next: { ...plan, projects: { ...plan.projects, [project.id]: updated } } };
    }
    case 'setTask': {
      const task = plan.tasks[String(body.id)];
      if (!task) return fail('not_found');
      const done = body.done === true;
      const updated = { ...task, done, doneOn: done ? ctx.today : '' };
      return { result: { ok: true }, next: { ...plan, tasks: { ...plan.tasks, [task.id]: updated } } };
    }
    case 'addTask': {
      const projectId = String(body.project);
      if (!plan.projects[projectId]) return fail('not_found');
      const text = clean(body.text, 160);
      if (!text) return fail('bad_value');
      const due = DATE_RE.test(String(body.due ?? '')) ? String(body.due) : '';
      const n = Object.values(plan.tasks)
        .filter((t) => t.project === projectId)
        .reduce((m, t) => Math.max(m, t.n), 0) + 1;
      const task: TrackerTask = { id: ctx.newId('t'), project: projectId, n, text, due, done: false, doneOn: '' };
      return { result: { ok: true, task }, next: { ...plan, tasks: { ...plan.tasks, [task.id]: task } } };
    }
    case 'deleteTask': {
      const id = String(body.id);
      if (!plan.tasks[id]) return { result: { ok: true }, next: null };
      const tasks = Object.fromEntries(Object.entries(plan.tasks).filter(([key]) => key !== id));
      return { result: { ok: true }, next: { ...plan, tasks } };
    }
    case 'addProject': {
      const title = clean(body.title, 120);
      const date = String(body.date ?? '');
      if (!title || !DATE_RE.test(date)) return fail('bad_value');
      const project: TrackerProject = {
        id: ctx.newId('p'),
        title,
        avenue: TRACKER_AVENUES.includes(String(body.avenue)) ? String(body.avenue) : 'Club Service',
        kind: body.kind === 'impact' ? 'impact' : 'fundraiser',
        date,
        time: '', when: '', venue: '', lead: '', team: '', status: 'Planning', summary: '', money: '', upfront: '',
      };
      return { result: { ok: true, project }, next: { ...plan, projects: { ...plan.projects, [project.id]: project } } };
    }
    default:
      return fail('bad_action');
  }
}
