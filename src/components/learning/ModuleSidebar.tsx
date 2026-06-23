import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Lock, Play } from "lucide-react";
import type { Lesson, Module } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface ModuleSidebarProps {
  mod: Module;
  currentSlug: string;
}

export function ModuleSidebar({ mod, currentSlug }: ModuleSidebarProps) {
  const total = mod.lessons.length;
  const done = mod.lessons.filter((l) => l.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  let firstUnlockedFound = false;

  return (
    <section className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <span className="eyebrow text-primary">Módulo atual</span>
          <h3 className="truncate font-display text-base font-semibold text-foreground">{mod.title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-foreground">
          {done}/{total}
        </span>
      </header>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">{pct}% concluído</p>

      <ul className="mt-4 space-y-1">
        {mod.lessons.map((l: Lesson, idx: number) => {
          const active = l.slug === currentSlug;
          const previousDone = idx === 0 || mod.lessons[idx - 1].completed;
          const unlocked = l.completed || active || previousDone || firstUnlockedFound;
          if (!l.completed && unlocked) firstUnlockedFound = true;

          const inner = (
            <span
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
                active && "bg-secondary text-foreground ring-1 ring-inset ring-primary/30",
                !active && unlocked && "text-muted-foreground hover:bg-secondary/40 hover:text-foreground",
                !unlocked && "cursor-not-allowed text-muted-foreground/50",
              )}
            >
              {l.completed ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : !unlocked ? (
                <Lock className="h-4 w-4" />
              ) : active ? (
                <Play className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="min-w-0 flex-1 truncate">{l.title}</span>
              <span className="text-[10px] text-muted-foreground">{l.durationMin}m</span>
            </span>
          );

          return (
            <li key={l.slug}>
              {unlocked ? (
                <Link to="/aula/$slug" params={{ slug: l.slug }}>{inner}</Link>
              ) : (
                <div aria-disabled>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}