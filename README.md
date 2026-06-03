# Westside Lexus Voice AI — Intern Journey

A single web app that does three things at once for a GST Data & AI summer
intern (Tyler Brennan) and his manager (Usman, Director of Data & AI):

1. **Weekly Learning + Task Tracker** — a 10-week, date-anchored AI curriculum
   (June 1 – Aug 7, 2026) with objectives, checkable tasks, concept primers,
   and reflections.
2. **Voice AI Project Workspace** — a real vendor-evaluation tool: weighted RFP
   scoring matrix with auto-ranking, plus a decision log and vendor-discussion
   prep notes for the Westside Lexus Voice AI selection.
3. **Gamification Layer** — XP, levels, badges, a momentum streak, and a visual
   10-week journey map to build genuine enthusiasm for enterprise AI.

Built with **Next.js (App Router) + TypeScript + Tailwind**. Data lives in a
local **SQLite** file (via `better-sqlite3`) — **no cloud account, no setup**.
The database creates and seeds itself the first time you run the app.

---

## Quick start (≈ 2 minutes, no accounts)

```bash
npm install
npm run dev
```

Open **http://localhost:3000**. The app creates `data/app.db`, seeds the full
10-week curriculum + Voice AI workspace, and opens **straight to the dashboard**
— no login, no passwords. You start as:

- **Tyler Brennan** — *Intern*: the working/learning view (check off tasks,
  write reflections, score vendors, earn XP & badges).

Use the **“view as” toggle** in the top nav to switch to:

- **Usman** — *Manager*: a read-only oversight view across everything Tyler does.

That's it — everything works immediately with seeded demo data.

> **Where's my data?** It's in `data/app.db` (git-ignored). Delete that file to
> reset to a fresh seeded state. To put the DB somewhere else, set
> `SQLITE_PATH=/abs/path/app.db`.

---

## Roles

| Role | Who | Can do |
| --- | --- | --- |
| `intern` | Tyler Brennan | Update task status, write & submit reflections, score vendors, edit criteria/vendors, add decision-log entries. Earns XP & badges. |
| `manager` | Usman | Read-only **oversight** — completion %, overdue tasks, weekly reflections, vendor standings, XP & badges. Cannot edit the intern's data. |

SQLite has no row-level security, so these rules are enforced in the API route
handlers: manager requests to write anything return **403**.

---

## How it works

### Curriculum (the 10 weeks)
The weekly arc and its real-calendar dates live in
[`lib/curriculum.ts`](./lib/curriculum.ts) and are used both as the UI source of
truth and to seed the database.

| Weeks | Theme |
| --- | --- |
| 1–2 | Enterprise AI vs. consumer AI; why Voice AI matters in dealership ops |
| 3–4 | How companies evaluate vendors — RFPs, scoring, proof of concept |
| 5–6 | Data requirements for AI; why clean data is the foundation |
| 7–8 | Building the business case; how AI decisions get made at the C-suite |
| 9–10 | Synthesis + final presentation prep |

Milestones baked into the dates: June 1 orientation, June 2 first day in BU,
June 12 trivia/tours, June 29 mid-summer eval, July 4 holiday, Jul 28–29 / Aug
4–5 presentation windows, Aug 6 summer bash, Aug 7 last day.

### Scoring model
1–5 score per criterion; criteria carry **percentage weights that sum to 100**.
A vendor's weighted total = `Σ (score ÷ 5 × weight%)`, so a perfect vendor
scores **100**. Computed live in the matrix (`lib/xp.ts → computeRankings`).

### Gamification
XP is stored as idempotent `xp_events` (unique per `ref`) so nothing
double-counts. Levels follow a triangular curve (`lib/xp.ts`). Badges and
week-completion XP are recomputed after each relevant mutation
(`lib/db/repo.ts → recomputeGamification`). XP is awarded for completing tasks,
finishing weeks, scoring vendors, and submitting reflections.

---

## Project structure

```
app/
  (app)/                 # authenticated shell (navbar + role-aware nav)
    dashboard/           # role-adaptive landing: XP, streak, journey map
    weeks/               # 10-week tracker list
    weeks/[week]/        # objective, tasks, primer, reflection
    workspace/           # RFP matrix + decision log + prep notes
    manager/             # Usman's read-only oversight
  api/                   # route handlers: tasks, reflections, scores,
                         #   vendors, criteria, decision-log, profile,
                         #   auth/login, health
  auth/signout/          # clears the session cookie
  login/                 # "enter as Tyler / Usman" picker
lib/
  db/connection.ts       # SQLite open + schema + auto-seed
  db/repo.ts             # all queries, mutations, and the gamification engine
  session.ts             # cookie session helpers
  curriculum.ts          # 10-week curriculum + badge defs (source of truth)
  xp.ts                  # level curve, ranking & streak math
  progress.ts            # completion / overdue / journey-map helpers
  data.ts                # server-side data access (delegates to repo)
  types.ts
middleware.ts            # cookie-based route protection (Edge-safe)
supabase/schema.sql      # OPTIONAL Postgres/Supabase reference schema (not used
                         #   by the app; see "Deploying with persistence")
```

---

## Scripts

```bash
npm run dev        # local dev server (auto-creates & seeds data/app.db)
npm run build      # production build
npm run start      # serve the production build
npm run lint       # next lint
npm run typecheck  # tsc --noEmit
```

---

## Deploying with persistence

`better-sqlite3` writes to a file, which is perfect for local use and for any
**always-on Node host** (Render, Railway, Fly.io, a VM, Docker) — the data
persists right alongside the app.

**Vercel caveat:** Vercel runs serverless functions on an ephemeral filesystem,
so file writes don't persist between invocations. For a persistent deployment
you have two easy paths:

1. **Turso / libSQL** (SQLite-compatible, free tier): swap `better-sqlite3` for
   `@libsql/client` in `lib/db/connection.ts` and point it at your Turso URL +
   token. Same schema, minimal code change.
2. **Postgres / Supabase**: the included
   [`supabase/schema.sql`](./supabase/schema.sql) is a complete Postgres schema
   (tables, RLS policies, rankings view, seed data) you can run as-is if you'd
   rather host on Supabase; you'd point the data layer at it.

For a simple always-on host, no changes are needed — just deploy and run.

---

## Configuration

No environment variables are required. Optional:

| Var | Default | Purpose |
| --- | --- | --- |
| `SQLITE_PATH` | `./data/app.db` | Where the SQLite file lives. |
| `NEXT_PUBLIC_ENABLE_DEMO_TOGGLE` | `true` | Show the in-nav “view as intern/manager” toggle. Set `false` to hide it. |
