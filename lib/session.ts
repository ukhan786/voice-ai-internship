import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/constants";

/**
 * Lightweight cookie session for the SQLite (local-first) backend. We store
 * just the signed-in profile id; there are no passwords in demo/local mode —
 * you pick which seeded user to enter as on the login screen.
 */
export { SESSION_COOKIE };

export function getSessionUserId(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}
