import type { LucideIcon } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}
export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-xs text-muted-foreground">{label}</span>
          <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
          {hint && <span className="mt-1 block text-[11px] text-muted-foreground">{hint}</span>}
        </div>
        {Icon && (
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
    </div>
  );
}
