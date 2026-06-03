import "server-only";
import { getSessionUserId } from "@/lib/session";
import * as repo from "@/lib/db/repo";
import type {
  Criterion,
  DecisionLogEntry,
  Profile,
  Reflection,
  Score,
  Task,
  Vendor,
  Week,
  XpEvent,
  UserBadge,
} from "@/lib/types";

/**
 * Server-side data access for the SQLite (local-first) backend. The signed-in
 * user comes from the cookie session; role rules are enforced in the API
 * route handlers (SQLite has no RLS).
 */

export async function getCurrentProfile(): Promise<Profile | null> {
  // No login screen: if there's no session cookie yet, default to the intern
  // (Tyler). The nav "view as" toggle sets the cookie to switch to the manager.
  const uid = getSessionUserId();
  const byCookie = uid ? repo.getProfile(uid) : null;
  return byCookie ?? repo.getProfileByRole("intern");
}

export async function getInternProfile(): Promise<Profile | null> {
  return repo.getProfileByRole("intern");
}

export async function getWeeks(): Promise<Week[]> {
  return repo.getWeeks();
}

export async function getTasks(): Promise<Task[]> {
  return repo.getTasks();
}

export async function getReflections(): Promise<Reflection[]> {
  return repo.getReflections();
}

export async function getVendors(): Promise<Vendor[]> {
  return repo.getVendors();
}

export async function getCriteria(): Promise<Criterion[]> {
  return repo.getCriteria();
}

export async function getScores(): Promise<Score[]> {
  return repo.getScores();
}

export async function getDecisionLog(): Promise<DecisionLogEntry[]> {
  return repo.getDecisionLog();
}

export async function getXpEvents(profileId?: string): Promise<XpEvent[]> {
  return repo.getXpEvents(profileId);
}

export async function getUserBadges(profileId?: string): Promise<UserBadge[]> {
  return repo.getUserBadges(profileId);
}

export function totalXp(events: XpEvent[]): number {
  return events.reduce((sum, e) => sum + (e.amount || 0), 0);
}
