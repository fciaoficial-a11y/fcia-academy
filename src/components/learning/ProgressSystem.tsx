import { CheckCircle2, ListChecks, Target } from "lucide-react";

interface ProgressSystemProps {
  label: string;
  completed: number;
  total: number;
  variant?: "course" | "track";
  hint?: string;
}

export function ProgressSystem({ label, completed, total, variant = "course", hint }: ProgressSystemProps) {
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
  const remaining = Math.max(total - completed, 0);
  const Icon = variant === "track" ? Target : ListChecks;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="eyebrow text-primary">{variant === "track" ? "Progresso da trilha" : "Progresso do curso"}</span>
          <h3 className="truncate font-display text-lg font-semibold text-foreground">{label}</h3>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </span>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <Stat label="Concluídas" value={completed} accent />
        <Stat label="Restantes" value={remaining} />
        <Stat label="Total" value={total} />
      </div>

      <div className="mt-5">
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {completed} de {total}</span>
          <span className="font-mono">{pct}%</span>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
      <p className={`font-display text-xl font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}