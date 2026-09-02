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
  created_at    timestamptz not null default now()
);

alter table public.project_reports enable row level security;

-- Anyone signed in may insert a report as themselves (directors do this).
drop policy if exists "Members insert own reports" on public.project_reports;
create policy "Members insert own reports"
  on public.project_reports for insert to authenticated
  with check (director_id = auth.uid());

-- Directors read their OWN reports; core members read EVERYONE'S.
drop policy if exists "Read own or all if core" on public.project_reports;
create policy "Read own or all if core"
  on public.project_reports for select to authenticated
  using (director_id = auth.uid() or public.is_core());

create index if not exists project_reports_created_idx
  on public.project_reports (created_at desc);

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

-- Read own photos; core members can read everyone's (to review reports).
drop policy if exists "Read own photos or all if core" on storage.objects;
create policy "Read own photos or all if core"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'project-reports'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_core())
  );

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
