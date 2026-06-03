/**
 * XP + level curve, plus pure helpers for ranking and gamification math.
 * Kept framework-free so it can be unit-reasoned about and reused on the
 * server (route handlers) and the client (dashboard widgets).
 */

import type { Criterion, Score, Vendor, VendorRanking } from "./types";

/**
 * Cumulative XP required to *reach* a given level.
 * Level 1 starts at 0 XP. Each level n>=2 adds 100*(n-1) XP, so the curve is
 * a gentle triangular ramp: L2=100, L3=300, L4=600, L5=1000, ...
 *   cumulativeForLevel(n) = 100 * (n-1) * n / 2 ... wait, simpler below.
 */
export function cumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  // sum_{k=1}^{level-1} 100*k = 100 * (level-1)*level/2
  const n = level - 1;
  return (100 * n * (n + 1)) / 2;
}

export type LevelInfo = {
  level: number;
  totalXp: number;
  xpIntoLevel: number;
  xpForThisLevel: number; // span of the current level
  xpToNext: number;
  progressPct: number; // 0..100 through the current level
};

export function levelFromXp(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  // Advance while the next level's threshold is reached.
  while (cumulativeXpForLevel(level + 1) <= xp) {
    level += 1;
    if (level > 999) break; // safety
  }
  const floor = cumulativeXpForLevel(level);
  const ceil = cumulativeXpForLevel(level + 1);
  const xpForThisLevel = ceil - floor;
  const xpIntoLevel = xp - floor;
  const xpToNext = ceil - xp;
  const progressPct =
    xpForThisLevel === 0 ? 100 : Math.round((xpIntoLevel / xpForThisLevel) * 100);
  return { level, totalXp: xp, xpIntoLevel, xpForThisLevel, xpToNext, progressPct };
}

/** A friendly title that scales with level. */
export function levelTitle(level: number): string {
  if (level >= 9) return "AI Strategy Lead";
  if (level >= 7) return "Voice AI Evaluator";
  if (level >= 5) return "Solutions Analyst";
  if (level >= 3) return "Associate Analyst";
  return "AI Intern";
}

/**
 * Weighted ranking. Score is 1..5 per criterion; criterion weights are
 * percentages summing to 100. Contribution = (score/5) * weight, so a vendor
 * that maxes every criterion earns 100. Vendors with no scores rank last.
 */
export function computeRankings(
  vendors: Vendor[],
  criteria: Criterion[],
  scores: Score[],
): VendorRanking[] {
  const scoreMap = new Map<string, number>(); // `${vendorId}:${criterionId}` -> score
  for (const s of scores) scoreMap.set(`${s.vendor_id}:${s.criterion_id}`, s.score);

  const totals = vendors.map((v) => {
    let weighted = 0;
    for (const c of criteria) {
      const raw = scoreMap.get(`${v.id}:${c.id}`);
      if (typeof raw === "number") {
        weighted += (raw / 5) * c.weight;
      }
    }
    return { vendor_id: v.id, name: v.name, weighted_total: Math.round(weighted * 10) / 10 };
  });

  totals.sort((a, b) => b.weighted_total - a.weighted_total);
  return totals.map((t, i) => ({ ...t, rank: i + 1 }));
}

export const totalCriteriaWeight = (criteria: Criterion[]): number =>
  criteria.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);

/**
 * Streak in days: count consecutive calendar days (ending today or yesterday)
 * on which there was at least one XP event. A small momentum signal.
 */
export function computeStreak(eventDatesISO: string[], today = new Date()): number {
  const days = new Set<string>();
  for (const iso of eventDatesISO) {
    days.add(new Date(iso).toISOString().slice(0, 10));
  }
  if (days.size === 0) return 0;

  const toKey = (d: Date) => d.toISOString().slice(0, 10);
  const cursor = new Date(today);
  // Allow the streak to be "alive" if today has no activity yet but yesterday did.
  if (!days.has(toKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    if (!days.has(toKey(cursor))) return 0;
  }
  let streak = 0;
  while (days.has(toKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}
