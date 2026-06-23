import { Flame, Trophy, Zap } from "lucide-react";
import type { XPLevel } from "@/lib/mock-data";

interface XPSystemProps {
  level: number;
  xp: number;
  xpToNext: number;
  streak?: number;
  rank?: number;
  levels?: XPLevel[];
}

export function XPSystem({ level, xp, xpToNext, streak, rank, levels }: XPSystemProps) {
  const pct = xpToNext === 0 ? 100 : Math.min(100, Math.round((xp / xpToNext) * 100));
  const remaining = Math.max(xpToNext - xp, 0);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-primary">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" aria-hidden />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="eyebrow text-primary">Nível {level}</span>
          <h3 className="font-display text-2xl font-semibold text-foreground">
            {xp.toLocaleString("pt-BR")} <span className="text-base text-muted-foreground">/ {xpToNext.toLocaleString("pt-BR")} XP</span>
          </h3>
          <p className="text-sm text-muted-foreground">Faltam {remaining.toLocaleString("pt-BR")} XP para o nível {level + 1}.</p>
        </div>
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Zap className="h-6 w-6" />
        </span>
      </header>

      <div className="mt-5">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${pct}%` }}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className="mt-1 block text-right text-[11px] font-mono text-muted-foreground">{pct}%</span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {streak !== undefined && (
          <Stat icon={<Flame className="h-4 w-4 text-primary" />} label="Streak" value={`${streak} dias`} />
        )}
        {rank !== undefined && (
          <Stat icon={<Trophy className="h-4 w-4 text-primary" />} label="Ranking" value={`#${rank}`} />
        )}
        <Stat icon={<Zap className="h-4 w-4 text-primary" />} label="Nível atual" value={`${level}`} />
      </div>

      {levels && levels.length > 0 && (
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Próximos níveis</p>
          <ul className="mt-2 space-y-1.5">
            {levels.map((l) => {
              const reached = xp >= l.required;
              return (
                <li
                  key={l.level}
                  className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-xs"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <span className={`grid h-6 w-6 place-items-center rounded-lg text-[10px] font-bold ${reached ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                      {l.level}
                    </span>
                    {l.title}
                  </span>
                  <span className="font-mono text-muted-foreground">{l.required.toLocaleString("pt-BR")} XP</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <p className="mt-1 font-display text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}