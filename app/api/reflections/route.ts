import { NextResponse } from "next/server";
import { requireIntern } from "@/lib/guard";
import * as repo from "@/lib/db/repo";

const REFLECTION_XP = 25;

// PUT /api/reflections  { week_no, body, submit }  — intern only
export async function PUT(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;
  const me = guard.me;

  const { week_no, body, submit } = (await request.json()) as {
    week_no: number;
    body: string;
    submit?: boolean;
  };
  if (!week_no) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const reflection = repo.upsertReflection(me.id, week_no, body ?? "", !!submit);

  if (submit && reflection.submitted_at) {
    repo.awardXp(me.id, "reflection", REFLECTION_XP, `reflection:${week_no}`);
    repo.recomputeGamification(me.id);
  }

  return NextResponse.json({ ok: true, reflection });
}
