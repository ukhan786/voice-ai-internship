"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ReflectionForm({
  weekNo,
  prompt,
  initialBody,
  submittedAt,
  readOnly,
}: {
  weekNo: number;
  prompt: string;
  initialBody: string;
  submittedAt: string | null;
  readOnly: boolean;
}) {
  const router = useRouter();
  const [body, setBody] = useState(initialBody);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();
  const [savedNote, setSavedNote] = useState<string | null>(null);

  async function save(submit: boolean) {
    setSaving(true);
    setSavedNote(null);
    const res = await fetch("/api/reflections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_no: weekNo, body, submit }),
    });
    setSaving(false);
    if (res.ok) {
      setSavedNote(submit ? "Submitted! +25 XP" : "Draft saved");
      startTransition(() => router.refresh());
    } else {
      setSavedNote("Couldn't save — are you signed in as the intern?");
    }
  }

  if (readOnly) {
    return (
      <div className="card card-pad">
        <span className="label">Reflection</span>
        <p className="mt-1 text-sm italic text-steel-300">{prompt}</p>
        <div className="mt-3 rounded-lg border border-ink-line bg-ink px-3 py-3 text-sm text-steel-100">
          {initialBody?.trim() ? (
            <p className="whitespace-pre-wrap">{initialBody}</p>
          ) : (
            <p className="text-steel-500">No reflection submitted yet.</p>
          )}
        </div>
        {submittedAt && (
          <p className="mt-2 text-xs text-accent">
            ✓ Submitted {new Date(submittedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between">
        <span className="label">Reflection</span>
        {submittedAt && (
          <span className="chip text-accent">
            ✓ Submitted {new Date(submittedAt).toLocaleDateString()}
          </span>
        )}
      </div>
      <p className="mt-1 text-sm italic text-steel-300">{prompt}</p>
      <textarea
        className="input mt-3 min-h-[120px] resize-y"
        placeholder="Write your reflection…"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => save(true)}
          disabled={saving || !body.trim()}
          className="btn-primary"
        >
          {submittedAt ? "Update & resubmit" : "Submit reflection"}
        </button>
        <button onClick={() => save(false)} disabled={saving} className="btn-ghost">
          Save draft
        </button>
        {savedNote && (
          <span className="text-xs text-accent-soft">{savedNote}</span>
        )}
      </div>
    </div>
  );
}
