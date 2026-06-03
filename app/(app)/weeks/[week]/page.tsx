import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCurrentProfile,
  getInternProfile,
  getReflections,
  getTasks,
  getWeeks,
} from "@/lib/data";
import { weekProgress } from "@/lib/progress";
import TaskList from "@/components/TaskList";
import ReflectionForm from "@/components/ReflectionForm";
import ConceptPrimer from "@/components/ConceptPrimer";

export const dynamic = "force-dynamic";

export default async function WeekDetailPage({
  params,
}: {
  params: { week: string };
}) {
  const weekNo = Number(params.week);
  if (!Number.isInteger(weekNo) || weekNo < 1 || weekNo > 10) notFound();

  const me = await getCurrentProfile();
  const isManager = me?.role === "manager";
  const subject = isManager ? (await getInternProfile()) ?? me : me;

  const [weeks, tasks, reflections] = await Promise.all([
    getWeeks(),
    getTasks(),
    getReflections(),
  ]);

  const week = weeks.find((w) => w.week_no === weekNo);
  if (!week) notFound();

  const weekTasks = tasks.filter((t) => t.week_no === weekNo);
  const p = weekProgress(tasks, weekNo);
  const reflection = reflections.find(
    (r) => r.week_no === weekNo && r.profile_id === subject?.id,
  );

  const prev = weekNo > 1 ? weekNo - 1 : null;
  const next = weekNo < 10 ? weekNo + 1 : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between text-sm">
        <Link href="/weeks" className="link-muted">
          ← All weeks
        </Link>
        <div className="flex items-center gap-2">
          {prev && (
            <Link href={`/weeks/${prev}`} className="btn-ghost px-2.5 py-1 text-xs">
              ← Wk {prev}
            </Link>
          )}
          {next && (
            <Link href={`/weeks/${next}`} className="btn-ghost px-2.5 py-1 text-xs">
              Wk {next} →
            </Link>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="card card-pad">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">Week {week.week_no}</span>
          <span className="chip text-accent">{week.theme}</span>
          <span className="chip">
            {new Date(week.start_date + "T00:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}{" "}
            –{" "}
            {new Date(week.end_date + "T00:00:00").toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </span>
          {isManager && <span className="chip">Oversight (read-only)</span>}
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-steel-50">{week.title}</h1>
        <div className="mt-3 rounded-lg border border-ink-line bg-ink/60 px-4 py-3">
          <span className="label">Learning Objective</span>
          <p className="mt-1 text-sm text-steel-200">{week.objective}</p>
        </div>
        {week.milestone_label && (
          <p className="mt-3 rounded-lg border border-gold/30 bg-gold/5 px-3 py-2 text-xs text-gold-soft">
            ★ Milestone: {week.milestone_label}
          </p>
        )}
      </div>

      <ConceptPrimer title={week.primer_title} body={week.primer_body} />

      {/* Tasks */}
      <div className="card card-pad">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-steel-50">
            Tasks{" "}
            <span className="ml-1 text-xs font-normal text-steel-400">
              {p.done}/{p.total} done · {p.pct}%
            </span>
          </h2>
          {!isManager && (
            <span className="text-xs text-steel-500">
              Tap the box to advance: To do → In progress → Done
            </span>
          )}
        </div>
        {weekTasks.length === 0 ? (
          <p className="text-sm text-steel-400">No tasks for this week.</p>
        ) : (
          <TaskList tasks={weekTasks} readOnly={!!isManager} />
        )}
      </div>

      {/* Reflection */}
      <ReflectionForm
        weekNo={weekNo}
        prompt={week.reflection_prompt}
        initialBody={reflection?.body ?? ""}
        submittedAt={reflection?.submitted_at ?? null}
        readOnly={!!isManager}
      />
    </div>
  );
}
