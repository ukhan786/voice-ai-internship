import { NextResponse } from "next/server";
import { requireIntern } from "@/lib/guard";
import * as repo from "@/lib/db/repo";

const SCORE_XP = 10;

// PUT /api/scores  { vendor_id, criterion_id, score, notes? }  — intern only
export async function PUT(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;
  const me = guard.me;

  const { vendor_id, criterion_id, score, notes } = (await request.json()) as {
    vendor_id: string;
    criterion_id: string;
    score: number;
    notes?: string;
  };
  if (!vendor_id || !criterion_id || score < 1 || score > 5) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const saved = repo.upsertScore(vendor_id, criterion_id, score, notes ?? null);
  repo.awardXp(me.id, "score", SCORE_XP, `score:${vendor_id}:${criterion_id}`);
  repo.recomputeGamification(me.id);

  return NextResponse.json({ ok: true, score: saved });
}
