import { BADGES } from "@/lib/curriculum";

export default function BadgeShelf({ earnedKeys }: { earnedKeys: string[] }) {
  const earned = new Set(earnedKeys);
  return (
    <div className="card card-pad">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-steel-50">Badges</h2>
        <span className="chip">
          {earned.size}/{BADGES.length} earned
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3">
        {BADGES.map((b) => {
          const has = earned.has(b.key);
          return (
            <div
              key={b.key}
              className={`flex flex-col items-center rounded-lg border p-3 text-center transition-colors ${
                has
                  ? "border-accent/40 bg-accent/5"
                  : "border-ink-line bg-ink-soft/40 opacity-60"
              }`}
              title={has ? b.description : `Locked · ${b.hint}`}
            >
              <span className={`text-2xl ${has ? "" : "grayscale"}`}>{b.icon}</span>
              <p className="mt-1 text-[11px] font-medium leading-tight text-steel-100">
                {b.name}
              </p>
              <p className="mt-0.5 text-[9px] leading-tight text-steel-500">
                {has ? "Earned" : b.hint}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
