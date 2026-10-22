import { describe, expect, it } from 'vitest';
import { canDeleteReport, canReadFile, canReadReport, canUseTracker, type Viewer } from '../director/access';
import { CHUNK_BYTES, MAX_PHOTO_BYTES, chunkCount, cleanFileName, contentDisposition, validateNewFile } from '../director/files-core';
import { MAX_DOC_BYTES } from '../director/schema';
import { applyTrackerAction, emptyPlan, planToLists, type TrackerPlan } from '../director/tracker-core';
import type { TrackerProject, TrackerTask } from '../director/tracker-shared';

const director: Viewer = { userId: 'u1', role: 'director', avenue: 'Club Service', isAdmin: false };
const core: Viewer = { userId: 'c1', role: 'core', avenue: '', isAdmin: false };
const admin: Viewer = { ...core, userId: 'a1', isAdmin: true };

describe('access rules (mirrors the old Supabase policies)', () => {
  it('directors read their own reports and their avenue, nothing else', () => {
    expect(canReadReport(director, { directorId: 'u1', avenue: 'Sports' })).toBe(true);
    expect(canReadReport(director, { directorId: 'x', avenue: 'Club Service' })).toBe(true);
    expect(canReadReport(director, { directorId: 'x', avenue: 'Sports' })).toBe(false);
  });

  it('core reads everything; a director with no avenue only reads their own', () => {
    expect(canReadReport(core, { directorId: 'x', avenue: 'Sports' })).toBe(true);
    const noAvenue = { ...director, avenue: '' };
    expect(canReadReport(noAvenue, { directorId: 'x', avenue: '' })).toBe(false);
  });

  it('files follow the owner, the owner avenue or the report avenue', () => {
    const file = { ownerId: 'x', ownerAvenue: 'Sports', reportAvenue: 'Club Service' };
    expect(canReadFile(director, file)).toBe(true);
    expect(canReadFile(director, { ...file, reportAvenue: null })).toBe(false);
    expect(canReadFile(core, { ...file, reportAvenue: null })).toBe(true);
    expect(canReadFile({ ...director, avenue: '' }, { ownerId: 'x', ownerAvenue: '', reportAvenue: '' })).toBe(false);
  });

  it('only admins delete; only core uses the tracker', () => {
    expect(canDeleteReport(admin)).toBe(true);
    expect(canDeleteReport(core)).toBe(false);
    expect(canUseTracker(core)).toBe(true);
    expect(canUseTracker(director)).toBe(false);
  });
});

describe('file rules', () => {
  it('counts chunks', () => {
    expect(chunkCount(1)).toBe(1);
    expect(chunkCount(CHUNK_BYTES)).toBe(1);
    expect(chunkCount(CHUNK_BYTES + 1)).toBe(2);
  });

  it('decides the content type itself and enforces size limits', () => {
    expect(validateNewFile({ name: 'pic.png', size: 1000, kind: 'photo' })).toEqual({
      ok: true,
      value: { name: 'pic.jpg', type: 'image/jpeg', size: 1000, kind: 'photo' },
    });
    expect(validateNewFile({ name: 'r.PDF', size: 10, kind: 'doc' })).toMatchObject({ ok: true, value: { type: 'application/pdf' } });
    expect(validateNewFile({ name: 'evil.html', size: 10, kind: 'doc' })).toEqual({ ok: false, error: 'bad_type' });
    expect(validateNewFile({ name: 'big.pdf', size: MAX_DOC_BYTES + 1, kind: 'doc' })).toEqual({ ok: false, error: 'too_large' });
    expect(validateNewFile({ name: 'p.jpg', size: MAX_PHOTO_BYTES + 1, kind: 'photo' })).toEqual({ ok: false, error: 'too_large' });
    expect(validateNewFile({ name: 'p.jpg', size: 0, kind: 'photo' })).toEqual({ ok: false, error: 'bad_size' });
    expect(validateNewFile({ name: 'p.jpg', size: 5, kind: 'exe' })).toEqual({ ok: false, error: 'bad_kind' });
  });

  it('keeps file names safe for headers', () => {
    expect(cleanFileName('C:\\fake\\path\\"report".pdf')).toBe('report.pdf');
    expect(cleanFileName('')).toBe('file');
    expect(contentDisposition('रिपोर्ट.pdf', 'application/pdf')).toMatch(/^inline; filename="_+\.pdf"; filename\*=UTF-8''/);
    expect(contentDisposition('notes.docx', 'application/msword')).toMatch(/^attachment;/);
  });
});

describe('tracker rules (ported from the Apps Script)', () => {
  const ctx = { today: '2026-10-22', newId: (p: 'p' | 't') => `${p}new` };
  const project = (id: string): TrackerProject => ({
    id, title: `Project ${id}`, avenue: 'Club Service', kind: 'fundraiser', date: '2026-11-01', time: '', when: '',
    venue: '', lead: '', team: '', status: 'Planning', summary: '', money: '', upfront: '',
  });
  const task = (id: string, projectId: string, n: number): TrackerTask => ({ id, project: projectId, n, text: `Task ${n}`, due: '', done: false, doneOn: '' });
  const plan: TrackerPlan = {
    projects: { p1: project('p1'), p2: project('p2') },
    tasks: { t1: task('t1', 'p1', 1), t2: task('t2', 'p1', 4), t3: task('t3', 'p2', 1) },
  };
  const firstProject = plan.projects.p1;
  const firstTask = plan.tasks.t1;

  it('lists projects and tasks, and starts empty without a stored plan', () => {
    expect(planToLists(plan)).toMatchObject({ projects: [{ id: 'p1' }, { id: 'p2' }], tasks: [{ id: 't1' }, { id: 't2' }, { id: 't3' }] });
    expect(planToLists(emptyPlan())).toEqual({ projects: [], tasks: [] });
  });

  it('updates only editable fields, with valid statuses and dates', () => {
    const ok = applyTrackerAction(plan, { action: 'updateProject', id: firstProject.id, field: 'lead', value: '  Rtr. Asha  ' }, ctx);
    expect(ok.result).toEqual({ ok: true });
    expect(ok.next!.projects[firstProject.id].lead).toBe('Rtr. Asha');
    expect(plan.projects[firstProject.id].lead).not.toBe('Rtr. Asha'); // input untouched
    expect(applyTrackerAction(plan, { action: 'updateProject', id: firstProject.id, field: 'title', value: 'x' }, ctx).result).toEqual({ ok: false, error: 'bad_field' });
    expect(applyTrackerAction(plan, { action: 'updateProject', id: firstProject.id, field: 'status', value: 'Maybe' }, ctx).result).toEqual({ ok: false, error: 'bad_value' });
    expect(applyTrackerAction(plan, { action: 'updateProject', id: firstProject.id, field: 'date', value: '22/10/2026' }, ctx).result).toEqual({ ok: false, error: 'bad_value' });
    expect(applyTrackerAction(plan, { action: 'updateProject', id: 'nope', field: 'lead', value: 'x' }, ctx).result).toEqual({ ok: false, error: 'not_found' });
  });

  it('ticks tasks with today’s date and unticks them', () => {
    const done = applyTrackerAction(plan, { action: 'setTask', id: firstTask.id, done: true }, ctx).next!;
    expect(done.tasks[firstTask.id]).toMatchObject({ done: true, doneOn: '2026-10-22' });
    const undone = applyTrackerAction(done, { action: 'setTask', id: firstTask.id, done: false }, ctx).next!;
    expect(undone.tasks[firstTask.id]).toMatchObject({ done: false, doneOn: '' });
  });

  it('adds tasks numbered after the project’s last one, and deletes them', () => {
    const highest = Math.max(...Object.values(plan.tasks).filter((t) => t.project === firstProject.id).map((t) => t.n));
    const added = applyTrackerAction(plan, { action: 'addTask', project: firstProject.id, text: 'Book the hall', due: 'soon' }, ctx);
    expect(added.result).toMatchObject({ ok: true, task: { id: 'tnew', n: highest + 1, text: 'Book the hall', due: '' } });
    const removed = applyTrackerAction(added.next!, { action: 'deleteTask', id: 'tnew' }, ctx).next!;
    expect(removed.tasks.tnew).toBeUndefined();
    expect(applyTrackerAction(plan, { action: 'deleteTask', id: 'missing' }, ctx)).toEqual({ result: { ok: true }, next: null });
    expect(applyTrackerAction(plan, { action: 'addTask', project: firstProject.id, text: '   ' }, ctx).result).toEqual({ ok: false, error: 'bad_value' });
  });

  it('adds projects with safe defaults and rejects unknown actions', () => {
    const added = applyTrackerAction(plan, { action: 'addProject', title: 'Tree drive', avenue: 'Nope', kind: 'impact', date: '2026-12-01' }, ctx);
    expect(added.result).toMatchObject({ ok: true, project: { id: 'pnew', avenue: 'Club Service', kind: 'impact', status: 'Planning' } });
    expect(applyTrackerAction(plan, { action: 'addProject', title: '', date: '2026-12-01' }, ctx).result).toEqual({ ok: false, error: 'bad_value' });
    expect(applyTrackerAction(plan, { action: 'check' }, ctx).result).toEqual({ ok: false, error: 'bad_action' });
  });
});
