import "server-only";
import { getDb } from "./connection";
import { BADGES } from "@/lib/curriculum";
import type {
  Criterion,
  DecisionLogEntry,
  LogEntryType,
  Profile,
  Reflection,
  Score,
  Task,
  TaskStatus,
  UserBadge,
  Vendor,
  Week,
  XpEvent,
} from "@/lib/types";

const uuid = () => globalThis.crypto.randomUUID();
const now = () => new Date().toISOString();

// ── Profiles / session ────────────────────────────────────────────────────
export function getProfile(id: string): Profile | null {
  return (
    (getDb().prepare("select * from profiles where id = ?").get(id) as Profile) ?? null
  );
}

export function getProfileByRole(role: "intern" | "manager"): Profile | null {
  return (
    (getDb()
      .prepare("select * from profiles where role = ? order by created_at limit 1")
      .get(role) as Profile) ?? null
  );
}

// ── Curriculum ──────────────────────────────────────────────────────────────
export function getWeeks(): Week[] {
  return getDb().prepare("select * from weeks order by week_no").all() as Week[];
}

export function getTasks(): Task[] {
  return getDb()
    .prepare("select * from tasks order by week_no, sort")
    .all() as Task[];
}

export function getReflections(): Reflection[] {
  return getDb()
    .prepare("select * from reflections order by week_no")
    .all() as Reflection[];
}

// ── Workspace ─────────────────────────────────────────────────────────────
export function getVendors(): Vendor[] {
  return getDb().prepare("select * from vendors order by created_at").all() as Vendor[];
}

export function getCriteria(): Criterion[] {
  return getDb().prepare("select * from criteria order by sort").all() as Criterion[];
}

export function getScores(): Score[] {
  return getDb().prepare("select * from scores").all() as Score[];
}

export function getDecisionLog(): DecisionLogEntry[] {
  return getDb()
    .prepare("select * from decision_log order by created_at desc")
    .all() as DecisionLogEntry[];
}

// ── Gamification reads ──────────────────────────────────────────────────────
export function getXpEvents(profileId?: string): XpEvent[] {
  const db = getDb();
  return (
    profileId
      ? db
          .prepare("select * from xp_events where profile_id = ? order by created_at desc")
          .all(profileId)
      : db.prepare("select * from xp_events order by created_at desc").all()
  ) as XpEvent[];
}

export function getUserBadges(profileId?: string): UserBadge[] {
  const db = getDb();
  return (
    profileId
      ? db
          .prepare("select * from user_badges where profile_id = ? order by earned_at")
          .all(profileId)
      : db.prepare("select * from user_badges order by earned_at").all()
  ) as UserBadge[];
}

// ── Mutations ───────────────────────────────────────────────────────────────
export function updateTaskStatus(id: string, status: TaskStatus): Task | null {
  const db = getDb();
  db.prepare("update tasks set status = ?, updated_at = ? where id = ?").run(
    status,
    now(),
    id,
  );
  return (db.prepare("select * from tasks where id = ?").get(id) as Task) ?? null;
}

export function upsertReflection(
  profileId: string,
  weekNo: number,
  body: string,
  submit: boolean,
): Reflection {
  const db = getDb();
  const existing = db
    .prepare("select * from reflections where week_no = ? and profile_id = ?")
    .get(weekNo, profileId) as Reflection | undefined;

  const submittedAt =
    submit && body.trim().length > 0
      ? now()
      : (existing?.submitted_at ?? null);

  if (existing) {
    db.prepare(
      "update reflections set body = ?, submitted_at = ?, updated_at = ? where id = ?",
    ).run(body, submittedAt, now(), existing.id);
    return db.prepare("select * from reflections where id = ?").get(existing.id) as Reflection;
  }
  const id = uuid();
  db.prepare(
    "insert into reflections (id, week_no, profile_id, body, submitted_at) values (?, ?, ?, ?, ?)",
  ).run(id, weekNo, profileId, body, submittedAt);
  return db.prepare("select * from reflections where id = ?").get(id) as Reflection;
}

export function upsertScore(
  vendorId: string,
  criterionId: string,
  score: number,
  notes: string | null,
): Score {
  const db = getDb();
  const existing = db
    .prepare("select * from scores where vendor_id = ? and criterion_id = ?")
    .get(vendorId, criterionId) as Score | undefined;
  if (existing) {
    db.prepare("update scores set score = ?, notes = ?, updated_at = ? where id = ?").run(
      score,
      notes,
      now(),
      existing.id,
    );
    return db.prepare("select * from scores where id = ?").get(existing.id) as Score;
  }
  const id = uuid();
  db.prepare(
    "insert into scores (id, vendor_id, criterion_id, score, notes) values (?, ?, ?, ?, ?)",
  ).run(id, vendorId, criterionId, score, notes);
  return db.prepare("select * from scores where id = ?").get(id) as Score;
}

export function addVendor(name: string, summary: string | null): Vendor {
  const db = getDb();
  const id = uuid();
  db.prepare("insert into vendors (id, name, summary) values (?, ?, ?)").run(
    id,
    name,
    summary,
  );
  return db.prepare("select * from vendors where id = ?").get(id) as Vendor;
}

export function deleteVendor(id: string): void {
  getDb().prepare("delete from vendors where id = ?").run(id);
}

export function addCriterion(
  name: string,
  description: string | null,
  weight: number,
  sort: number,
): Criterion {
  const db = getDb();
  const id = uuid();
  db.prepare(
    "insert into criteria (id, name, description, weight, sort) values (?, ?, ?, ?, ?)",
  ).run(id, name, description, weight, sort);
  return db.prepare("select * from criteria where id = ?").get(id) as Criterion;
}

export function updateCriterionWeight(id: string, weight: number): Criterion | null {
  const db = getDb();
  db.prepare("update criteria set weight = ? where id = ?").run(weight, id);
  return (db.prepare("select * from criteria where id = ?").get(id) as Criterion) ?? null;
}

export function deleteCriterion(id: string): void {
  getDb().prepare("delete from criteria where id = ?").run(id);
}

export function addLogEntry(
  type: LogEntryType,
  title: string,
  body: string,
  authorId: string,
): DecisionLogEntry {
  const db = getDb();
  const id = uuid();
  db.prepare(
    "insert into decision_log (id, entry_type, title, body, author_id) values (?, ?, ?, ?, ?)",
  ).run(id, type, title, body, authorId);
  return db.prepare("select * from decision_log where id = ?").get(id) as DecisionLogEntry;
}

export function deleteLogEntry(id: string): void {
  getDb().prepare("delete from decision_log where id = ?").run(id);
}

// ── Gamification engine (idempotent) ────────────────────────────────────────
export function awardXp(
  profileId: string,
  source: string,
  amount: number,
  ref: string,
): void {
  // unique(profile_id, ref) makes this idempotent.
  getDb()
    .prepare(
      "insert or ignore into xp_events (id, profile_id, source, amount, ref) values (?, ?, ?, ?, ?)",
    )
    .run(uuid(), profileId, source, amount, ref);
}

function grantBadge(profileId: string, badgeKey: string): void {
  getDb()
    .prepare(
      "insert or ignore into user_badges (id, profile_id, badge_key) values (?, ?, ?)",
    )
    .run(uuid(), profileId, badgeKey);
}

const WEEK_COMPLETE_XP = 75;

export function recomputeGamification(profileId: string): void {
  const tasks = getTasks();
  const reflections = getReflections().filter((r) => r.profile_id === profileId);
  const scores = getScores();
  const vendors = getVendors();
  const criteria = getCriteria();

  const weekComplete = (wk: number) => {
    const t = tasks.filter((x) => x.week_no === wk);
    return t.length > 0 && t.every((x) => x.status === "done");
  };
  const weeksComplete = (nos: number[]) => nos.every(weekComplete);

  for (let wk = 1; wk <= 10; wk++) {
    if (weekComplete(wk)) awardXp(profileId, "week_complete", WEEK_COMPLETE_XP, `week:${wk}`);
  }

  const doneCount = tasks.filter((t) => t.status === "done").length;
  const submitted = reflections.filter((r) => r.submitted_at).length;
  const fullyScored =
    vendors.length > 0 &&
    criteria.length > 0 &&
    vendors.length * criteria.length === scores.length;

  const earned: string[] = [];
  if (doneCount >= 1) earned.push("first_steps");
  if (weeksComplete([1, 2])) earned.push("enterprise_thinker");
  if (weeksComplete([3, 4])) earned.push("rfp_analyst");
  if (weeksComplete([5, 6])) earned.push("data_foundations");
  if (weeksComplete([7, 8])) earned.push("business_case_builder");
  if (weeksComplete([9, 10])) earned.push("presenter");
  if (fullyScored) earned.push("scorekeeper");
  if (submitted >= 5) earned.push("reflective_practitioner");
  if (weeksComplete([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) earned.push("journey_complete");

  const valid = new Set(BADGES.map((b) => b.key));
  for (const key of earned) if (valid.has(key)) grantBadge(profileId, key);
}
