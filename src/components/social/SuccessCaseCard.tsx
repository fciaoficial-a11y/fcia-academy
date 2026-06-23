import { TrendingUp } from "lucide-react";
import type { SuccessCase } from "@/lib/mock-data";

export function SuccessCaseCard({ c }: { c: SuccessCase }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/15 blur-3xl" aria-hidden />
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">
          {c.logo}
        </span>
        <p className="font-display text-base font-semibold text-foreground">{c.company}</p>
      </header>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="font-display text-4xl font-bold text-gradient">{c.metric}</span>
        <span className="inline-flex items-center gap-1 text-xs text-primary">
          <TrendingUp className="h-3 w-3" /> {c.label}
        </span>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{c.story}</p>
    </article>
  );
}