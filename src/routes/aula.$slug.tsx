import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { MODULES } from "@/lib/mock-data";
import { Play, FileDown, ArrowRight, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/aula/$slug")({
  head: ({ params }) => {
    const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.slug === params.slug);
    return { meta: [
      { title: lesson ? `${lesson.title} — Aula FCIA Academy` : "Aula — FCIA Academy" },
      { name: "description", content: "Player de aula com anotações e materiais." },
    ] };
  },
  loader: ({ params }) => {
    const lesson = MODULES.flatMap((m) => m.lessons).find((l) => l.slug === params.slug);
    const mod = MODULES.find((m) => m.lessons.some((l) => l.slug === params.slug));
    if (!lesson || !mod) throw notFound();
    const idx = mod.lessons.findIndex((l) => l.slug === lesson.slug);
    const next = mod.lessons[idx + 1];
    return { lesson, mod, next };
  },
  notFoundComponent: () => <StudentShell><p className="text-muted-foreground">Aula não encontrada.</p></StudentShell>,
  errorComponent: ({ error }) => <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>,
  component: LessonPage,
});

function LessonPage() {
  const { lesson, mod, next } = Route.useLoaderData();
  return (
    <StudentShell>
      <PageHeader crumbs={[{ label: "Módulo", to: "/modulo/$slug" }, { label: lesson.title }]} eyebrow={mod.title} title={lesson.title} description={`${lesson.type.toUpperCase()} · ${lesson.durationMin} min`} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          <div className="relative grid aspect-video place-items-center overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl">
            <div className="absolute inset-0 tech-grid opacity-30" />
            <button className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
              <Play className="h-8 w-8" />
            </button>
            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-background/60 px-3 py-1 text-xs text-foreground backdrop-blur">Player · placeholder</span>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="font-display text-base font-semibold text-foreground">Anotações</h3>
            <textarea rows={4} placeholder="Escreva suas anotações desta aula…" className="mt-2 w-full rounded-xl border border-input bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40" />
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="font-display text-base font-semibold text-foreground">Downloads</h3>
            <ul className="mt-2 space-y-2 text-sm">
              {["Slides da aula (PDF)", "Código-fonte (ZIP)", "Cheatsheet (PDF)"].map((f) => (
                <li key={f} className="flex items-center justify-between rounded-xl border border-border/40 bg-background/40 p-3 text-foreground">
                  {f}
                  <button className="inline-flex items-center gap-1 text-xs text-primary"><FileDown className="h-3.5 w-3.5" /> Baixar</button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <h3 className="font-display text-base font-semibold text-foreground">Aulas do módulo</h3>
            <ul className="mt-3 space-y-1">
              {mod.lessons.map((l) => {
                const active = l.slug === lesson.slug;
                return (
                  <li key={l.slug}>
                    <Link to="/aula/$slug" params={{ slug: l.slug }} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${active ? "bg-secondary text-foreground ring-1 ring-inset ring-primary/30" : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"}`}>
                      {l.completed ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
                      <span className="min-w-0 flex-1 truncate">{l.title}</span>
                      <span className="text-[10px] text-muted-foreground">{l.durationMin}m</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="flex flex-wrap gap-2">
            <Link to="/quiz/$id" params={{ id: "q-react-hooks" }} className="rounded-full bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground">Fazer quiz</Link>
            {next && (
              <Link to="/aula/$slug" params={{ slug: next.slug }} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow">
                Próxima aula <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </aside>
      </div>
    </StudentShell>
  );
}
