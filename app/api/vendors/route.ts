import { NextResponse } from "next/server";
import { requireIntern } from "@/lib/guard";
import * as repo from "@/lib/db/repo";

// POST /api/vendors  { name, summary? }
export async function POST(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const { name, summary } = (await request.json()) as { name: string; summary?: string };
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });

  const vendor = repo.addVendor(name.trim(), summary ?? null);
  return NextResponse.json({ ok: true, vendor });
}

// DELETE /api/vendors?id=<id>
export async function DELETE(request: Request) {
  const guard = requireIntern();
  if (guard.error) return guard.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  repo.deleteVendor(id);
  return NextResponse.json({ ok: true });
}
