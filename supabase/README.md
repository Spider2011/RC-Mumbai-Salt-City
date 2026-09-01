# Director Portal — setup

A hidden portal at **`/director`** where directors sign in and log the projects
run under their avenue. It is **not linked anywhere** on the site and is marked
`noindex`, so it never appears in menus or search results. Reports are stored in
Supabase for club records only — nothing is published to the public site.

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

### 4. Create director logins
For each director:
1. **Authentication → Users → Add user** — enter their email + a password and
   tick **Auto Confirm User**.
2. Copy the new user's **User UID**.
3. **SQL Editor**, run (avenue must be one of the eleven, spelled exactly):
   ```sql
   insert into public.directors (id, full_name, avenue) values
     ('PASTE-USER-UID', 'Rtr. Full Name', 'Community Service');
   ```

Share each director their email + password. Send them to `https://your-site/director`.

## How it works
- **Auth**: Supabase email/password. `proxy.ts` guards every `/director` route
  and bounces anyone not signed in to `/director/login`.
- **Security**: Row Level Security means a director can only ever insert/read
  their **own** reports and photos, even though the anon key is public.
- **Where to read submissions**: Supabase **Table Editor → `project_reports`**
  (the owner view bypasses RLS, so you see everyone's). Photos live in
  **Storage → `project-reports`**, foldered by director.

## Avenues
Club Service · Community Service · Professional Development · International
Service · PR and Marketing · Digital Communication · Entrepreneurship
Development · Editor · Partners-In-Service · Sports · Social Media
