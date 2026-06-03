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
import {
  buildJourneyStops,
  currentWeekNo,
  overallProgress,
  overdueTasks,
  weekProgress,
} from "@/lib/progress";
import XPBar from "@/components/XPBar";
import JourneyMap from "@/components/JourneyMap";
import BadgeShelf from "@/components/BadgeShelf";
import StatCard from "@/components/StatCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const me = await getCurrentProfile();
  const isManager = me?.role === "manager";

  // The manager's dashboard is "about" the intern; the intern's is their own.
  const subject = isManager ? (await getInternProfile()) ?? me : me;
  const subjectId = subject?.id;

  const [weeks, tasks, xpEvents, badges, vendors, criteria, scores] =
    await Promise.all([
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
  const curWeek = weeks.find((w) => w.week_no === cur);
  const curProgress = weekProgress(tasks, cur);
  const overdue = overdueTasks(tasks, weeks);
  const stops = buildJourneyStops(weeks, tasks);
  const rankings = computeRankings(vendors, criteria, scores);
  const topVendor = rankings[0];

  const firstName = (subject?.full_name ?? "there").split(" ")[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="label">{isManager ? "Oversight Dashboard" : "Your Journey"}</p>
          <h1 className="mt-1 text-2xl font-semibold text-steel-50">
            {isManager ? (
              <>Tracking {subject?.full_name ?? "the intern"}&apos;s summer</>
            ) : (
              <>Welcome back, {firstName} 👋</>
            )}
          </h1>
          <p className="mt-1 text-sm text-steel-400">
            Westside Lexus Voice AI vendor evaluation · Week {cur} of 10
          </p>
        </div>
        {isManager && (
          <Link href="/manager" className="btn-ghost">
            Full oversight view →
          </Link>
        )}
      </div>

      {/* Top stat row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Overall Progress"
          value={`${overall.pct}%`}
          sub={`${overall.done}/${overall.total} tasks done`}
          icon="✅"
          tone="accent"
        />
        <StatCard
          label="Momentum"
          value={streak > 0 ? `${streak}🔥` : "—"}
          sub={streak > 0 ? "day streak" : "no streak yet"}
          icon="⚡"
          tone={streak > 0 ? "gold" : "default"}
        />
        <StatCard
          label="Badges"
          value={badges.length}
          sub="earned"
          icon="🏅"
        />
        <StatCard
          label="Overdue"
          value={overdue.length}
          sub={overdue.length ? "needs attention" : "all caught up"}
          icon={overdue.length ? "⚠️" : "👍"}
          tone={overdue.length ? "warn" : "default"}
        />
      </div>

      {/* XP + current week */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <XPBar info={level} />
        </div>

        <div className="card card-pad lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="label">This Week</span>
            <span className="chip">{curWeek?.theme}</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-steel-50">
            Week {cur}: {curWeek?.title}
          </h2>
          <p className="mt-1 text-sm text-steel-300">{curWeek?.objective}</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs text-steel-400">
                <span>Weekly tasks</span>
                <span>
                  {curProgress.done}/{curProgress.total}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-line">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${curProgress.pct}%` }}
                />
              </div>
            </div>
            <Link href={`/weeks/${cur}`} className="btn-primary">
              {isManager ? "Review week" : "Open week"}
            </Link>
          </div>
          {curWeek?.milestone_label && (
            <p className="mt-3 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-gold-soft">
              ★ Milestone: {curWeek.milestone_label}
            </p>
          )}
        </div>
      </div>

      {/* Journey map */}
      <JourneyMap stops={stops} />

      {/* Workspace snapshot + badges */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card card-pad lg:col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-steel-50">
              Vendor Leaderboard
            </h2>
            <Link href="/workspace" className="text-xs link-muted">
              Workspace →
            </Link>
          </div>
          {rankings.length === 0 ? (
            <p className="text-sm text-steel-400">No vendors yet.</p>
          ) : (
            <ol className="space-y-2">
              {rankings.slice(0, 4).map((r) => (
                <li
                  key={r.vendor_id}
                  className="flex items-center justify-between rounded-lg border border-ink-line px-3 py-2"
                >
                  <span className="flex items-center gap-2 text-sm text-steel-100">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                        r.rank === 1
                          ? "bg-gold text-ink"
                          : "bg-ink-line text-steel-300"
                      }`}
                    >
                      {r.rank}
                    </span>
                    {r.name}
                  </span>
                  <span className="text-sm font-semibold text-accent">
                    {r.weighted_total}
                  </span>
                </li>
              ))}
            </ol>
          )}
          {topVendor && (
            <p className="mt-3 text-xs text-steel-400">
              Current front-runner:{" "}
              <span className="text-steel-100">{topVendor.name}</span> at{" "}
              {topVendor.weighted_total}/100.
            </p>
          )}
        </div>

        <div className="lg:col-span-2">
          <BadgeShelf earnedKeys={badges.map((b) => b.badge_key)} />
        </div>
      </div>
    </div>
  );
}
