import { levelTitle, type LevelInfo } from "@/lib/xp";
import ProgressBar from "./ProgressBar";

export default function XPBar({ info }: { info: LevelInfo }) {
  return (
    <div className="card card-pad">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-accent/40 bg-accent/10 text-lg font-bold text-accent shadow-glow">
            {info.level}
          </div>
          <div>
            <p className="text-sm font-semibold text-steel-50">
              Level {info.level}
            </p>
            <p className="text-xs text-accent">{levelTitle(info.level)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-steel-50">
            {info.totalXp.toLocaleString()}{" "}
            <span className="text-xs font-normal text-steel-400">XP</span>
          </p>
          <p className="text-xs text-steel-400">
            {info.xpToNext.toLocaleString()} to level {info.level + 1}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar pct={info.progressPct} />
        <div className="mt-1 flex justify-between text-[10px] text-steel-500">
          <span>{info.xpIntoLevel} XP this level</span>
          <span>{info.xpForThisLevel} XP needed</span>
        </div>
      </div>
    </div>
  );
}
