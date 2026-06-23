import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuizCard } from "@/components/cards/QuizCard";
import { MODULES } from "@/lib/mock-data";
import { CheckCircle2, Circle, Play } from "lucide-react";

export const Route = createFileRoute("/modulo/$slug")({
  head: ({ params }) => {
    const m = MODULES.find((x) => x.slug === params.slug);
    return { meta: [
      { title: m ? `${m.title} — FCIA Academy` : "Módulo — FCIA Academy" },
      { name: "description", content: m?.summary ?? "Módulo do curso." },
    ] };
  },
  loader: ({ params }) => {
    const mod = MODULES.find((x) => x.slug === params.slug);
    if (!mod) throw notFound();
    return { mod };
  },
  notFoundComponent: () => <StudentShell><p className="text-muted-foreground">Módulo não encontrado.</p></StudentShell>,
  errorComponent: ({ error }) => <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>,
  component: ModuleDetail,
});

function ModuleDetail() {
  const { mod } = Route.useLoaderData();
  return (
    <StudentShell>
      <PageHeader crumbs={[{ label: "Curso", to: "/curso/$slug" }, { label: mod.title }]} eyebrow="Módulo" title={mod.title} description={mod.summary} />
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Aulas</h2>
        <ul className="space-y-2">
          {mod.lessons.map((l) => (
            <li key={l.slug}>
              <Link to="/aula/$slug" params={{ slug: l.slug }} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl transition-colors hover:bg-secondary/40">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground"><Play className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{l.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{l.type} · {l.durationMin} min</p>
                </div>
                {l.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <QuizCard id="q-react-hooks" title={`Quiz · ${mod.title}`} questions={3} passing={70} />
    </StudentShell>
  );
}
