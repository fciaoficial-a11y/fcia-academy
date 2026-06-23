import { Link, createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AI_STUDIO_TOOLS } from "@/lib/mock-data";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/admin/ai-studio/")({
  component: AiStudioIndex,
});

function AiStudioIndex() {
  return (
    <AdminShell>
      <PageHeader
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "AI Studio" }]}
        eyebrow="AI Studio"
        title="Geração de conteúdo"
        description="Gere quizzes, resumos, objetivos, cursos completos e mais. Cada saída entra como rascunho."
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/admin/ai-studio/pdf-to-course"
          className="group relative overflow-hidden rounded-3xl border border-primary/40 bg-primary/5 p-5 backdrop-blur-xl transition-colors hover:bg-primary/10"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="relative">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="mt-3 font-display text-base font-semibold text-foreground">PDF → Curso (novo)</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Envie um PDF e gere título, módulos, exercícios, banco de questões e certificado com IA.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
              Abrir <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
        {AI_STUDIO_TOOLS.map((tool) => (
          <Link
            key={tool.slug}
            to="/admin/ai-studio/$tool"
            params={{ tool: tool.slug }}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-colors hover:bg-secondary/40"
          >
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl" aria-hidden />
            <div className="relative">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{tool.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{tool.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                Abrir <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>
    </AdminShell>
  );
}