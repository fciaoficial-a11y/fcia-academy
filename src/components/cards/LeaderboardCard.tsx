import { ArrowDown, ArrowUp, Minus, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface LeaderboardCardProps {
  entries: LeaderboardEntry[];
  title?: string;
}

export function LeaderboardCard({ entries, title = "Ranking" }: LeaderboardCardProps) {
  return (
    <section className="space-y-3 rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <Trophy className="h-4 w-4 text-primary" /> {title}
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">XP semanal</span>
      </header>
      <ul className="space-y-1.5">
        {entries.map((e) => (
          <li
            key={e.rank}
            className={cn(
              "grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-3 rounded-xl border px-3 py-2 text-sm",
              e.isYou ? "border-primary/50 bg-primary/10" : "border-border/40 bg-background/40",
            )}
          >
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg text-xs font-bold",
                e.rank === 1 && "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                e.rank === 2 && "bg-secondary text-foreground",
                e.rank === 3 && "bg-secondary text-foreground",
                e.rank > 3 && "bg-background/60 text-muted-foreground",
              )}
            >
              {e.rank}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-medium text-foreground">
                {e.name} {e.isYou && <span className="text-[10px] text-primary">(você)</span>}
              </span>
              <span className="block text-[10px] text-muted-foreground">Nível {e.level}</span>
            </span>
            <Delta delta={e.delta} />
            <span className="font-mono text-xs text-foreground">{e.xp.toLocaleString("pt-BR")}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Delta({ delta }: { delta: number }) {
  if (delta === 0) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  if (delta > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-primary">
        <ArrowUp className="h-3 w-3" /> {delta}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] text-destructive">
      <ArrowDown className="h-3 w-3" /> {Math.abs(delta)}
    </span>
  );
}