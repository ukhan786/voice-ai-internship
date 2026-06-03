import { NextResponse } from "next/server";
import { requireIntern } from "@/lib/guard";
import * as repo from "@/lib/db/repo";

// POST /api/criteria  { name, description?, weight, sort? }
export async function POST(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const { name, description, weight, sort } = (await request.json()) as {
    name: string;
    description?: string;
    weight: number;
    sort?: number;
  };
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const criterion = repo.addCriterion(
    name.trim(),
    description ?? null,
    Number(weight) || 0,
    sort ?? 99,
  );
  return NextResponse.json({ ok: true, criterion });
}

// PATCH /api/criteria  { id, weight }
export async function PATCH(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const { id, weight } = (await request.json()) as { id: string; weight: number };
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const criterion = repo.updateCriterionWeight(id, Number(weight) || 0);
  return NextResponse.json({ ok: true, criterion });
}

// DELETE /api/criteria?id=<id>
export async function DELETE(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  repo.deleteCriterion(id);
  return NextResponse.json({ ok: true });
}
