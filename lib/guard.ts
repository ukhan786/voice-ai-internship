import "server-only";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/session";
import * as repo from "@/lib/db/repo";
import type { Profile } from "@/lib/types";

/**
 * Resolve the acting user. With no login screen, the default actor is the
 * seeded intern (Tyler); the nav "view as" toggle sets a cookie to switch.
 */
export function getActor(): Profile | null {
  const uid = getSessionUserId();
  const byCookie = uid ? repo.getProfile(uid) : null;
  return byCookie ?? repo.getProfileByRole("intern");
}

/**
 * Guard for write endpoints: only the intern may mutate. Returns either the
 * acting profile or a ready-to-return 403/401 response (manager is read-only).
 */
export function requireIntern():
  | { me: Profile; error?: undefined }
  | { me?: undefined; error: NextResponse } {
  const me = getActor();
  if (!me) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (me.role !== "intern") {
    return { error: NextResponse.json({ error: "Read-only for managers" }, { status: 403 }) };
  }
  return { me };
}
