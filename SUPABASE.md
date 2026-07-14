# Deep Dive — making it live (Supabase, Stage A)

The app is **local-first by default**: with no Supabase configured it runs on
`localStorage` exactly as always. Configure a project and it becomes an
**authenticated, cloud-synced, multi-device** tool — your work follows you
across browsers and machines, and is safely backed up.

Stage A stores the entire app state as **one JSON document per signed-in user**.
It's the fast path to "live." (Stage B — normalized tables, real-time
multi-editor, share links — builds on top of this later.)

## 5-minute setup

1. **Create a project** at [supabase.com](https://supabase.com) (free tier is fine).
   No credit card. Pick a region close to you (e.g. Frankfurt).

2. **Run this SQL** — Dashboard → SQL Editor → New query → paste → Run:

   ```sql
   create table if not exists public.deep_dive_projects (
     owner      uuid        not null references auth.users(id) on delete cascade,
     project    text        not null default 'main',
     doc        jsonb       not null,
     updated_at timestamptz not null default now(),
     primary key (owner, project)
   );

   alter table public.deep_dive_projects enable row level security;

   create policy "owner reads"   on public.deep_dive_projects
     for select using (auth.uid() = owner);
   create policy "owner inserts" on public.deep_dive_projects
     for insert with check (auth.uid() = owner);
   create policy "owner updates" on public.deep_dive_projects
     for update using (auth.uid() = owner) with check (auth.uid() = owner);
   ```

   Row-level security means each account can only ever see its own document.

3. **Get the keys** — Dashboard → Project Settings → API. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`
     (this key is *meant* to ship in client code — RLS is what protects the data)

4. **Add them** — copy `.env.example` to `.env.local` and paste the two values.
   `.env.local` is gitignored, so your keys never get committed.

5. **Email link setup (Supabase)** — Dashboard → Authentication → URL
   Configuration → add your site URL(s) to **Redirect URLs**:
   - `http://localhost:5173` (local dev)
   - your Vercel URL (e.g. `https://deep-dive-xxxx.vercel.app`) once deployed

6. **Restart the dev server** (`npm run dev`). You'll now get a sign-in screen;
   enter your email, click the magic link, and you're in — cloud-synced.

## On Vercel

Add the same two variables in Vercel → Project → Settings → Environment
Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`), then redeploy. Add the
Vercel URL to Supabase Redirect URLs (step 5).

## Turning it off

Delete `.env.local` (or the two vars) and restart — the app drops straight back
to local-only, no sign-in, no network.

## What's next (Stage B, when you want it)

- **Share links** — a read-only token so a funder/sponsor opens the pitch deck
  without an account (add a public `select` policy keyed on a share token).
- **Crew invites** — multiple editors on one project (a `members` table).
- **Real-time** — Supabase Realtime so the crew sees each other's edits live.
- **Normalized tables** — move hot entities (four, shoots, interviews, pitch)
  out of the JSON blob into real rows for querying + granular concurrency.
