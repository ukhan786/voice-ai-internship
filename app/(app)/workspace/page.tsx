import {
  getCriteria,
  getCurrentProfile,
  getDecisionLog,
  getScores,
  getVendors,
} from "@/lib/data";
import { computeRankings } from "@/lib/xp";
import VendorMatrix from "@/components/VendorMatrix";
import WorkspaceTools from "@/components/WorkspaceTools";
import DecisionLogPanel from "@/components/DecisionLogPanel";

export const dynamic = "force-dynamic";

export default async function WorkspacePage() {
  const me = await getCurrentProfile();
  const readOnly = me?.role === "manager";

  const [vendors, criteria, scores, log] = await Promise.all([
    getVendors(),
    getCriteria(),
    getScores(),
    getDecisionLog(),
  ]);

  const rankings = computeRankings(vendors, criteria, scores);
  const scoredCells = scores.length;
  const totalCells = vendors.length * criteria.length;

  return (
    <div className="space-y-6">
      {/* Header / scenario framing */}
      <div className="card card-pad border-accent/20 bg-gradient-to-br from-accent/[0.05] to-transparent">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip text-accent">🎙️ Voice AI Project Workspace</span>
          <span className="chip">Phase: Vendor selection</span>
          <span className="chip">RFPs in review</span>
          {readOnly && <span className="chip">Oversight (read-only)</span>}
        </div>
        <h1 className="mt-3 text-2xl font-semibold text-steel-50">
          Westside Lexus — Voice AI Vendor Evaluation
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-steel-300">
          We&apos;re evaluating Voice AI vendors for dealer-facing and internal
          workflows — service scheduling, after-hours call capture, and staff
          assistance. Define weighted criteria, score each vendor against your RFP,
          and let the tool rank them. Document the rationale as you go.
        </p>
      </div>

      {/* Ranking summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {rankings.slice(0, 3).map((r) => (
          <div
            key={r.vendor_id}
            className={`card card-pad ${r.rank === 1 ? "border-gold/40" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="label">Rank #{r.rank}</span>
              {r.rank === 1 && <span className="text-lg">🏆</span>}
            </div>
            <p className="mt-1 text-lg font-semibold text-steel-50">{r.name}</p>
            <p className="mt-1 text-3xl font-bold text-accent">
              {r.weighted_total}
              <span className="text-sm font-normal text-steel-400">/100</span>
            </p>
          </div>
        ))}
      </div>

      {/* Scoring matrix */}
      <div className="card card-pad">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-steel-50">
            Weighted Scoring Matrix
          </h2>
          <span className="chip">
            {scoredCells}/{totalCells || 0} cells scored
          </span>
        </div>
        <p className="mb-4 text-xs text-steel-400">
          Score each vendor 1–5 per criterion. Weighted total ={" "}
          <span className="text-steel-200">Σ (score ÷ 5 × weight%)</span>, so a
          perfect vendor scores 100.
        </p>
        <VendorMatrix
          vendors={vendors}
          criteria={criteria}
          scores={scores}
          readOnly={readOnly}
        />
      </div>

      {/* Manage (intern only) */}
      {!readOnly && <WorkspaceTools vendors={vendors} criteria={criteria} />}

      {/* Decision log + prep */}
      <DecisionLogPanel entries={log} readOnly={readOnly} />
    </div>
  );
}
