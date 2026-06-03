import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";
import * as repo from "@/lib/db/repo";
import type { Role } from "@/lib/types";

// PATCH /api/profile  { role }
// Powers the nav "view as" toggle: switches the active session to the seeded
// intern or manager user so you can explore both views from one browser.
export async function PATCH(request: Request) {
  const { role } = (await request.json()) as { role: Role };
  if (role !== "intern" && role !== "manager") {
    return NextResponse.json({ error: "Bad role" }, { status: 400 });
  }

  const profile = repo.getProfileByRole(role);
  if (!profile) return NextResponse.json({ error: "No such user" }, { status: 404 });

  const res = NextResponse.json({ ok: true, profile });
  res.cookies.set(SESSION_COOKIE, profile.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
