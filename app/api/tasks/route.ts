import { NextResponse } from "next/server";
import { requireIntern } from "@/lib/guard";
import * as repo from "@/lib/db/repo";
import type { TaskStatus } from "@/lib/types";

// PATCH /api/tasks  { id, status }  — intern only
export async function PATCH(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;
  const me = guard.me;

  const { id, status } = (await request.json()) as { id: string; status: TaskStatus };
  if (!id || !["todo", "in_progress", "done"].includes(status)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const task = repo.updateTaskStatus(id, status);
  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (status === "done") {
    repo.awardXp(me.id, "task", task.xp, `task:${task.id}`);
  }
  repo.recomputeGamification(me.id);

  return NextResponse.json({ ok: true, task });
}
