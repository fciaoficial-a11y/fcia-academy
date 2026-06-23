import type { ReactNode } from "react";
import { Loader2, AlertCircle, Inbox, Database } from "lucide-react";

export interface DataStateProps<T> {
  loading: boolean;
  error: Error | null;
  data: T[] | undefined;
  configured?: boolean;
  emptyTitle?: string;
  emptyHint?: string;
  children: (data: T[]) => ReactNode;
}

export function DataState<T>({
  loading, error, data, configured = true, emptyTitle, emptyHint, children,
}: DataStateProps<T>) {
  if (!configured) {
    return (
      <Panel tone="warn" icon={<Database className="h-4 w-4" />}>
        Supabase não configurado. Acesse <a href="/system/setup" className="underline">/system/setup</a>.
      </Panel>
    );
  }
  if (loading) {
    return (
      <Panel icon={<Loader2 className="h-4 w-4 animate-spin" />}>
        Carregando dados reais…
      </Panel>
    );
  }
  if (error) {
    return (
      <Panel tone="bad" icon={<AlertCircle className="h-4 w-4" />}>
        <span className="font-medium">Erro:</span> {error.message}
      </Panel>
    );
  }
  if (!data || data.length === 0) {
    return (
      <Panel tone="muted" icon={<Inbox className="h-4 w-4" />}>
        <div>
          <div className="font-medium text-foreground">{emptyTitle ?? "Sem registros"}</div>
          {emptyHint && <div className="text-xs text-muted-foreground">{emptyHint}</div>}
        </div>
      </Panel>
    );
  }
  return <>{children(data)}</>;
}

function Panel({
  children, tone = "info", icon,
}: { children: ReactNode; tone?: "info" | "warn" | "bad" | "muted"; icon?: ReactNode }) {
  const cls =
    tone === "warn" ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400"
    : tone === "bad" ? "border-destructive/40 bg-destructive/5 text-destructive"
    : tone === "muted" ? "border-border/60 bg-card/40 text-muted-foreground"
    : "border-border/60 bg-card/40 text-muted-foreground";
  return (
    <div className={`flex items-center gap-3 rounded-2xl border p-4 text-sm ${cls}`}>
      {icon}
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function RealDataSection({
  title, source, children,
}: { title: string; source: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-3xl border border-primary/20 bg-primary/[0.02] p-5">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-primary">Dados reais · Supabase</p>
          <h3 className="font-display text-base font-semibold text-foreground">{title}</h3>
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{source}</span>
      </header>
      {children}
    </section>
  );
}