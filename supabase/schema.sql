-- ============================================================================
-- RCMSC Director Portal — Supabase schema
-- Run this once in your Supabase project: Dashboard → SQL Editor → paste → Run.
-- ============================================================================

-- ── Directors (profile, 1:1 with an auth user) ──────────────────────────────
create table if not exists public.directors (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  avenue     text not null,
  created_at timestamptz not null default now()
);

alter table public.directors enable row level security;

drop policy if exists "Directors read own profile" on public.directors;
create policy "Directors read own profile"
  on public.directors for select to authenticated
  using (id = auth.uid());

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

-- Directors may only insert rows as themselves…
drop policy if exists "Directors insert own reports" on public.project_reports;
create policy "Directors insert own reports"
  on public.project_reports for insert to authenticated
  with check (director_id = auth.uid());

-- …and only read their own. (You, as owner, read everything from the
-- dashboard's Table Editor, which bypasses RLS.)
drop policy if exists "Directors read own reports" on public.project_reports;
create policy "Directors read own reports"
  on public.project_reports for select to authenticated
  using (director_id = auth.uid());

create index if not exists project_reports_created_idx
  on public.project_reports (created_at desc);

-- ── Storage bucket for project photos ───────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('project-reports', 'project-reports', false)
on conflict (id) do nothing;

-- Each director may write/read only inside a folder named after their user id.
drop policy if exists "Directors upload own photos" on storage.objects;
create policy "Directors upload own photos"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'project-reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Directors read own photos" on storage.objects;
create policy "Directors read own photos"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'project-reports'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- ADDING A DIRECTOR (repeat per director)
-- 1) Dashboard → Authentication → Users → Add user
--      • enter their email + a password
--      • tick "Auto Confirm User"
-- 2) Copy that new user's ID (User UID).
-- 3) Run the insert below with their details:
--
--    insert into public.directors (id, full_name, avenue) values
--      ('PASTE-USER-UID-HERE', 'Rtr. Full Name', 'Community Service');
--
--    (avenue must be one of the eleven, exactly:
--     Club Service, Community Service, Professional Development,
--     International Service, PR and Marketing, Digital Communication,
--     Entrepreneurship Development, Editor, Partners-In-Service,
--     Sports, Social Media)
-- ============================================================================
