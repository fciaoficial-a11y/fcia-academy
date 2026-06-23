import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { ADMIN_USERS } from "@/lib/mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Admin FCIA Academy" }, { name: "description", content: "Gestão de usuários e papéis." }] }),
  component: AdminUsers,
});

function AdminUsers() {
  return (
    <AdminShell>
      <PageHeader crumbs={[{ label: "Admin", to: "/admin" }, { label: "Usuários" }]} eyebrow="Admin" title="Usuários" description={`${ADMIN_USERS.length} usuários cadastrados`}
        actions={<button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"><Plus className="h-4 w-4" /> Convidar</button>} />
      <FilterChips options={["Todos", "Alunos", "Instrutores", "Admins"]} active="Todos" />
      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-4 py-3 text-left">Usuário</th><th className="px-4 py-3 text-left">Papel</th><th className="px-4 py-3 text-left">XP</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Ações</th></tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ADMIN_USERS.map((u) => (
                <tr key={u.id} className="hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground">{u.name.split(" ").map(n=>n[0]).slice(0,2).join("")}</span>
                      <div className="min-w-0"><p className="truncate text-foreground">{u.name}</p><p className="truncate text-xs text-muted-foreground">{u.email}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-foreground">{u.role}</td>
                  <td className="px-4 py-3 text-foreground">{u.xp.toLocaleString("pt-BR")}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${u.status === "ativo" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>{u.status}</span></td>
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
