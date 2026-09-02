# Director Portal — setup

A hidden portal at **`/director`** with two roles:

- **Director** — signs in and logs the projects run under their avenue. Sees
  only their own reports.
- **Core member** — signs in and reviews **all** reports from every avenue
  (read-only oversight), with photos.

It is **not linked anywhere** on the site and is marked `noindex`, so it never
appears in menus or search results. Reports are stored in Supabase for club
records only — nothing is published to the public site.

## One-time setup

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) → **New project**. Pick a name and a
strong database password. Wait for it to finish provisioning.

### 2. Create the tables, policies and storage bucket
In the Supabase dashboard: **SQL Editor → New query** → paste the whole of
[`supabase/schema.sql`](./schema.sql) → **Run**.

### 3. Add the environment variables
In Supabase: **Project Settings → API**. Copy:
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Add both in **Vercel → Project → Settings → Environment Variables**, then
redeploy. (For local dev, put them in `.env.local`.)

### 4. Create logins (one per person)
For each director **and** each core member:
1. **Authentication → Users → Add user** — enter their email + a password and
   tick **Auto Confirm User**.
2. Copy the new user's **User UID**.
3. **SQL Editor**, run **one** of:
   ```sql
   -- a director (submits reports for one avenue):
   insert into public.members (id, full_name, role, avenue) values
     ('PASTE-USER-UID', 'Rtr. Full Name', 'director', 'Community Service');

   -- a core member (reviews all reports; avenue optional):
   insert into public.members (id, full_name, role) values
     ('PASTE-USER-UID', 'Rtr. Full Name', 'core');
   ```
   (avenue must be one of the eleven, spelled exactly — see the list below.)

Share each person their own email + password. Send them to
`https://your-site/director`. Directors see the submit form; core members see
the review view automatically, based on their role.

## How it works
- **Auth**: Supabase email/password, one account per person. `proxy.ts` guards
  every `/director` route and bounces anyone not signed in to `/director/login`.
- **Roles & security**: Row Level Security enforces access in the database, not
  just the UI. A **director** can only insert/read their **own** reports and
  photos; a **core** member can read everyone's. The public anon key can't
  bypass this.
- **Where to read submissions**: core members read them right in the portal.
  You can also see everything in Supabase **Table Editor → `project_reports`**
  (owner view bypasses RLS). Photos live in **Storage → `project-reports`**,
  foldered by director.

## Avenues
Club Service · Community Service · Professional Development · International
Service · PR and Marketing · Digital Communication · Entrepreneurship
Development · Editor · Partners-In-Service · Sports · Social Media
