import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { adminTracksQuery, adminCoursesQuery, type Row } from "@/lib/admin-content.queries";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/trilhas")({
  head: () => ({ meta: [{ title: "Trilhas — Admin FCIA Academy" }, { name: "description", content: "CRUD de trilhas." }] }),
  component: AdminTracks,
});

function pick(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return String(v);
  }
  return "—";
}

function AdminTracks() {
  const tracks = useQuery(adminTracksQuery());
  const courses = useQuery(adminCoursesQuery());

  const countCoursesFor = (trackKey: string): number => {
    if (!courses.data) return 0;
    return courses.data.rows.filter((c) => {
      const v = c["track_id"] ?? c["track_slug"] ?? c["trackId"] ?? c["track"];
      return v != null && String(v) === trackKey;
    }).length;
  };

  const columns: AdminColumn[] = [
    { key: "title", label: "Trilha", render: (r) => pick(r, ["title", "name", "label"]) },
    { key: "level", label: "Nível", render: (r) => pick(r, ["level", "difficulty", "tier"]) },
    {
      key: "courses",
      label: "Cursos vinculados",
      render: (r) => {
        const key = String(r["id"] ?? r["slug"] ?? "");
        const fromRow = r["courses_count"] ?? r["courses"];
        return String(fromRow ?? countCoursesFor(key) ?? "—");
      },
    },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const s = String(r["status"] ?? (r["published_at"] ? "publicado" : "rascunho"));
        return (
          <span className={"rounded-full px-2 py-0.5 text-xs " + (s.toLowerCase().includes("publi") ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
            {s}
          </span>
        );
      },
    },
  ];

  return (
    <AdminShell>
      <PageHeader
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Trilhas" }]}
        eyebrow="Admin"
        title="Trilhas"
        description="Gestão de trilhas de aprendizagem."
        actions={
          <button
            type="button"
            onClick={() => toast.info("Criação ainda não disponível", { description: "Habilite uma write policy em tracks para liberar criação." })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"
          >
            <Plus className="h-4 w-4" /> Nova trilha
          </button>
        }
      />
      <FilterChips options={["Todos", "Publicados", "Rascunho", "Arquivados"]} active="Todos" />
      <AdminDataTable
        result={tracks.data}
        isLoading={tracks.isLoading}
        error={tracks.error as Error | null}
        columns={columns}
        detailTitle={(r) => pick(r, ["title", "name", "label"])}
        rlsMessage="Sua RLS atual pode estar restringindo a leitura de tracks."
      />
    </AdminShell>
  );
}
