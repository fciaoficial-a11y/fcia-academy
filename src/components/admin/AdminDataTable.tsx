import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { sourceBadge, type AdminListResult, type Row } from "@/lib/admin-content.queries";
import { Eye, Pencil, ShieldAlert, Database, AlertTriangle } from "lucide-react";

export interface AdminColumn {
  key: string;
  label: string;
  render?: (row: Row) => ReactNode;
}

export interface AdminDataTableProps {
  result: AdminListResult | undefined;
  isLoading?: boolean;
  error?: Error | null;
  columns: AdminColumn[];
  detailTitle?: (row: Row) => string;
  renderDetail?: (row: Row) => ReactNode;
  emptyMessage?: string;
  rlsMessage?: string;
}

function valueToString(v: unknown): string {
  if (v == null) return "—";
  if (typeof v === "object") return JSON.stringify(v).slice(0, 80);
  return String(v);
}

export function AdminDataTable({
  result,
  isLoading,
  error,
  columns,
  detailTitle,
  renderDetail,
  emptyMessage = "Nenhum registro encontrado.",
  rlsMessage,
}: AdminDataTableProps) {
  const [selected, setSelected] = useState<Row | null>(null);

  const badge = useMemo(() => (result ? sourceBadge(result.source) : null), [result]);

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-3xl border border-destructive/40 bg-destructive/10 p-6 text-sm text-destructive">
        <AlertTriangle className="mt-0.5 h-4 w-4" />
        <div>
          <p className="font-medium">Falha ao carregar dados</p>
          <p className="text-xs opacity-80">{error.message}</p>
        </div>
      </div>
    );
  }

  const rows = result?.rows ?? [];

  return (
    <div className="space-y-3">
      {badge && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-medium " +
              (badge.tone === "real"
                ? "bg-primary/15 text-primary"
                : badge.tone === "warn"
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-muted text-muted-foreground")
            }
          >
            <Database className="h-3 w-3" /> {badge.label} · {result?.table}
          </span>
          {result?.notice && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert className="h-3 w-3" /> {result.notice}
            </span>
          )}
          {result?.source === "rls-empty" && rlsMessage && (
            <span className="text-amber-500">{rlsMessage}</span>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left font-medium">{c.label}</th>
                ))}
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={(r["id"] as string) ?? i} className="hover:bg-secondary/30">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-foreground">
                        {c.render ? c.render(r) : valueToString(r[c.key])}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelected(r)}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs text-foreground hover:bg-secondary"
                        >
                          <Eye className="h-3 w-3" /> Detalhe
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toast.info("Ação de gravação ainda não disponível", {
                              description: "Conecte uma write policy ou habilite mutation para liberar a edição.",
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs text-primary hover:bg-primary/25"
                        >
                          <Pencil className="h-3 w-3" /> Editar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={selected !== null} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{detailTitle ? detailTitle(selected) : "Detalhe do registro"}</SheetTitle>
                <SheetDescription>Visão administrativa apenas leitura.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {renderDetail ? (
                  renderDetail(selected)
                ) : (
                  <pre className="max-h-[60vh] overflow-auto rounded-xl border border-border/60 bg-secondary/30 p-3 text-[11px] leading-relaxed text-foreground">
                    {JSON.stringify(selected, null, 2)}
                  </pre>
                )}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => toast.info("Revisão registrada como rascunho (placeholder).")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-foreground"
                  >
                    Revisar
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Ação de gravação ainda não disponível.")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}