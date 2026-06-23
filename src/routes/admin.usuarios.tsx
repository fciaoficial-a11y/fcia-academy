import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { adminProfilesQuery, type Row } from "@/lib/admin-content.queries";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuários — Admin FCIA Academy" }, { name: "description", content: "Gestão de usuários e papéis." }] }),
  component: AdminUsers,
});

function pick(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return String(v);
  }
  return "—";
}

function AdminUsers() {
  const profiles = useQuery(adminProfilesQuery());
  const total = profiles.data?.count ?? 0;

  const columns: AdminColumn[] = [
    {
      key: "user",
      label: "Usuário",
      render: (r) => {
        const name = pick(r, ["full_name", "name", "display_name", "username"]);
        const email = pick(r, ["email", "user_email"]);
        const initials = name === "—" ? "??" : name.split(" ").map((n) => n[0]).slice(0, 2).join("");
        return (
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[10px] font-semibold text-primary-foreground">{initials}</span>
            <div className="min-w-0">
              <p className="truncate text-foreground">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        );
      },
    },
    { key: "role", label: "Papel", render: (r) => pick(r, ["role", "user_role", "permission"]) },
    { key: "xp", label: "XP", render: (r) => pick(r, ["xp", "xp_total", "points"]) },
    { key: "level", label: "Nível", render: (r) => pick(r, ["level", "rank"]) },
    { key: "certificates", label: "Certificados", render: (r) => pick(r, ["certificates_count", "certificates", "n_certificates"]) },
    {
      key: "status",
      label: "Estado",
      render: (r) => {
        const s = String(r["status"] ?? (r["is_active"] === false ? "inativo" : "ativo"));
        return (
          <span className={"rounded-full px-2 py-0.5 text-xs " + (s.toLowerCase() === "ativo" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
            {s}
          </span>
        );
      },
    },
  ];

  return (
    <AdminShell>
      <PageHeader
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Usuários" }]}
        eyebrow="Admin"
        title="Usuários"
        description={`${total} usuário(s) visíveis para sua sessão.`}
        actions={
          <button
            type="button"
            onClick={() => toast.info("Convite ainda não disponível", { description: "Use o painel Auth do Supabase ou habilite uma write policy." })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"
          >
            <Plus className="h-4 w-4" /> Convidar
          </button>
        }
      />
      <FilterChips options={["Todos", "Alunos", "Instrutores", "Admins"]} active="Todos" />
      <AdminDataTable
        result={profiles.data}
        isLoading={profiles.isLoading}
        error={profiles.error as Error | null}
        columns={columns}
        detailTitle={(r) => pick(r, ["full_name", "name", "email"])}
        rlsMessage="Sua RLS atual não expõe outros usuários."
      />
    </AdminShell>
  );
}
