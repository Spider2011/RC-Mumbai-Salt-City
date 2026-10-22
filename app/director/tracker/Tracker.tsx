'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { TrackerProject as Project, TrackerTask as Task } from '@/lib/director/tracker-shared';
import { TRACKER_AVENUES as AVENUES, TRACKER_STATUSES as STATUSES } from '@/lib/director/tracker-shared';
import s from './tracker.module.css';

type Filter = 'all' | 'fundraiser' | 'impact' | 'nolead';
type ApiResult = { ok: boolean; error?: string; projects?: Project[]; tasks?: Task[]; task?: Task; project?: Project };

const API = '/api/director/tracker';
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const POLL_MS = 30000;
const FILTERS: Filter[] = ['all', 'fundraiser', 'impact', 'nolead'];

function parseDate(v: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v || '')) return null;
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return isNaN(dt.getTime()) ? null : dt;
}
function todayStr() {
  const t = new Date();
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}
function shortDate(v: string) {
  const d = parseDate(v);
  return d ? `${DOW[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}` : '';
}
function errorText(code?: string) {
  switch (code) {
    case 'unauthorized': return 'Your session ended. Sign in again to keep editing.';
    case 'forbidden': return 'Only core team members can edit the tracker.';
    case 'not_found': return 'That item was removed by someone else. The page has been refreshed.';
    case 'bad_value': return 'That value can’t be saved. Check the date or text and try again.';
    default: return 'That didn’t save. Check your connection and try again.';
  }
}
/** Saved view settings; this component only renders in the browser, so storage is available. */
function stored<T>(key: string, parse: (raw: string) => T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : parse(raw);
  } catch {
    return fallback;
  }
}
function save(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* storage blocked */ }
}

/** A text box that saves when you leave it, and doesn't get overwritten by refreshes while you're typing. */
function EditableField(props: {
  id: string; label: string; value: string; placeholder?: string; type?: 'text' | 'date';
  highlight?: boolean; className?: string; onSave: (v: string) => void;
}) {
  const { id, label, value, placeholder, type = 'text', highlight, className, onSave } = props;
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  const [synced, setSynced] = useState(value);
  // Take in changes from other people, unless this box is being edited.
  if (value !== synced && !focused) {
    setSynced(value);
    setDraft(value);
  }
  const commit = (el: HTMLInputElement) => {
    setFocused(false);
    const v = type === 'date' ? draft : draft.trim().slice(0, 140);
    if (type === 'date' && (!v || !el.validity.valid || !parseDate(v))) { setDraft(value); return; }
    if (v !== value) onSave(v); else setDraft(value);
  };
  return (
    <div className={`${s.field} ${className || ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={draft}
        placeholder={placeholder}
        maxLength={type === 'text' ? 140 : undefined}
        min={type === 'date' ? '2026-07-01' : undefined}
        max={type === 'date' ? '2027-06-30' : undefined}
        autoComplete="off"
        className={highlight && !draft.trim() ? s.emptyLead : undefined}
        onFocus={() => setFocused(true)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.currentTarget)}
        onKeyDown={(e) => { if (e.key === 'Enter' && type === 'text') e.currentTarget.blur(); }}
      />
    </div>
  );
}

export default function Tracker({ fontClassName = '', memberName }: { fontClassName?: string; memberName: string }) {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ok' | 'error'>('loading');
  const [filter, setFilter] = useState<Filter>(() => stored('salt-city-tracker-filter', (r) => (FILTERS.includes(r as Filter) ? (r as Filter) : 'all'), 'all'));
  const [hideDone, setHideDone] = useState(() => stored('salt-city-tracker-hidedone', (r) => r === '1', false));
  const [open, setOpen] = useState<Set<string>>(() => stored('salt-city-tracker-open', (r) => new Set<string>(JSON.parse(r)), new Set<string>()));
  const [armed, setArmed] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const writeSeq = useRef(0);
  const pending = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3500);
  }, []);

  const signedOut = useCallback(() => router.replace('/director/login'), [router]);

  const load = useCallback(async () => {
    if (pending.current > 0) return;
    const seq = writeSeq.current;
    try {
      const res = await fetch(API, { cache: 'no-store' });
      if (res.status === 401) return signedOut();
      const data: ApiResult = await res.json();
      if (!data.ok) throw new Error(data.error || 'error');
      if (seq !== writeSeq.current || pending.current > 0) return; // a save happened meanwhile; next poll catches up
      setProjects(data.projects || []);
      setTasks(data.tasks || []);
      setLoadState('ok');
    } catch {
      setLoadState((st) => (st === 'ok' ? 'ok' : 'error'));
    }
  }, [signedOut]);

  useEffect(() => {
    const first = setTimeout(load, 0);
    const t = setInterval(() => { if (document.visibilityState === 'visible') load(); }, POLL_MS);
    const onFocus = () => load();
    window.addEventListener('focus', onFocus);
    return () => { clearTimeout(first); clearInterval(t); window.removeEventListener('focus', onFocus); };
  }, [load]);

  const post = useCallback(async (payload: Record<string, unknown>): Promise<ApiResult | null> => {
    writeSeq.current += 1;
    pending.current += 1;
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data: ApiResult = await res.json();
      if (!data.ok) {
        say(errorText(data.error));
        if (res.status === 401) signedOut();
        return null;
      }
      return data;
    } catch {
      say(errorText());
      return null;
    } finally {
      pending.current -= 1;
      if (pending.current === 0) setTimeout(load, 1500);
    }
  }, [say, signedOut, load]);

  function updateProject(p: Project, field: keyof Project, value: string) {
    setProjects((list) => list.map((x) => (x.id === p.id ? { ...x, [field]: value } : x)));
    post({ action: 'updateProject', id: p.id, field, value }).then((r) => {
      if (r && field === 'lead' && value) say(`Saved. ${value} is leading ${p.title}.`);
    });
  }
  function toggleTask(t: Task, done: boolean) {
    setTasks((list) => list.map((x) => (x.id === t.id ? { ...x, done } : x)));
    post({ action: 'setTask', id: t.id, done });
  }
  function removeTask(t: Task) {
    if (armed !== t.id) {
      setArmed(t.id);
      setTimeout(() => setArmed((a) => (a === t.id ? null : a)), 4000);
      return;
    }
    setArmed(null);
    setTasks((list) => list.filter((x) => x.id !== t.id));
    post({ action: 'deleteTask', id: t.id });
  }
  async function addTask(e: FormEvent<HTMLFormElement>, projectId: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const textEl = form.elements.namedItem('text') as HTMLInputElement;
    const dueEl = form.elements.namedItem('due') as HTMLInputElement;
    const text = textEl.value.trim().slice(0, 160);
    if (!text) { textEl.focus(); return; }
    const due = dueEl.value && dueEl.validity.valid ? dueEl.value : '';
    const tempId = `tmp-${Date.now()}`;
    const n = tasks.filter((t) => t.project === projectId).reduce((m, t) => Math.max(m, t.n), 0) + 1;
    setTasks((list) => [...list, { id: tempId, project: projectId, n, text, due, done: false, doneOn: '' }]);
    textEl.value = ''; dueEl.value = '';
    textEl.focus();
    const r = await post({ action: 'addTask', project: projectId, text, due });
    setTasks((list) => (r && r.task ? list.map((x) => (x.id === tempId ? r.task as Task : x)) : list.filter((x) => x.id !== tempId)));
  }
  async function addProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const get = (n: string) => (f.elements.namedItem(n) as HTMLInputElement | HTMLSelectElement).value;
    const title = get('title').trim().slice(0, 120);
    const date = get('date');
    if (!title || !parseDate(date)) return;
    const r = await post({ action: 'addProject', title, avenue: get('avenue'), kind: get('kind'), date });
    if (r && r.project) {
      const created = r.project;
      setProjects((list) => [...list, created]);
      toggleOpen(created.id, true);
      f.reset();
      say(`Added ${title}. Open its checklist to plan it.`);
    }
  }
  function toggleOpen(id: string, isOpen: boolean) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (isOpen) next.add(id); else next.delete(id);
      save('salt-city-tracker-open', JSON.stringify([...next]));
      return next;
    });
  }
  function pickFilter(f: Filter) {
    setFilter(f);
    save('salt-city-tracker-filter', f);
  }
  function flipHideDone() {
    setHideDone((v) => {
      save('salt-city-tracker-hidedone', v ? '0' : '1');
      return !v;
    });
  }

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (a.date || '9999').localeCompare(b.date || '9999') || a.title.localeCompare(b.title)),
    [projects],
  );
  const tasksBy = useMemo(() => {
    const m = new Map<string, Task[]>();
    for (const t of tasks) { if (!m.has(t.project)) m.set(t.project, []); m.get(t.project)!.push(t); }
    m.forEach((list) => list.sort((a, b) => a.n - b.n));
    return m;
  }, [tasks]);

  const today = todayStr();
  const fundCount = sorted.filter((p) => p.kind !== 'impact').length;
  const leadCount = sorted.filter((p) => p.lead.trim()).length;
  const liveTasks = tasks.filter((t) => projects.some((p) => p.id === t.project));
  const doneCount = liveTasks.filter((t) => t.done).length;
  const pct = liveTasks.length ? Math.round((doneCount / liveTasks.length) * 100) : 0;
  const next = sorted.find((p) => p.date >= today && p.status !== 'Done' && p.status !== 'Postponed');

  let shown = sorted;
  if (filter === 'fundraiser') shown = shown.filter((p) => p.kind !== 'impact');
  if (filter === 'impact') shown = shown.filter((p) => p.kind === 'impact');
  if (filter === 'nolead') shown = shown.filter((p) => !p.lead.trim());
  if (hideDone) shown = shown.filter((p) => p.status !== 'Done');

  const groups: { key: string; items: Project[] }[] = [];
  for (const p of shown) {
    const d = parseDate(p.date);
    const key = d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()}` : 'No date yet';
    if (!groups.length || groups[groups.length - 1].key !== key) groups.push({ key, items: [] });
    groups[groups.length - 1].items.push(p);
  }

  const chips: { f: Filter; label: string; n: number }[] = [
    { f: 'all', label: 'All', n: sorted.length },
    { f: 'fundraiser', label: 'Fundraisers', n: fundCount },
    { f: 'impact', label: 'Community impact', n: sorted.length - fundCount },
    { f: 'nolead', label: 'Needs a lead', n: sorted.length - leadCount },
  ];

  return (
    <div className={`${s.root} ${fontClassName}`}>
      <header className={s.crest}>
        <div className={s.wrap}>
          <div>
            <div className={s.eyebrow}>Rotaract Club of Mumbai Salt City · RY 2026–27</div>
            <h1 className={s.h1}>Salt City project tracker</h1>
            <div className={s.themeLine}>अन्त अस्ति प्रारम्भः <span>· the end is the beginning</span></div>
          </div>
          <div className={s.stats}>
            <div className={s.stat}><div className={s.k}>Projects</div><div className={s.v}>{loadState === 'ok' ? sorted.length : '–'}</div><div className={s.sub}>{fundCount} fundraisers · {sorted.length - fundCount} impact</div></div>
            <div className={s.stat}><div className={s.k}>Have a lead</div><div className={s.v}>{loadState === 'ok' ? `${leadCount} / ${sorted.length}` : '–'}</div><div className={s.sub}>{sorted.length - leadCount ? `${sorted.length - leadCount} still need someone` : 'Every project has a lead'}</div></div>
            <div className={s.stat}><div className={s.k}>Checklist done</div><div className={s.v}>{loadState === 'ok' ? `${pct}%` : '–'}</div><div className={s.meter}><i style={{ width: `${pct}%` }} /></div></div>
            <div className={s.stat}><div className={s.k}>Next up</div><div className={`${s.v} ${s.vSmall}`}>{next ? next.title : '–'}</div><div className={s.sub}>{next ? `${shortDate(next.date)} · ${next.lead.trim() ? `led by ${next.lead.trim()}` : 'no lead yet'}` : ' '}</div></div>
          </div>
        </div>
      </header>

      <div className={s.wrap}>
        <div className={s.lockbar}>
          <span>Signed in as <b>{memberName}</b>. Changes save as you go.</span>
          <Link className={s.linkBtn} href="/director">← Back to the portal</Link>
        </div>

        <div className={s.toolbar} role="group" aria-label="Show projects">
          {chips.map((c) => (
            <button key={c.f} type="button" className={s.chip} aria-pressed={filter === c.f} onClick={() => pickFilter(c.f)}>
              {c.label} <span className={s.n}>{c.n}</span>
            </button>
          ))}
          <button type="button" className={s.chip} aria-pressed={hideDone} onClick={flipHideDone}>Hide finished</button>
        </div>

        {loadState === 'loading' && (
          <div className={s.empty}><strong>Loading the project calendar</strong>Projects and checklists appear here in a moment.</div>
        )}
        {loadState === 'error' && (
          <div className={s.empty}><strong>The tracker didn’t load</strong>Couldn’t load the projects. Refresh the page to try again.</div>
        )}
        {loadState === 'ok' && !shown.length && (
          <div className={s.empty}>
            <strong>{sorted.length ? 'Nothing matches this filter' : 'No projects yet'}</strong>
            {sorted.length ? (filter === 'nolead' ? 'Every project has a lead.' : 'Switch to All to see every project.') : 'Add the first one below.'}
          </div>
        )}

        {loadState === 'ok' && groups.map((g) => (
          <section className={s.month} key={g.key}>
            <h2>{g.key}</h2>
            <div className={s.list}>
              {g.items.map((p) => {
                const d = parseDate(p.date);
                const ts = tasksBy.get(p.id) || [];
                const done = ts.filter((t) => t.done).length;
                const impact = p.kind === 'impact';
                const status = STATUSES.includes(p.status) ? p.status : 'Planning';
                return (
                  <article key={p.id} className={`${s.card} ${impact ? s.impact : s.fundraiser} ${status === 'Done' ? s.isDone : ''}`}>
                    <div className={s.when} aria-label={d ? shortDate(p.date) : 'No date'}>
                      <span className={s.dow}>{d ? DOW[d.getDay()] : 'TBD'}</span>
                      <span className={s.d}>{d ? d.getDate() : '–'}</span>
                      <span className={s.m}>{d ? `${MONTHS[d.getMonth()].slice(0, 3)} ${String(d.getFullYear()).slice(2)}` : ''}</span>
                      {p.time && <span className={s.t}>{p.time}</span>}
                    </div>
                    <div className={s.body}>
                      <div className={s.top}>
                        <div className={s.titles}>
                          <h3 className={s.title}>{p.title || 'Untitled project'}</h3>
                          <div className={s.meta}>
                            <span className={`${s.pill} ${impact ? s.pillImpact : ''}`}>{impact ? 'Community impact' : 'Fundraiser'}</span>
                            <span className={s.avenue}>{p.avenue}</span>
                            {p.when && <span className={s.avenue}>· {p.when}</span>}
                          </div>
                        </div>
                        <select
                          className={s.status}
                          data-v={status}
                          value={status}
                          aria-label={`Status of ${p.title}`}
                          onChange={(e) => updateProject(p, 'status', e.target.value)}
                        >
                          {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </div>
                      {p.summary && <p className={s.summary}>{p.summary}</p>}
                      <div className={s.people}>
                        <EditableField id={`lead-${p.id}`} label="Lead" value={p.lead} placeholder="Your name" highlight onSave={(v) => updateProject(p, 'lead', v)} />
                        <EditableField id={`team-${p.id}`} label="Team" value={p.team} placeholder="Names of everyone helping" onSave={(v) => updateProject(p, 'team', v)} />
                      </div>
                      <div className={s.foot}>
                        {p.money && <span className={s.money}><b>{impact ? 'Cost ' : 'Profit '}</b>{p.money}</span>}
                        {p.upfront && <span className={s.money}>Upfront {p.upfront}</span>}
                        <span className={s.prog}>
                          <span className={s.bar} aria-hidden="true"><i style={{ width: `${ts.length ? Math.round((done / ts.length) * 100) : 0}%` }} /></span>
                          <span>{done} of {ts.length} done</span>
                        </span>
                      </div>
                      <details className={s.more} open={open.has(p.id)} onToggle={(e) => toggleOpen(p.id, (e.currentTarget as HTMLDetailsElement).open)}>
                        <summary>Checklist, date and venue</summary>
                        <div className={s.inner}>
                          <div className={s.logistics}>
                            <EditableField id={`date-${p.id}`} label="Date" type="date" value={p.date} onSave={(v) => updateProject(p, 'date', v)} />
                            <EditableField id={`time-${p.id}`} label="Time" value={p.time} placeholder="e.g. 7 pm" onSave={(v) => updateProject(p, 'time', v)} />
                            <EditableField id={`venue-${p.id}`} label="Venue" value={p.venue} placeholder="Where it happens" className={s.venue} onSave={(v) => updateProject(p, 'venue', v)} />
                          </div>
                          <ul className={s.checklist}>
                            {ts.map((t) => {
                              const late = !t.done && t.due && t.due < today;
                              return (
                                <li key={t.id} className={`${s.task} ${t.done ? s.taskDone : ''}`}>
                                  <input type="checkbox" id={`task-${t.id}`} checked={t.done} disabled={t.id.startsWith('tmp-')} onChange={(e) => toggleTask(t, e.target.checked)} />
                                  <label htmlFor={`task-${t.id}`}>
                                    {t.text}
                                    {t.due && <span className={`${s.due} ${late ? s.late : ''}`}>{late ? `Overdue · was due ${shortDate(t.due)}` : `By ${shortDate(t.due)}`}</span>}
                                  </label>
                                  <button type="button" className={`${s.x} ${armed === t.id ? s.xConfirm : ''}`} aria-label={armed === t.id ? 'Confirm remove' : 'Remove this item'} onClick={() => removeTask(t)}>
                                    {armed === t.id ? 'Remove?' : '×'}
                                  </button>
                                </li>
                              );
                            })}
                            {!ts.length && <li className={s.task}><span /><label>No checklist items yet.</label><span /></li>}
                          </ul>
                          <form className={s.addtask} onSubmit={(e) => addTask(e, p.id)} autoComplete="off">
                            <input name="text" type="text" placeholder="Add a to-do" maxLength={160} aria-label={`New to-do for ${p.title}`} />
                            <input name="due" type="date" min="2026-07-01" max="2027-06-30" aria-label="Due date (optional)" />
                            <button className={s.btn} type="submit">Add</button>
                          </form>
                        </div>
                      </details>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}

        {loadState === 'ok' && (
          <section className={s.newproj}>
            <h2>Add a project</h2>
            <form className={s.newgrid} onSubmit={addProject} autoComplete="off">
              <div className={`${s.field} ${s.wide}`}><label htmlFor="np-title">Project name</label><input id="np-title" name="title" type="text" maxLength={120} placeholder="e.g. Tree plantation drive" required /></div>
              <div className={`${s.field} ${s.wide}`}><label htmlFor="np-avenue">Avenue</label>
                <select id="np-avenue" name="avenue">{AVENUES.map((a) => <option key={a}>{a}</option>)}</select>
              </div>
              <div className={s.field}><label htmlFor="np-kind">Type</label>
                <select id="np-kind" name="kind"><option value="fundraiser">Fundraiser</option><option value="impact">Community impact</option></select>
              </div>
              <div className={s.field}><label htmlFor="np-date">Date</label><input id="np-date" name="date" type="date" min="2026-07-01" max="2027-06-30" required /></div>
              <button className={s.btn} type="submit">Add project</button>
            </form>
          </section>
        )}

        <footer className={s.footer}>
          Gold edge: fundraiser. Green edge: community impact. A red Lead box means nobody has picked that project up yet. Profit and cost figures are estimates; swap in real quotes as you get them. Changes from other people show up within 30 seconds.
        </footer>
      </div>
      {toast && <div className={s.toast} role="status">{toast}</div>}
    </div>
  );
}
