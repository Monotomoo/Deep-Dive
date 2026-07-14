# Deep Dive — going live for the crew (Supabase)

The app is **local-first by default**: with no Supabase configured it runs on
`localStorage` exactly as always. Configure a project and it becomes an
**authenticated, cloud-synced, shared crew tool** — everyone you invite signs in
and edits the **same** Deep Dive, live.

- **One shared project.** There is a single document every crew member reads and
  writes. Petar, Vito, you — same data, same edits.
- **Invite-only.** Only email addresses you invite in Supabase can sign in.
  Everyone else is turned away. Right choice for unreleased film material.
- **Live-refresh.** When one person saves, the others' screens pull the change
  in within a second (Supabase Realtime). Last-write-wins on the whole document
  — fine for a small crew, not simultaneous same-field editing.

---

## 5-minute setup (you do this once)

### 1 · Create a project
At [supabase.com](https://supabase.com) → New project (free tier is fine, no
card). Pick a region close to you (e.g. Frankfurt).

### 2 · Run this SQL
Dashboard → SQL Editor → New query → paste → Run:

```sql
-- One shared row for the whole crew.
create table if not exists public.deep_dive_shared (
  project     text        primary key default 'main',
  doc         jsonb       not null,
  updated_at  timestamptz not null default now(),
  updated_by  text
);

alter table public.deep_dive_shared enable row level security;

-- Any signed-in (invited) crew member can read and write the shared project.
create policy "crew reads"   on public.deep_dive_shared
  for select to authenticated using (true);
create policy "crew inserts" on public.deep_dive_shared
  for insert to authenticated with check (true);
create policy "crew updates" on public.deep_dive_shared
  for update to authenticated using (true) with check (true);

-- Live-refresh: broadcast row changes to every connected client.
alter publication supabase_realtime add table public.deep_dive_shared;
```

`to authenticated` means only signed-in users get in at all; RLS + invite-only
signups are what keep the public out.

### 3 · Turn OFF public sign-ups (this is what makes it invite-only)
Dashboard → **Authentication → Sign In / Providers → Email** → turn **"Allow new
users to sign up" OFF**. Now only people you explicitly invite can log in.

### 4 · Invite the crew
Dashboard → **Authentication → Users → Add user → Send invitation** — enter each
crew member's email (yours first). They'll get an email; the magic link drops
them straight into the app. Repeat for every person who should have access.

### 5 · Get the keys
Dashboard → **Project Settings → API**. Copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_ANON_KEY`
  (this key is *meant* to ship in client code — RLS is what protects the data)

### 6 · Add the keys to Vercel (it's already deployed there)
Vercel → your Deep Dive project → **Settings → Environment Variables** → add
both (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) for Production →
**redeploy** (Deployments → ⋯ → Redeploy). For local dev, also copy
`.env.example` to `.env.local` and paste the two values (`.env.local` is
gitignored).

### 7 · Point Supabase back at your site
Dashboard → **Authentication → URL Configuration → Redirect URLs** → add:
- your Vercel URL (e.g. `https://deep-dive-xxxx.vercel.app`)
- `http://localhost:5173` (for local dev)

### 8 · Seed the shared project from YOUR data — important
The very first time someone logs in, the app seeds the shared project from
*that browser's* local copy. **So you must log in first, on the machine that
holds the real production data.** If a crew member happens to log in before you
and seeds it with a blank copy, don't worry — open the app on your machine and
click **"↑ publish my copy to crew"** in the sidebar footer to overwrite the
shared project with your real data.

---

## Day-to-day
- Everyone opens the Vercel URL, enters their email, clicks the link, and they're
  in — same shared Deep Dive, live.
- The sidebar footer shows **shared crew project · synced** and who's signed in.
- Adding someone later: repeat step 4. Removing someone: Authentication → Users →
  delete them.

## Turning it off
Delete the two env vars in Vercel (and `.env.local` locally) and redeploy — the
app drops straight back to local-only, no sign-in, no network.

## What's next (when you want it)
- **Share links** — a read-only token so a funder opens the pitch deck without an
  account.
- **Per-field merge / presence** — see who's editing what, live cursors. (Stage C
  — real-time collaborative editing, beyond the current whole-doc sync.)
