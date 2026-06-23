import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { ADMIN_RESOURCES } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/trilhas")({
  head: () => ({ meta: [{ title: "Trilhas — Admin FCIA Academy" }, { name: "description", content: "CRUD de trilhas." }] }),
  component: AdminTable,
});

function AdminTable() {
  const rows = ADMIN_RESOURCES.trilhas as Array<Record<string, string | number>>;
  const cols = rows.length ? Object.keys(rows[0]) : [];
  return (
    <AdminShell>
      <PageHeader crumbs={[{ label: "Admin", to: "/admin" }, { label: "Trilhas" }]} eyebrow="Admin" title="Trilhas" description="CRUD de trilhas."
        actions={<button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"><Plus className="h-4 w-4" /> Novo</button>} />
      <FilterChips options={["Todos", "Publicados", "Rascunho", "Arquivados"]} active="Todos" />
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>{cols.map((c) => <th key={c} className="px-4 py-3 text-left font-medium">{c}</th>)}<th className="px-4 py-3 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {rows.map((r, i) => (
                <tr key={i} className="hover:bg-secondary/30">
                  {cols.map((c) => <td key={c} className="px-4 py-3 text-foreground">{String(r[c])}</td>)}
                  <td className="px-4 py-3 text-right"><button className="text-xs text-primary hover:underline">Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
