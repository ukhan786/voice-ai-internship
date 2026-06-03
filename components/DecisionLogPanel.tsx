"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DecisionLogEntry, LogEntryType } from "@/lib/types";

const TYPE_META: Record<LogEntryType, { label: string; icon: string; cls: string }> = {
  decision: { label: "Decision", icon: "✅", cls: "border-accent/40 text-accent" },
  note: { label: "Note", icon: "📝", cls: "border-ink-line text-steel-300" },
  prep: { label: "Vendor Prep", icon: "🎯", cls: "border-gold/40 text-gold" },
};

export default function DecisionLogPanel({
  entries,
  readOnly,
}: {
  entries: DecisionLogEntry[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filter, setFilter] = useState<LogEntryType | "all">("all");
  const [type, setType] = useState<LogEntryType>("note");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered =
    filter === "all" ? entries : entries.filter((e) => e.entry_type === filter);

  async function add() {
    if (!title.trim()) return;
    setBusy(true);
    await fetch("/api/decision-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry_type: type, title, body }),
    });
    setTitle("");
    setBody("");
    setBusy(false);
    startTransition(() => router.refresh());
  }

  async function remove(id: string) {
    await fetch(`/api/decision-log?id=${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div className="card card-pad">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-steel-50">
          Decision Log &amp; Vendor Prep
        </h2>
        <div className="flex gap-1 text-xs">
          {(["all", "decision", "note", "prep"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-2 py-1 capitalize transition-colors ${
                filter === f ? "bg-accent text-ink" : "border border-ink-line text-steel-300"
              }`}
            >
              {f === "prep" ? "Prep" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Add form (intern only) */}
      {!readOnly && (
        <div className="mb-4 space-y-2 rounded-lg border border-ink-line bg-ink/50 p-3">
          <div className="flex flex-wrap gap-2">
            {(["note", "decision", "prep"] as LogEntryType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-md border px-2.5 py-1 text-xs capitalize ${
                  type === t ? TYPE_META[t].cls + " bg-ink-line/50" : "border-ink-line text-steel-400"
                }`}
              >
                {TYPE_META[t].icon} {TYPE_META[t].label}
              </button>
            ))}
          </div>
          <input
            className="input"
            placeholder={
              type === "prep" ? "Prep topic (e.g. VoxAuto discussion)" : "Title"
            }
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="input min-h-[80px] resize-y"
            placeholder={
              type === "prep"
                ? "Questions to ask / takeaways to capture…"
                : "Details, rationale, evidence…"
            }
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <button onClick={add} disabled={busy} className="btn-primary">
            Add entry
          </button>
        </div>
      )}

      {/* Entries */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="text-sm text-steel-500">No entries yet.</p>
        )}
        {filtered.map((e) => {
          const meta = TYPE_META[e.entry_type];
          return (
            <div
              key={e.id}
              className={`rounded-lg border bg-ink-soft/50 p-3 ${meta.cls.split(" ")[0]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span>{meta.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-steel-50">{e.title}</p>
                    <p className="text-[10px] uppercase tracking-wide text-steel-500">
                      {meta.label} ·{" "}
                      {new Date(e.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {!readOnly && (
                  <button
                    onClick={() => remove(e.id)}
                    className="text-xs text-steel-500 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
              {e.body && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-steel-300">
                  {e.body}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
