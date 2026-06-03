import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getCriteria,
  getCurrentProfile,
  getInternProfile,
  getReflections,
  getScores,
  getTasks,
  getUserBadges,
  getVendors,
  getWeeks,
  getXpEvents,
  totalXp,
} from "@/lib/data";
import { computeRankings, levelFromXp } from "@/lib/xp";
import { overallProgress, overdueTasks, weekProgress } from "@/lib/progress";
import StatCard from "@/components/StatCard";
import BadgeShelf from "@/components/BadgeShelf";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const me = await getCurrentProfile();
  if (me?.role !== "manager") {
    // Interns don't have an oversight page; send them home.
    redirect("/dashboard");
  }

  const intern = (await getInternProfile()) ?? me;
  const [weeks, tasks, reflections, xpEvents, badges, vendors, criteria, scores] =
    await Promise.all([
      getWeeks(),
      getTasks(),
      getReflections(),
      getXpEvents(intern.id),
      getUserBadges(intern.id),
      getVendors(),
      getCriteria(),
      getScores(),
    ]);

  const overall = overallProgress(tasks);
  const overdue = overdueTasks(tasks, weeks);
  const xp = totalXp(xpEvents);
  const level = levelFromXp(xp);
  const rankings = computeRankings(vendors, criteria, scores);
  const submittedReflections = reflections.filter(
    (r) => r.profile_id === intern.id && r.submitted_at,
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Manager Oversight · {me.full_name}</p>
        <h1 className="mt-1 text-2xl font-semibold text-steel-50">
          {intern.full_name}&apos;s Internship at a Glance
        </h1>
        <p className="mt-1 text-sm text-steel-400">
          Read-only view across the weekly tracker, reflections, and Voice AI
          workspace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Completion"
          value={`${overall.pct}%`}
          sub={`${overall.done}/${overall.total} tasks`}
          icon="✅"
          tone="accent"
        />
        <StatCard label="Level" value={level.level} sub={`${xp} XP`} icon="⭐" />
        <StatCard
          label="Reflections"
          value={`${submittedReflections.length}/10`}
          sub="submitted"
          icon="🪞"
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          sub={overdue.length ? "past-due tasks" : "on track"}
          icon={overdue.length ? "⚠️" : "👍"}
          tone={overdue.length ? "warn" : "default"}
        />
      </div>

      {/* Overdue list */}
      {overdue.length > 0 && (
        <div className="card card-pad border-red-500/30">
          <h2 className="mb-2 text-sm font-semibold text-red-300">
            ⚠️ Overdue tasks
          </h2>
          <ul className="space-y-1 text-sm">
            {overdue.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-ink-line px-3 py-1.5"
              >
                <span className="text-steel-200">{t.title}</span>
                <Link
                  href={`/weeks/${t.week_no}`}
                  className="text-xs link-muted"
                >
                  Week {t.week_no} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Per-week breakdown */}
      <div className="card card-pad">
        <h2 className="mb-3 text-sm font-semibold text-steel-50">
          Weekly progress &amp; reflections
        </h2>
        <div className="space-y-2">
          {weeks.map((w) => {
            const p = weekProgress(tasks, w.week_no);
            const refl = reflections.find(
              (r) => r.week_no === w.week_no && r.profile_id === intern.id,
            );
            return (
              <div
                key={w.week_no}
                className="rounded-lg border border-ink-line bg-ink-soft/40 p-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg text-xs font-bold ${
                        p.complete
                          ? "bg-accent text-ink"
                          : "border border-ink-line text-steel-300"
                      }`}
                    >
                      {p.complete ? "✓" : w.week_no}
                    </span>
                    <div>
                      <Link
                        href={`/weeks/${w.week_no}`}
                        className="text-sm font-medium text-steel-100 hover:text-accent"
                      >
                        {w.title}
                      </Link>
                      <p className="text-[11px] text-steel-500">{w.theme}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden w-28 sm:block">
                      <div className="h-1.5 overflow-hidden rounded-full bg-ink-line">
                        <div
                          className="h-full rounded-full bg-accent"
                          style={{ width: `${p.pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-steel-400">
                      {p.done}/{p.total}
                    </span>
                    {refl?.submitted_at ? (
                      <span className="chip text-accent">🪞 ✓</span>
                    ) : (
                      <span className="chip text-steel-500">🪞 —</span>
                    )}
                  </div>
                </div>
                {refl?.body?.trim() && (
                  <p className="mt-2 whitespace-pre-wrap rounded-md border border-ink-line bg-ink/50 px-3 py-2 text-xs italic text-steel-300">
                    “{refl.body}”
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace + badges */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-pad lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-steel-50">
            Vendor evaluation standings
          </h2>
          <ol className="space-y-2">
            {rankings.map((r) => (
              <li
                key={r.vendor_id}
                className="flex items-center justify-between rounded-lg border border-ink-line px-3 py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-steel-100">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      r.rank === 1 ? "bg-gold text-ink" : "bg-ink-line text-steel-300"
                    }`}
                  >
                    {r.rank}
                  </span>
                  {r.name}
                </span>
                <span className="font-semibold text-accent">{r.weighted_total}</span>
              </li>
            ))}
          </ol>
          <Link href="/workspace" className="mt-3 inline-block text-xs link-muted">
            Open workspace →
          </Link>
        </div>
        <div className="lg:col-span-2">
          <BadgeShelf earnedKeys={badges.map((b) => b.badge_key)} />
        </div>
      </div>
    </div>
  );
}
