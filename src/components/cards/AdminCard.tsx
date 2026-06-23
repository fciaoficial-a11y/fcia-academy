import type { ReactNode } from "react";

export function AdminCard({ title, value, hint, action }: { title: string; value: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <span className="text-xs text-muted-foreground">{title}</span>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
      {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
