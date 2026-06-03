"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Vendor, Criterion } from "@/lib/types";

export default function WorkspaceTools({
  vendors,
  criteria,
}: {
  vendors: Vendor[];
  criteria: Criterion[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [vName, setVName] = useState("");
  const [vSummary, setVSummary] = useState("");
  const [cName, setCName] = useState("");
  const [cWeight, setCWeight] = useState(10);
  const [busy, setBusy] = useState(false);

  async function addVendor() {
    if (!vName.trim()) return;
    setBusy(true);
    await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: vName, summary: vSummary }),
    });
    setVName("");
    setVSummary("");
    setBusy(false);
    startTransition(() => router.refresh());
  }

  async function removeVendor(id: string) {
    await fetch(`/api/vendors?id=${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  async function addCriterion() {
    if (!cName.trim()) return;
    setBusy(true);
    await fetch("/api/criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: cName, weight: cWeight, sort: criteria.length }),
    });
    setCName("");
    setCWeight(10);
    setBusy(false);
    startTransition(() => router.refresh());
  }

  async function removeCriterion(id: string) {
    await fetch(`/api/criteria?id=${id}`, { method: "DELETE" });
    startTransition(() => router.refresh());
  }

  return (
    <div className="card card-pad">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between"
      >
        <span className="text-sm font-semibold text-steel-50">
          Manage vendors &amp; criteria
        </span>
        <span className="text-steel-400">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Vendors */}
          <div>
            <span className="label">Vendors</span>
            <ul className="mt-2 space-y-1">
              {vendors.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-ink-line px-3 py-1.5 text-sm"
                >
                  <span className="text-steel-100">{v.name}</span>
                  <button
                    onClick={() => removeVendor(v.id)}
                    className="text-xs text-steel-500 hover:text-red-400"
                    title="Remove vendor"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-2">
              <input
                className="input"
                placeholder="New vendor name"
                value={vName}
                onChange={(e) => setVName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Short summary (optional)"
                value={vSummary}
                onChange={(e) => setVSummary(e.target.value)}
              />
              <button onClick={addVendor} disabled={busy} className="btn-ghost w-full">
                + Add vendor
              </button>
            </div>
          </div>

          {/* Criteria */}
          <div>
            <span className="label">Criteria (weights %)</span>
            <ul className="mt-2 space-y-1">
              {criteria.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-ink-line px-3 py-1.5 text-sm"
                >
                  <span className="text-steel-100">
                    {c.name} <span className="text-steel-500">· {c.weight}%</span>
                  </span>
                  <button
                    onClick={() => removeCriterion(c.id)}
                    className="text-xs text-steel-500 hover:text-red-400"
                    title="Remove criterion"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 space-y-2">
              <input
                className="input"
                placeholder="New criterion name"
                value={cName}
                onChange={(e) => setCName(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="input w-24"
                  value={cWeight}
                  onChange={(e) => setCWeight(Number(e.target.value))}
                />
                <span className="text-xs text-steel-500">% weight</span>
              </div>
              <button onClick={addCriterion} disabled={busy} className="btn-ghost w-full">
                + Add criterion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
