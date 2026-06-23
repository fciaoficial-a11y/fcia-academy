import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { adminCoursesQuery, adminTracksQuery, type Row } from "@/lib/admin-content.queries";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/cursos")({
  head: () => ({ meta: [{ title: "Cursos — Admin FCIA Academy" }, { name: "description", content: "CRUD de cursos." }] }),
  component: AdminCourses,
});

function pick(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return String(v);
  }
  return "—";
}

function AdminCourses() {
  const [trackFilter, setTrackFilter] = useState<string>("all");
  const tracks = useQuery(adminTracksQuery());
  const courses = useQuery(adminCoursesQuery(trackFilter));

  const trackOptions = useMemo(() => {
    const opts = ["Todos"];
    tracks.data?.rows.forEach((t) => opts.push(pick(t, ["title", "name", "slug", "id"])));
    return opts;
  }, [tracks.data]);

  const handleChip = (label: string) => {
    if (label === "Todos") return setTrackFilter("all");
    const match = tracks.data?.rows.find((t) => pick(t, ["title", "name", "slug", "id"]) === label);
    setTrackFilter(String(match?.["id"] ?? match?.["slug"] ?? "all"));
  };

  const columns: AdminColumn[] = [
    { key: "title", label: "Curso", render: (r) => pick(r, ["title", "name", "label"]) },
    { key: "track", label: "Trilha", render: (r) => pick(r, ["track_slug", "track_id", "trackId", "track"]) },
    { key: "level", label: "Nível", render: (r) => pick(r, ["level", "difficulty"]) },
    { key: "hours", label: "Carga", render: (r) => pick(r, ["hours", "duration_hours", "duration_minutes"]) },
    { key: "price", label: "Preço", render: (r) => pick(r, ["price", "price_brl", "amount"]) },
    {
      key: "students",
      label: "Impacto (alunos)",
      render: (r) => pick(r, ["enrollments_count", "students", "students_count"]),
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
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Cursos" }]}
        eyebrow="Admin"
        title="Cursos"
        description="Gestão de cursos vinculados às trilhas."
        actions={
          <button
            type="button"
            onClick={() => toast.info("Criação ainda não disponível", { description: "Habilite uma write policy em courses." })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"
          >
            <Plus className="h-4 w-4" /> Novo curso
          </button>
        }
      />
      <FilterChips
        options={trackOptions}
        active={trackFilter === "all" ? "Todos" : (tracks.data?.rows.find((t) => String(t["id"] ?? t["slug"]) === trackFilter) ? pick(tracks.data.rows.find((t) => String(t["id"] ?? t["slug"]) === trackFilter)!, ["title", "name", "slug"]) : "Todos")}
        onChange={handleChip}
      />
      <AdminDataTable
        result={courses.data}
        isLoading={courses.isLoading}
        error={courses.error as Error | null}
        columns={columns}
        detailTitle={(r) => pick(r, ["title", "name", "label"])}
        rlsMessage="Sua RLS atual pode estar restringindo a leitura de courses."
      />
    </AdminShell>
  );
}
