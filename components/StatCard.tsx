export default function StatCard({
  label,
  value,
  sub,
  icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  tone?: "default" | "accent" | "gold" | "warn";
}) {
  const ring =
    tone === "accent"
      ? "border-accent/40"
      : tone === "gold"
        ? "border-gold/40"
        : tone === "warn"
          ? "border-red-500/40"
          : "border-ink-line";
  return (
    <div className={`card ${ring} card-pad`}>
      <div className="flex items-center justify-between">
        <p className="label">{label}</p>
        {icon && <span className="text-base">{icon}</span>}
      </div>
      <p className="mt-2 text-2xl font-bold text-steel-50">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-steel-400">{sub}</p>}
    </div>
  );
}
