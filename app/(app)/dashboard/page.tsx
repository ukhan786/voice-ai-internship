import Link from "next/link";
import {
  getCriteria,
  getCurrentProfile,
  getInternProfile,
  getScores,
  getTasks,
  getUserBadges,
  getVendors,
  getWeeks,
  getXpEvents,
  totalXp,
} from "@/lib/data";
import { computeRankings, computeStreak, levelFromXp } from "@/lib/xp";
import { currentWeekNo, overallProgress, weekProgress, overdueTasks } from "@/lib/progress";
import { PHASES } from "@/lib/curriculum";
import type { Week } from "@/lib/types";

export const dynamic = "force-dynamic";

function phaseForWeek(weekNo: number): number {
  const p = PHASES.find((ph) => ph.weeks.includes(weekNo));
  return p?.no ?? 1;
}

export default async function DashboardPage() {
  const me = await getCurrentProfile();
  const isManager = me?.role === "manager";

  const subject = isManager ? (await getInternProfile()) ?? me : me;
  const subjectId = subject?.id;

  const [weeks, tasks, xpEvents, badges, vendors, criteria, scores] = await Promise.all([
    getWeeks(),
    getTasks(),
    getXpEvents(subjectId),
    getUserBadges(subjectId),
    getVendors(),
    getCriteria(),
    getScores(),
  ]);

  const xp = totalXp(xpEvents);
  const level = levelFromXp(xp);
  const streak = computeStreak(xpEvents.map((e) => e.created_at));
  const overall = overallProgress(tasks);
  const cur = currentWeekNo(weeks);
  const curWeek = weeks.find((w) => w.week_no === cur) as (Week & { deliverable?: string }) | undefined;
  const curProgress = weekProgress(tasks, cur);
  const overdue = overdueTasks(tasks, weeks);
  const curPhaseNo = phaseForWeek(cur);
  const curPhase = PHASES.find((p) => p.no === curPhaseNo)!;
  const rankings = computeRankings(vendors, criteria, scores);
  const firstName = (subject?.full_name ?? "there").split(" ")[0];

  // Phase completion state
  const weeksDone = (nos: number[]) =>
    nos.every((n) => {
      const t = tasks.filter((x) => x.week_no === n);
      return t.length > 0 && t.every((x) => x.status === "done");
    });

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label">
            {isManager ? "Oversight Dashboard" : "Your Journey"}
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-steel-50">
            {isManager
              ? `Tracking ${subject?.full_name ?? "the intern"}`
              : `Welcome back, ${firstName}`}
          </h1>
          <p className="mt-1 text-sm text-steel-400">
            Phase {curPhaseNo}: {curPhase.name} · Week {cur} of 10
          </p>
        </div>
        {isManager && (
          <Link href="/manager" className="btn-ghost self-start sm:self-auto">
            Full oversight view →
          </Link>
        )}
      </div>

      {/* ── This Week ──────────────────────────────────────────────────────── */}
      <div className="card card-pad border-accent/20 bg-gradient-to-br from-accent/[0.04] to-transparent">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip text-accent">Week {cur}</span>
          <span className="chip">{curWeek?.theme}</span>
          {overdue.length > 0 && (
            <span className="chip border-forza/30 text-forza">
              ⚠ {overdue.length} overdue
            </span>
          )}
        </div>

        <h2 className="mt-3 text-xl font-semibold text-steel-50">
          {curWeek?.title ?? "—"}
        </h2>
        <p className="mt-1 text-sm text-steel-300">{curWeek?.objective}</p>

        {curWeek?.deliverable && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-gold/20 bg-gold/5 px-3 py-2">
            <span className="mt-0.5 text-sm text-gold">★</span>
            <div>
              <p className="text-xs font-medium text-gold-soft uppercase tracking-wide">
                This week's deliverable
              </p>
              <p className="text-sm text-steel-200">{curWeek.deliverable}</p>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-steel-400">
              <span>Tasks</span>
              <span>{curProgress.done}/{curProgress.total} done</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-line">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${curProgress.pct}%` }}
              />
            </div>
          </div>
          <Link href={`/weeks/${cur}`} className="btn-primary shrink-0">
            {isManager ? "Review week" : "Open week"} →
          </Link>
        </div>
      </div>

      {/* ── Quick stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card card-pad text-center">
          <p className="text-2xl font-bold text-accent">{overall.pct}%</p>
          <p className="mt-1 text-xs text-steel-400">
            {overall.done}/{overall.total} tasks
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-steel-300 uppercase tracking-wide">
            Overall
          </p>
        </div>
        <div className="card card-pad text-center">
          <p className="text-2xl font-bold text-steel-50">
            Lv {level.level}
          </p>
          <p className="mt-1 text-xs text-steel-400">{xp} pts</p>
          <p className="mt-0.5 text-[11px] font-medium text-steel-300 uppercase tracking-wide">
            Level
          </p>
        </div>
        <div className="card card-pad text-center">
          {streak > 0 ? (
            <>
              <p className="text-2xl font-bold text-gold">{streak}🔥</p>
              <p className="mt-1 text-xs text-steel-400">day streak</p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-steel-500">—</p>
              <p className="mt-1 text-xs text-steel-400">no streak yet</p>
            </>
          )}
          <p className="mt-0.5 text-[11px] font-medium text-steel-300 uppercase tracking-wide">
            Momentum
          </p>
        </div>
      </div>

      {/* ── Phase roadmap ──────────────────────────────────────────────────── */}
      <div className="card card-pad">
        <h2 className="mb-4 text-sm font-semibold text-steel-50">
          Project Roadmap
        </h2>
        <div className="grid gap-3 sm:grid-cols-4">
          {PHASES.map((phase) => {
            const isActive = phase.no === curPhaseNo;
            const isDone = weeksDone(phase.weeks);
            const isUpcoming = phase.no > curPhaseNo;

            return (
              <div
                key={phase.no}
                className={`relative rounded-lg border p-3 transition-colors ${
                  isActive
                    ? "border-accent/40 bg-accent/5"
                    : isDone
                    ? "border-green-500/30 bg-green-500/5"
                    : "border-ink-line bg-ink-soft/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wide ${
                      isActive
                        ? "text-accent"
                        : isDone
                        ? "text-green-400"
                        : "text-steel-500"
                    }`}
                  >
                    Phase {phase.no}
                  </span>
                  <span className="text-sm">
                    {isDone ? "✅" : isActive ? "▶" : isUpcoming ? "○" : ""}
                  </span>
                </div>
                <p
                  className={`mt-1 text-xs font-semibold leading-tight ${
                    isActive ? "text-steel-100" : isDone ? "text-steel-200" : "text-steel-400"
                  }`}
                >
                  {phase.shortName}
                </p>
                <p className="mt-0.5 text-[10px] text-steel-500">{phase.dateRange}</p>
                {isActive && (
                  <p className="mt-2 text-[10px] leading-tight text-steel-400 italic">
                    {phase.deliverable}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Manager-only: vendor snapshot ──────────────────────────────────── */}
      {isManager && rankings.length > 0 && (
        <div className="card card-pad">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-steel-50">Vendor Leaderboard</h2>
            <Link href="/workspace" className="text-xs link-muted">
              Workspace →
            </Link>
          </div>
          <ol className="space-y-2">
            {rankings.slice(0, 3).map((r) => (
              <li
                key={r.vendor_id}
                className="flex items-center justify-between rounded-lg border border-ink-line px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm text-steel-100">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      r.rank === 1 ? "bg-gold text-ink" : "bg-ink-line text-steel-300"
                    }`}
                  >
                    {r.rank}
                  </span>
                  {r.name}
                </span>
                <span className="text-sm font-semibold text-accent">{r.weighted_total}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* ── Intern-only: badges earned ─────────────────────────────────────── */}
      {!isManager && badges.length > 0 && (
        <div className="card card-pad">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-steel-50">Badges Earned</h2>
            <span className="chip">{badges.length} milestone{badges.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <span
                key={b.badge_key}
                className="rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs text-steel-200"
              >
                {b.badge_key === "first_steps" ? "🚦" :
                 b.badge_key === "enterprise_thinker" ? "🗺️" :
                 b.badge_key === "rfp_analyst" ? "🚀" :
                 b.badge_key === "data_foundations" ? "📊" :
                 b.badge_key === "business_case_builder" ? "📘" :
                 b.badge_key === "scorekeeper" ? "🎯" :
                 b.badge_key === "reflective_practitioner" ? "🪞" :
                 b.badge_key === "presenter" ? "🎤" :
                 b.badge_key === "journey_complete" ? "🏆" : "⭐"}{" "}
                {b.badge_key.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
