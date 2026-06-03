import Link from "next/link";

export type JourneyStop = {
  week_no: number;
  title: string;
  theme: string;
  pct: number; // 0..100 task completion
  isCurrent: boolean;
  milestone: string | null;
};

function nodeClasses(stop: JourneyStop): string {
  if (stop.pct >= 100) return "border-accent bg-accent text-ink";
  if (stop.isCurrent) return "border-accent bg-accent/15 text-accent animate-pulse";
  if (stop.pct > 0) return "border-gold/60 bg-gold/10 text-gold";
  return "border-ink-line bg-ink-soft text-steel-400";
}

export default function JourneyMap({ stops }: { stops: JourneyStop[] }) {
  return (
    <div className="card card-pad">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-steel-50">Journey Map</h2>
        <span className="chip">10-week path · June 1 → Aug 7</span>
      </div>

      <div className="-mx-1 overflow-x-auto pb-2">
        <ol className="flex min-w-max items-start gap-0 px-1">
          {stops.map((stop, i) => (
            <li key={stop.week_no} className="flex items-start">
              {i > 0 && (
                <div
                  className={`mt-5 h-0.5 w-8 sm:w-12 ${
                    stops[i - 1].pct >= 100 ? "bg-accent" : "bg-ink-line"
                  }`}
                />
              )}
              <Link
                href={`/weeks/${stop.week_no}`}
                className="group flex w-24 flex-col items-center text-center"
                title={`Week ${stop.week_no}: ${stop.title}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition-transform group-hover:scale-110 ${nodeClasses(
                    stop,
                  )}`}
                >
                  {stop.pct >= 100 ? "✓" : stop.week_no}
                </div>
                <p className="mt-2 text-[11px] font-medium leading-tight text-steel-200">
                  Wk {stop.week_no}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-steel-500">
                  {stop.theme}
                </p>
                {stop.milestone && (
                  <span className="mt-1 inline-block text-[9px] leading-tight text-gold/80">
                    ★
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
