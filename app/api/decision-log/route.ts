import { NextResponse } from "next/server";
import { requireIntern } from "@/lib/guard";
import * as repo from "@/lib/db/repo";
import type { LogEntryType } from "@/lib/types";

// POST /api/decision-log  { entry_type, title, body }
export async function POST(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const { entry_type, title, body } = (await request.json()) as {
    entry_type: LogEntryType;
    title: string;
    body: string;
  };
  if (!title?.trim()) return NextResponse.json({ error: "Title required" }, { status: 400 });
  if (!["decision", "note", "prep"].includes(entry_type)) {
    return NextResponse.json({ error: "Bad entry_type" }, { status: 400 });
  }

  const entry = repo.addLogEntry(entry_type, title.trim(), body ?? "", guard.me!.id);
  return NextResponse.json({ ok: true, entry });
}

// DELETE /api/decision-log?id=<id>
export async function DELETE(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  repo.deleteLogEntry(id);
  return NextResponse.json({ ok: true });
}
