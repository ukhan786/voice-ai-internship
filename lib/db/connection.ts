import "server-only";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { CURRICULUM, BADGES } from "@/lib/curriculum";
import { INTERN_ID, MANAGER_ID } from "@/lib/constants";

/**
 * Local SQLite backend (zero cloud setup). The database file lives at
 * `data/app.db` and is created + seeded automatically the first time the app
 * runs. This replaces Supabase/Postgres for local-first use; role rules that
 * Postgres handled via RLS are enforced in the API routes instead.
 *
 * Note: SQLite writes to a file, so this persists on any always-on server and
 * for local `npm run dev`. On Vercel's ephemeral serverless filesystem writes
 * won't persist between invocations — use Turso/libSQL or Supabase there.
 */

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), "data", "app.db");

export { INTERN_ID, MANAGER_ID };

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  createSchema(db);
  seedIfEmpty(db);

  _db = db;
  return db;
}

function createSchema(db: Database.Database) {
  db.exec(`
    create table if not exists profiles (
      id          text primary key,
      full_name   text not null default 'New User',
      title       text,
      role        text not null default 'intern' check (role in ('intern','manager')),
      created_at  text not null default (datetime('now'))
    );

    create table if not exists weeks (
      week_no            integer primary key,
      title              text not null,
      theme              text not null,
      start_date         text not null,
      end_date           text not null,
      objective          text not null,
      primer_title       text not null,
      primer_body        text not null,
      reflection_prompt  text not null,
      milestone_label    text
    );

    create table if not exists tasks (
      id          text primary key,
      week_no     integer not null references weeks(week_no) on delete cascade,
      title       text not null,
      status      text not null default 'todo' check (status in ('todo','in_progress','done')),
      xp          integer not null default 20,
      sort        integer not null default 0,
      updated_at  text not null default (datetime('now'))
    );

    create table if not exists reflections (
      id            text primary key,
      week_no       integer not null references weeks(week_no) on delete cascade,
      profile_id    text not null references profiles(id) on delete cascade,
      body          text not null default '',
      submitted_at  text,
      updated_at    text not null default (datetime('now')),
      unique (week_no, profile_id)
    );

    create table if not exists vendors (
      id          text primary key,
      name        text not null,
      summary     text,
      created_at  text not null default (datetime('now'))
    );

    create table if not exists criteria (
      id           text primary key,
      name         text not null,
      description  text,
      weight       real not null default 0,
      sort         integer not null default 0
    );

    create table if not exists scores (
      id            text primary key,
      vendor_id     text not null references vendors(id)  on delete cascade,
      criterion_id  text not null references criteria(id) on delete cascade,
      score         integer not null check (score between 1 and 5),
      notes         text,
      updated_at    text not null default (datetime('now')),
      unique (vendor_id, criterion_id)
    );

    create table if not exists decision_log (
      id          text primary key,
      entry_type  text not null default 'note' check (entry_type in ('decision','note','prep')),
      title       text not null,
      body        text not null default '',
      author_id   text references profiles(id) on delete set null,
      created_at  text not null default (datetime('now'))
    );

    create table if not exists badges (
      key          text primary key,
      name         text not null,
      description  text not null,
      icon         text not null default '⭐',
      hint         text not null default ''
    );

    create table if not exists user_badges (
      id          text primary key,
      profile_id  text not null references profiles(id) on delete cascade,
      badge_key   text not null references badges(key) on delete cascade,
      earned_at   text not null default (datetime('now')),
      unique (profile_id, badge_key)
    );

    create table if not exists xp_events (
      id          text primary key,
      profile_id  text not null references profiles(id) on delete cascade,
      source      text not null,
      amount      integer not null,
      ref         text,
      created_at  text not null default (datetime('now')),
      unique (profile_id, ref)
    );
  `);
}

// Workspace seed (mirrors supabase/schema.sql).
const CRITERIA_SEED = [
  ["Transcription Accuracy", "Word-error-rate on automotive terms (models, VINs, service language).", 25, 0],
  ["Latency / Responsiveness", "End-to-end response time; does it feel like a natural conversation?", 15, 1],
  ["Integration Complexity", "Effort to connect to our DMS/CRM and telephony (lower effort scores higher).", 20, 2],
  ["Total Cost", "Licensing + implementation + ongoing cost vs. budget (better value scores higher).", 15, 3],
  ["Data Requirements & Governance", "What customer data is needed, how it's stored/retained, and privacy posture.", 15, 4],
  ["Dealer-Workflow Fit", "How well it maps to real service/sales/parts workflows out of the box.", 10, 5],
] as const;

const VENDOR_SEED = [
  ["VoxAuto AI", "Automotive-specialized voice agent; strong DMS integrations, premium pricing."],
  ["Concierge Voice", "General-purpose enterprise voice platform; flexible but needs custom tuning."],
  ["DriveLine Assist", "Telephony-first startup; fast and cheap, lighter on governance maturity."],
] as const;

const SCORE_SEED: [string, string, number, string][] = [
  ["VoxAuto AI", "Transcription Accuracy", 5, "Best-in-class on automotive vocabulary in demo."],
  ["VoxAuto AI", "Latency / Responsiveness", 4, "Snappy; minor pauses on long VIN read-backs."],
  ["VoxAuto AI", "Integration Complexity", 3, "Pre-built DMS connector exists but needs config."],
  ["VoxAuto AI", "Total Cost", 2, "Premium tier; above current budget envelope."],
  ["VoxAuto AI", "Data Requirements & Governance", 4, "Clear retention controls; SOC 2 in place."],
  ["VoxAuto AI", "Dealer-Workflow Fit", 5, "Service scheduling flow maps almost 1:1."],
  ["Concierge Voice", "Transcription Accuracy", 3, "Good general accuracy; needs automotive tuning."],
  ["Concierge Voice", "Latency / Responsiveness", 4, "Consistent response times."],
  ["Concierge Voice", "Integration Complexity", 4, "Solid APIs; CRM integration straightforward."],
  ["Concierge Voice", "Total Cost", 4, "Mid-market pricing, fits budget."],
  ["Concierge Voice", "Data Requirements & Governance", 4, "Mature governance; configurable PII handling."],
  ["Concierge Voice", "Dealer-Workflow Fit", 3, "Requires building dealership workflows."],
  ["DriveLine Assist", "Transcription Accuracy", 3, "Decent; struggles on rare model names."],
  ["DriveLine Assist", "Latency / Responsiveness", 5, "Fastest of the three in testing."],
  ["DriveLine Assist", "Integration Complexity", 3, "Telephony easy; DMS integration custom work."],
  ["DriveLine Assist", "Total Cost", 5, "Lowest cost; startup-friendly pricing."],
  ["DriveLine Assist", "Data Requirements & Governance", 2, "Governance still maturing; needs DPA review."],
  ["DriveLine Assist", "Dealer-Workflow Fit", 3, "Flexible but minimal dealership templates."],
];

const LOG_SEED: [string, string, string, string][] = [
  [
    "decision",
    "Evaluation goal & scope",
    "Westside Lexus is evaluating Voice AI to handle inbound service scheduling, after-hours call capture, and internal staff assistance. Scope for this phase: select a vendor for a 90-day proof of concept on the service line. Decision target: end of summer, with a recommendation to leadership.",
    "2026-06-15 16:00:00",
  ],
  [
    "prep",
    "Vendor discussion — standard question set",
    "Bring to every vendor call:\n1) What is your word-error-rate on automotive terms (models, VINs, service codes)?\n2) How do you confirm a VIN read-back?\n3) What is the integration path to our DMS/CRM, and typical timeline?\n4) Where is customer data stored, for how long, and who can access it?\n5) How do clean human hand-offs work when the AI is unsure?",
    "2026-06-16 10:00:00",
  ],
  [
    "note",
    "Initial impressions",
    "VoxAuto AI is clearly the most automotive-native but pricing is a concern. Concierge Voice is the balanced option. DriveLine Assist is tempting on cost/speed but governance needs scrutiny before any POC.",
    "2026-06-22 14:30:00",
  ],
];

function seedIfEmpty(db: Database.Database) {
  const seeded = db.prepare("select count(*) as n from weeks").get() as { n: number };
  if (seeded.n > 0) return;

  const uuid = () => globalThis.crypto.randomUUID();

  const tx = db.transaction(() => {
    // Profiles
    const insProfile = db.prepare(
      "insert into profiles (id, full_name, title, role) values (?, ?, ?, ?)",
    );
    insProfile.run(INTERN_ID, "Tyler Brennan", "Summer Intern", "intern");
    insProfile.run(MANAGER_ID, "Usman", "Director of Data & AI", "manager");

    // Weeks + tasks (from the shared curriculum)
    const insWeek = db.prepare(`insert into weeks
      (week_no, title, theme, start_date, end_date, objective, primer_title, primer_body, reflection_prompt, milestone_label)
      values (@week_no, @title, @theme, @start_date, @end_date, @objective, @primer_title, @primer_body, @reflection_prompt, @milestone_label)`);
    const insTask = db.prepare(
      "insert into tasks (id, week_no, title, xp, sort) values (?, ?, ?, ?, ?)",
    );
    for (const w of CURRICULUM) {
      insWeek.run({
        week_no: w.week_no,
        title: w.title,
        theme: w.theme,
        start_date: w.start_date,
        end_date: w.end_date,
        objective: w.objective,
        primer_title: w.primer_title,
        primer_body: w.primer_body,
        reflection_prompt: w.reflection_prompt,
        milestone_label: w.milestone_label,
      });
      w.tasks.forEach((t, i) => insTask.run(uuid(), w.week_no, t.title, t.xp, i));
    }

    // Criteria
    const insCriterion = db.prepare(
      "insert into criteria (id, name, description, weight, sort) values (?, ?, ?, ?, ?)",
    );
    const criterionIdByName: Record<string, string> = {};
    for (const [name, desc, weight, sort] of CRITERIA_SEED) {
      const id = uuid();
      criterionIdByName[name] = id;
      insCriterion.run(id, name, desc, weight, sort);
    }

    // Vendors
    const insVendor = db.prepare(
      "insert into vendors (id, name, summary) values (?, ?, ?)",
    );
    const vendorIdByName: Record<string, string> = {};
    for (const [name, summary] of VENDOR_SEED) {
      const id = uuid();
      vendorIdByName[name] = id;
      insVendor.run(id, name, summary);
    }

    // Scores
    const insScore = db.prepare(
      "insert into scores (id, vendor_id, criterion_id, score, notes) values (?, ?, ?, ?, ?)",
    );
    for (const [vendor, criterion, score, notes] of SCORE_SEED) {
      insScore.run(uuid(), vendorIdByName[vendor], criterionIdByName[criterion], score, notes);
    }

    // Decision log
    const insLog = db.prepare(
      "insert into decision_log (id, entry_type, title, body, created_at) values (?, ?, ?, ?, ?)",
    );
    for (const [type, title, body, created] of LOG_SEED) {
      insLog.run(uuid(), type, title, body, created);
    }

    // Badge catalog
    const insBadge = db.prepare(
      "insert into badges (key, name, description, icon, hint) values (?, ?, ?, ?, ?)",
    );
    for (const b of BADGES) insBadge.run(b.key, b.name, b.description, b.icon, b.hint);
  });

  tx();
}
