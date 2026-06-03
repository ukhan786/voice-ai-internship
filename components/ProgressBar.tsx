export default function ProgressBar({
  pct,
  className = "",
  tone = "accent",
}: {
  pct: number;
  className?: string;
  tone?: "accent" | "gold" | "steel";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(pct)));
  const bar =
    tone === "gold" ? "bg-gold" : tone === "steel" ? "bg-steel-400" : "bg-accent";
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-ink-line ${className}`}>
      <div
        className={`h-full rounded-full ${bar} animate-bar-fill transition-all duration-500`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
