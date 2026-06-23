import { TrendingDown, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface AdminMetricCardProps {
  label: string;
  value: string;
  hint?: string;
  trend?: "up" | "down" | "flat";
  icon?: LucideIcon;
}

export function AdminMetricCard({ label, value, hint, trend = "flat", icon: Icon }: AdminMetricCardProps) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-2xl" aria-hidden />
      <header className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground">
            <Icon className="h-4 w-4" />
          </span>
        )}
      </header>
      <p className="mt-2 font-display text-2xl font-semibold text-foreground">{value}</p>
      {hint && (
        <p className={`mt-1 inline-flex items-center gap-1 text-[11px] ${trend === "down" ? "text-destructive" : trend === "up" ? "text-primary" : "text-muted-foreground"}`}>
          {trend === "up" && <TrendingUp className="h-3 w-3" />}
          {trend === "down" && <TrendingDown className="h-3 w-3" />}
          {hint}
        </p>
      )}
    </article>
  );
}