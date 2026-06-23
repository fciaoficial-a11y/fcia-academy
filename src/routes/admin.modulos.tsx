import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { adminModulesQuery, adminCoursesQuery, type Row } from "@/lib/admin-content.queries";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/modulos")({
  head: () => ({ meta: [{ title: "Módulos — Admin FCIA Academy" }, { name: "description", content: "CRUD de módulos." }] }),
  component: AdminModules,
});

function pick(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return String(v);
  }
  return "—";
}

function AdminModules() {
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const courses = useQuery(adminCoursesQuery());
  const modules = useQuery(adminModulesQuery(courseFilter));

  const courseOptions = useMemo(() => {
    const opts = ["Todos"];
    courses.data?.rows.forEach((c) => opts.push(pick(c, ["title", "name", "slug", "id"])));
    return opts;
  }, [courses.data]);

  const handleChip = (label: string) => {
    if (label === "Todos") return setCourseFilter("all");
    const match = courses.data?.rows.find((c) => pick(c, ["title", "name", "slug", "id"]) === label);
    setCourseFilter(String(match?.["id"] ?? match?.["slug"] ?? "all"));
  };

  const columns: AdminColumn[] = [
    { key: "order", label: "#", render: (r) => pick(r, ["order", "position", "index", "sort"]) },
    { key: "title", label: "Módulo", render: (r) => pick(r, ["title", "name", "label"]) },
    { key: "course", label: "Curso", render: (r) => pick(r, ["course_slug", "course_id", "courseId", "course"]) },
    { key: "video", label: "Vídeo", render: (r) => (r["video_url"] || r["video"] ? "✓" : "—") },
    { key: "pdf", label: "PDF", render: (r) => (r["pdf_url"] || r["pdf"] ? "✓" : "—") },
    { key: "duration", label: "Duração", render: (r) => pick(r, ["duration_minutes", "durationMin", "duration"]) },
    {
      key: "preview",
      label: "Preview",
      render: (r) => {
        const slug = r["slug"] as string | undefined;
        if (!slug) return "—";
        return (
          <Link to="/modulo/$slug" params={{ slug }} className="text-xs text-primary hover:underline">
            ver como aluno
          </Link>
        );
      },
    },
  ];

  return (
    <AdminShell>
      <PageHeader
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Módulos" }]}
        eyebrow="Admin"
        title="Módulos"
        description="Gestão de módulos por curso."
        actions={
          <button
            type="button"
            onClick={() => toast.info("Criação ainda não disponível", { description: "Habilite uma write policy em modules." })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"
          >
            <Plus className="h-4 w-4" /> Novo módulo
          </button>
        }
      />
      <FilterChips options={courseOptions} active={courseFilter === "all" ? "Todos" : pick(courses.data?.rows.find((c) => String(c["id"] ?? c["slug"]) === courseFilter) ?? {}, ["title", "name", "slug"]) } onChange={handleChip} />
      <AdminDataTable
        result={modules.data}
        isLoading={modules.isLoading}
        error={modules.error as Error | null}
        columns={columns}
        detailTitle={(r) => pick(r, ["title", "name", "label"])}
      />
    </AdminShell>
  );
}
