"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Task, TaskStatus } from "@/lib/types";

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};

const STATUS_META: Record<TaskStatus, { label: string; dot: string; ring: string }> = {
  todo: { label: "To do", dot: "bg-steel-500", ring: "border-ink-line" },
  in_progress: { label: "In progress", dot: "bg-gold", ring: "border-gold/40" },
  done: { label: "Done", dot: "bg-accent", ring: "border-accent/50" },
};

export default function TaskList({
  tasks,
  readOnly,
}: {
  tasks: Task[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [local, setLocal] = useState<Record<string, TaskStatus>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  function statusOf(t: Task): TaskStatus {
    return local[t.id] ?? t.status;
  }

  async function advance(t: Task) {
    if (readOnly) return;
    const next = NEXT_STATUS[statusOf(t)];
    setLocal((m) => ({ ...m, [t.id]: next }));
    setBusyId(t.id);
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: t.id, status: next }),
    });
    setBusyId(null);
    startTransition(() => router.refresh());
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => {
        const status = statusOf(t);
        const meta = STATUS_META[status];
        return (
          <li
            key={t.id}
            className={`flex items-center gap-3 rounded-lg border bg-ink-soft/50 px-3 py-2.5 ${meta.ring}`}
          >
            <button
              onClick={() => advance(t)}
              disabled={readOnly || busyId === t.id}
              className={`flex h-6 w-6 flex-none items-center justify-center rounded-md border transition-colors ${
                status === "done"
                  ? "border-accent bg-accent text-ink"
                  : "border-ink-line hover:border-accent"
              } ${readOnly ? "cursor-default opacity-70" : ""}`}
              title={readOnly ? meta.label : "Click to advance status"}
            >
              {status === "done" ? "✓" : status === "in_progress" ? "◐" : ""}
            </button>

            <div className="min-w-0 flex-1">
              <p
                className={`text-sm ${
                  status === "done"
                    ? "text-steel-400 line-through"
                    : "text-steel-100"
                }`}
              >
                {t.title}
              </p>
            </div>

            <span className="flex items-center gap-1.5 text-[11px] text-steel-400">
              <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
              {meta.label}
            </span>
            <span className="chip flex-none">+{t.xp} XP</span>
          </li>
        );
      })}
      {pending && (
        <li className="px-3 py-1 text-xs text-steel-500">Saving…</li>
      )}
    </ul>
  );
}
