import type { Task, Week } from "./types";
import type { JourneyStop } from "@/components/JourneyMap";

export type WeekProgress = {
  week_no: number;
  total: number;
  done: number;
  pct: number;
  complete: boolean;
};

export function weekProgress(tasks: Task[], weekNo: number): WeekProgress {
  const wk = tasks.filter((t) => t.week_no === weekNo);
  const done = wk.filter((t) => t.status === "done").length;
  const total = wk.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { week_no: weekNo, total, done, pct, complete: total > 0 && done === total };
}

export function overallProgress(tasks: Task[]): {
  done: number;
  total: number;
  pct: number;
} {
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "done").length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}

/** Which week is "current" given today's date (clamped to the 1..10 range). */
export function currentWeekNo(weeks: Week[], today = new Date()): number {
  const t = today.toISOString().slice(0, 10);
  for (const w of weeks) {
    if (t >= w.start_date && t <= w.end_date) return w.week_no;
  }
  // Before the program: week 1. After: last week.
  if (weeks.length === 0) return 1;
  if (t < weeks[0].start_date) return weeks[0].week_no;
  return weeks[weeks.length - 1].week_no;
}

/** An overdue task = belongs to a week whose end_date has passed and isn't done. */
export function overdueTasks(tasks: Task[], weeks: Week[], today = new Date()): Task[] {
  const t = today.toISOString().slice(0, 10);
  const ended = new Set(weeks.filter((w) => w.end_date < t).map((w) => w.week_no));
  return tasks.filter((task) => ended.has(task.week_no) && task.status !== "done");
}

export function buildJourneyStops(
  weeks: Week[],
  tasks: Task[],
  today = new Date(),
): JourneyStop[] {
  const cur = currentWeekNo(weeks, today);
  return weeks.map((w) => {
    const p = weekProgress(tasks, w.week_no);
    return {
      week_no: w.week_no,
      title: w.title,
      theme: w.theme,
      pct: p.pct,
      isCurrent: w.week_no === cur,
      milestone: w.milestone_label,
    };
  });
}
