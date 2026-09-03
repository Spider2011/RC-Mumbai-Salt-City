-- ============================================================================
-- RCMSC Director Portal — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → paste → Run.
--
-- Two roles:
--   • director  — submits project reports (sees only their own)
--   • core      — core team; can view ALL reports (read-only oversight)
-- ============================================================================

-- ── Members (profile, 1:1 with an auth user) ────────────────────────────────
create table if not exists public.members (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  role       text not null default 'director' check (role in ('director', 'core')),
  avenue     text,                       -- required for directors, optional for core
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;

drop policy if exists "Members read own profile" on public.members;
create policy "Members read own profile"
  on public.members for select to authenticated
  using (id = auth.uid());

-- Helper: is the current user a core member? SECURITY DEFINER so it can read
-- public.members without tripping that table's RLS (and without recursion).
create or replace function public.is_core()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.members
    where id = auth.uid() and role = 'core'
  );
$$;

-- Helper: the current user's avenue (null for core members without one).
create or replace function public.my_avenue()
returns text
language sql
security definer
set search_path = public
as $$
  select avenue from public.members where id = auth.uid();
$$;

-- Helper: may the current user read a storage object at `object_name`?
-- True for their own uploads, any upload by a director in the same avenue,
-- or anything if they are core.
create or replace function public.can_read_upload(object_name text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select
    (storage.foldername(object_name))[1] = auth.uid()::text
    or public.is_core()
    or exists (
      select 1
      from public.members me
      join public.members owner
        on owner.id::text = (storage.foldername(object_name))[1]
      where me.id = auth.uid()
        and me.avenue is not null
        and me.avenue = owner.avenue
    );
$$;

-- ── Project reports (the internal log) ──────────────────────────────────────
create table if not exists public.project_reports (
  id            uuid primary key default gen_random_uuid(),
  director_id   uuid not null references auth.users (id) on delete cascade,
  director_name text not null,
  avenue        text not null,
  title         text not null,
  project_date  date,
  location      text default '',
  beneficiaries int  default 0,
  description   text not null,
  photo_paths   text[] default '{}',
  report_doc    text,                       -- storage path of the uploaded PDF/Word report
  created_at    timestamptz not null default now()
);

-- If the table already existed before this column was added, run:
--   alter table public.project_reports add column if not exists report_doc text;

alter table public.project_reports enable row level security;

-- Anyone signed in may insert a report as themselves (directors do this).
drop policy if exists "Members insert own reports" on public.project_reports;
create policy "Members insert own reports"
  on public.project_reports for insert to authenticated
  with check (director_id = auth.uid());

-- Directors read reports in their OWN avenue; core members read EVERYONE'S.
drop policy if exists "Read own or all if core" on public.project_reports;
drop policy if exists "Read own, avenue, or all if core" on public.project_reports;
create policy "Read own, avenue, or all if core"
  on public.project_reports for select to authenticated
  using (
    director_id = auth.uid()
    or public.is_core()
    or (avenue is not null and avenue = public.my_avenue())
  );

create index if not exists project_reports_created_idx
  on public.project_reports (created_at desc);

-- Public count of reported projects (number only — no data) for the homepage
-- impact dashboard. SECURITY DEFINER so it bypasses RLS to count everything.
create or replace function public.reported_count()
returns integer
language sql
security definer
stable
set search_path = public
as $$
  select count(*)::int from public.project_reports;
$$;
grant execute on function public.reported_count() to anon, authenticated;

-- ── Storage bucket for project photos ───────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('project-reports', 'project-reports', false)
on conflict (id) do nothing;

-- Directors write only inside their own folder (named after their user id).
drop policy if exists "Members upload own photos" on storage.objects;
create policy "Members upload own photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Read own uploads, a same-avenue director's uploads, or everything if core.
drop policy if exists "Read own photos or all if core" on storage.objects;
drop policy if exists "Read uploads by rule" on storage.objects;
create policy "Read uploads by rule"
  on storage.objects for select to authenticated
  using (bucket_id = 'project-reports' and public.can_read_upload(name));

-- ============================================================================
-- ADDING A PERSON (repeat per director / core member)
-- 1) Dashboard → Authentication → Users → Add user
--      • enter their email + a password
--      • tick "Auto Confirm User"
-- 2) Copy that new user's ID (User UID).
-- 3) Run ONE of the inserts below with their details:
--
--    -- a director (submits reports for one avenue):
--    insert into public.members (id, full_name, role, avenue) values
--      ('PASTE-USER-UID', 'Rtr. Full Name', 'director', 'Community Service');
--
--    -- a core member (views all reports; avenue optional):
--    insert into public.members (id, full_name, role) values
--      ('PASTE-USER-UID', 'Rtr. Full Name', 'core');
--
--    (avenue must be one of the eleven, exactly:
--     Club Service, Community Service, Professional Development,
--     International Service, PR and Marketing, Digital Communication,
--     Entrepreneurship Development, Editor, Partners-In-Service,
--     Sports, Social Media)
-- ============================================================================
