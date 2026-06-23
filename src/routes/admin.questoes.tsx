import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { FilterChips } from "@/components/shared/FilterChips";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { adminQuestionsQuery, adminModulesQuery, type Row } from "@/lib/admin-content.queries";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/questoes")({
  head: () => ({ meta: [{ title: "Questões — Admin FCIA Academy" }, { name: "description", content: "Banco de questões." }] }),
  component: AdminQuestions,
});

function pick(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return String(v);
  }
  return "—";
}

function summarizeAlternatives(r: Row): string {
  const raw = r["alternatives"] ?? r["options"] ?? r["choices"];
  if (Array.isArray(raw)) return raw.map((a) => (typeof a === "string" ? a : (a as { text?: string }).text ?? "")).filter(Boolean).slice(0, 3).join(" · ");
  if (typeof raw === "object" && raw) return Object.values(raw).slice(0, 3).map(String).join(" · ");
  return pick(r, ["prompt", "question", "statement"]);
}

function AdminQuestions() {
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const modules = useQuery(adminModulesQuery());
  const questions = useQuery(adminQuestionsQuery(moduleFilter));

  const moduleOptions = useMemo(() => {
    const opts = ["Todos"];
    modules.data?.rows.forEach((m) => opts.push(pick(m, ["title", "name", "slug", "id"])));
    return opts;
  }, [modules.data]);

  const handleChip = (label: string) => {
    if (label === "Todos") return setModuleFilter("all");
    const match = modules.data?.rows.find((m) => pick(m, ["title", "name", "slug", "id"]) === label);
    setModuleFilter(String(match?.["id"] ?? match?.["slug"] ?? "all"));
  };

  const columns: AdminColumn[] = [
    { key: "type", label: "Tipo", render: (r) => pick(r, ["type", "kind", "question_type"]) },
    { key: "module", label: "Módulo", render: (r) => pick(r, ["module_slug", "module_id", "moduleId", "module"]) },
    { key: "prompt", label: "Enunciado / alternativas", render: (r) => <span className="line-clamp-2 text-foreground">{summarizeAlternatives(r)}</span> },
    { key: "explanation", label: "Explicação", render: (r) => <span className="line-clamp-1 text-muted-foreground">{pick(r, ["explanation", "rationale", "feedback"])}</span> },
    {
      key: "preview",
      label: "Preview",
      render: (r) => {
        const id = r["id"] ?? r["quiz_id"];
        if (!id) return "—";
        return (
          <Link to="/quiz/$id" params={{ id: String(id) }} className="text-xs text-primary hover:underline">
            ver no quiz
          </Link>
        );
      },
    },
  ];

  return (
    <AdminShell>
      <PageHeader
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Questões" }]}
        eyebrow="Admin"
        title="Questões"
        description="Banco de questões por módulo."
        actions={
          <button
            type="button"
            onClick={() => toast.info("Criação ainda não disponível", { description: "Habilite uma write policy em questions." })}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"
          >
            <Plus className="h-4 w-4" /> Nova questão
          </button>
        }
      />
      <FilterChips options={moduleOptions} active={moduleFilter === "all" ? "Todos" : pick(modules.data?.rows.find((m) => String(m["id"] ?? m["slug"]) === moduleFilter) ?? {}, ["title", "name", "slug"]) } onChange={handleChip} />
      <AdminDataTable
        result={questions.data}
        isLoading={questions.isLoading}
        error={questions.error as Error | null}
        columns={columns}
        detailTitle={(r) => pick(r, ["prompt", "question", "title"])}
      />
    </AdminShell>
  );
}
