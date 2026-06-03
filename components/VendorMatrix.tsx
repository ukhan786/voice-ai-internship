"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Criterion, Score, Vendor } from "@/lib/types";
import { computeRankings, totalCriteriaWeight } from "@/lib/xp";

type ScoreMap = Record<string, number>; // `${vendorId}:${criterionId}` -> 1..5

export default function VendorMatrix({
  vendors,
  criteria,
  scores,
  readOnly,
}: {
  vendors: Vendor[];
  criteria: Criterion[];
  scores: Score[];
  readOnly: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [localScores, setLocalScores] = useState<ScoreMap>(() => {
    const m: ScoreMap = {};
    for (const s of scores) m[`${s.vendor_id}:${s.criterion_id}`] = s.score;
    return m;
  });
  const [localWeights, setLocalWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(criteria.map((c) => [c.id, c.weight])),
  );

  const effectiveCriteria = useMemo(
    () => criteria.map((c) => ({ ...c, weight: localWeights[c.id] ?? c.weight })),
    [criteria, localWeights],
  );

  const rankings = useMemo(() => {
    const scoreArr: Score[] = Object.entries(localScores).map(([k, v]) => {
      const [vendor_id, criterion_id] = k.split(":");
      return { id: k, vendor_id, criterion_id, score: v, notes: null, updated_at: "" };
    });
    return computeRankings(vendors, effectiveCriteria, scoreArr);
  }, [vendors, effectiveCriteria, localScores]);

  const rankByVendor = useMemo(
    () => new Map(rankings.map((r) => [r.vendor_id, r])),
    [rankings],
  );

  const weightTotal = totalCriteriaWeight(effectiveCriteria);
  const weightOk = Math.round(weightTotal) === 100;

  async function setScore(vendorId: string, criterionId: string, score: number) {
    if (readOnly) return;
    setLocalScores((m) => ({ ...m, [`${vendorId}:${criterionId}`]: score }));
    await fetch("/api/scores", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vendor_id: vendorId, criterion_id: criterionId, score }),
    });
    startTransition(() => router.refresh());
  }

  async function commitWeight(criterionId: string, weight: number) {
    if (readOnly) return;
    await fetch("/api/criteria", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: criterionId, weight }),
    });
    startTransition(() => router.refresh());
  }

  if (vendors.length === 0 || criteria.length === 0) {
    return (
      <p className="text-sm text-steel-400">
        Add at least one vendor and one criterion to start scoring.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* Weight sanity check */}
      <div
        className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
          weightOk
            ? "border-accent/30 bg-accent/5 text-accent-soft"
            : "border-gold/40 bg-gold/5 text-gold-soft"
        }`}
      >
        <span>Criteria weights total: {Math.round(weightTotal)}%</span>
        <span>{weightOk ? "✓ balanced to 100%" : "should sum to 100%"}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-ink-soft p-2 text-left text-xs font-semibold text-steel-400">
                Criterion / Weight
              </th>
              {vendors.map((v) => {
                const r = rankByVendor.get(v.id);
                return (
                  <th key={v.id} className="p-2 text-center align-bottom">
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                          r?.rank === 1 ? "bg-gold text-ink" : "bg-ink-line text-steel-300"
                        }`}
                      >
                        {r?.rank}
                      </span>
                      <span className="max-w-[110px] text-xs font-semibold text-steel-50">
                        {v.name}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {effectiveCriteria.map((c) => (
              <tr key={c.id}>
                <td className="sticky left-0 z-10 border-t border-ink-line bg-ink-soft p-2 align-top">
                  <p className="text-xs font-medium text-steel-100">{c.name}</p>
                  <div className="mt-1 flex items-center gap-1">
                    {readOnly ? (
                      <span className="chip">{c.weight}%</span>
                    ) : (
                      <>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={localWeights[c.id] ?? 0}
                          onChange={(e) =>
                            setLocalWeights((m) => ({
                              ...m,
                              [c.id]: Number(e.target.value),
                            }))
                          }
                          onBlur={(e) => commitWeight(c.id, Number(e.target.value))}
                          className="w-14 rounded border border-ink-line bg-ink px-1.5 py-0.5 text-xs text-steel-100"
                        />
                        <span className="text-[10px] text-steel-500">% wt</span>
                      </>
                    )}
                  </div>
                </td>
                {vendors.map((v) => {
                  const val = localScores[`${v.id}:${c.id}`];
                  return (
                    <td
                      key={v.id}
                      className="border-t border-ink-line p-2 text-center"
                    >
                      <div className="flex justify-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            disabled={readOnly}
                            onClick={() => setScore(v.id, c.id, n)}
                            className={`h-6 w-6 rounded text-[11px] font-medium transition-colors ${
                              val === n
                                ? "bg-accent text-ink"
                                : val && n <= val
                                  ? "bg-accent/30 text-accent-soft"
                                  : "border border-ink-line text-steel-500 hover:border-accent"
                            } ${readOnly ? "cursor-default" : ""}`}
                            title={`Score ${n}/5`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Totals row */}
            <tr>
              <td className="sticky left-0 z-10 border-t-2 border-accent/30 bg-ink-soft p-2 text-xs font-semibold text-steel-50">
                Weighted Total
                <span className="block text-[10px] font-normal text-steel-500">
                  out of 100
                </span>
              </td>
              {vendors.map((v) => {
                const r = rankByVendor.get(v.id);
                return (
                  <td
                    key={v.id}
                    className="border-t-2 border-accent/30 p-2 text-center"
                  >
                    <span
                      className={`text-lg font-bold ${
                        r?.rank === 1 ? "text-gold" : "text-accent"
                      }`}
                    >
                      {r?.weighted_total ?? 0}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
