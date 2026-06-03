import Link from "next/link";
import { getTasks, getWeeks } from "@/lib/data";
import { currentWeekNo, weekProgress } from "@/lib/progress";

export const dynamic = "force-dynamic";

const ARC: Record<string, string> = {
  "1": "Foundations",
  "2": "Foundations",
  "3": "Vendor Evaluation",
  "4": "Vendor Evaluation",
  "5": "Data Foundation",
  "6": "Data Foundation",
  "7": "Business Case",
  "8": "Business Case",
  "9": "Synthesis",
  "10": "Synthesis",
};

export default async function WeeksPage() {
  const [weeks, tasks] = await Promise.all([getWeeks(), getTasks()]);
  const cur = currentWeekNo(weeks);

  return (
    <div className="space-y-6">
      <div>
        <p className="label">Weekly Learning + Task Tracker</p>
        <h1 className="mt-1 text-2xl font-semibold text-steel-50">
          The 10-Week Curriculum
        </h1>
        <p className="mt-1 text-sm text-steel-400">
          A progressive arc from enterprise-AI foundations to a final vendor
          recommendation. June 1 – August 7, 2026.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {weeks.map((w) => {
          const p = weekProgress(tasks, w.week_no);
          const isCurrent = w.week_no === cur;
          return (
            <Link
              key={w.week_no}
              href={`/weeks/${w.week_no}`}
              className={`card card-pad group transition-colors hover:border-accent/50 ${
                isCurrent ? "border-accent/50 shadow-glow" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl text-sm font-bold ${
                      p.complete
                        ? "bg-accent text-ink"
                        : isCurrent
                          ? "border-2 border-accent text-accent"
                          : "border border-ink-line text-steel-300"
                    }`}
                  >
                    {p.complete ? "✓" : w.week_no}
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-steel-500">
                      {ARC[String(w.week_no)]} · {w.theme}
                    </p>
                    <h3 className="text-sm font-semibold text-steel-50 group-hover:text-accent">
                      {w.title}
                    </h3>
                  </div>
                </div>
                {isCurrent && <span className="chip text-accent">Now</span>}
              </div>

              <p className="mt-3 line-clamp-2 text-xs text-steel-400">
                {w.objective}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-line">
                  <div
                    className="h-full rounded-full bg-accent transition-all"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
                <span className="text-[11px] text-steel-400">
                  {p.done}/{p.total}
                </span>
              </div>

              {w.milestone_label && (
                <p className="mt-2 text-[11px] text-gold/80">
                  ★ {w.milestone_label}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
