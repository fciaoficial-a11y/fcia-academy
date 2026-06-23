import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { COURSES, MODULES } from "@/lib/mock-data";
import { Clock, BookOpen, Star, Award, Play, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/curso/$slug")({
  head: ({ params }) => {
    const c = COURSES.find((x) => x.slug === params.slug);
    return { meta: [
      { title: c ? `${c.title} — FCIA Academy` : "Curso — FCIA Academy" },
      { name: "description", content: c?.description ?? "Curso da FCIA Academy." },
    ] };
  },
  loader: ({ params }) => {
    const course = COURSES.find((x) => x.slug === params.slug);
    if (!course) throw notFound();
    return { course };
  },
  notFoundComponent: () => <StudentShell><p className="text-muted-foreground">Curso não encontrado.</p></StudentShell>,
  errorComponent: ({ error }) => <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>,
  component: CourseDetail,
});

function CourseDetail() {
  const { course } = Route.useLoaderData();
  const modules = MODULES.filter((m) => m.courseSlug === course.slug);
  const Icon = course.icon;
  return (
    <StudentShell>
      <PageHeader crumbs={[{ label: "Catálogo", to: "/catalogo" }, { label: course.title }]} eyebrow={course.category} title={course.title} description={course.description} />
      <section className="relative grid gap-6 overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl lg:grid-cols-[1.5fr_1fr]">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{course.hours}h</span>
            <span className="inline-flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" />{course.modules} módulos · {course.lessons} aulas</span>
            <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-primary" />{course.rating} ({course.students.toLocaleString("pt-BR")} alunos)</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border/40 bg-background/40 p-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">{course.instructor.split(" ").map((n: string) => n[0]).slice(0,2).join("")}</div>
            <div><p className="text-sm font-semibold text-foreground">{course.instructor}</p><p className="text-xs text-muted-foreground">{course.instructorRole}</p></div>
          </div>
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${course.progress}%` }} />
            </div>
            <span className="mt-1 block text-xs text-muted-foreground">{course.progress}% concluído</span>
          </div>
        </div>
        <div className="relative flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/40 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Icon className="h-6 w-6" /></span>
          <p className="text-sm text-muted-foreground">Ao concluir o curso e o quiz com nota mínima de 70%, seu certificado é emitido automaticamente.</p>
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow">
            <Play className="h-4 w-4" /> Continuar curso
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Award className="h-3.5 w-3.5 text-primary" /> Certificado validável incluso</div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Módulos</h2>
        <ul className="space-y-2">
          {modules.map((m, i) => (
            <li key={m.slug}>
              <Link to="/modulo/$slug" params={{ slug: m.slug }} className="block rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-colors hover:bg-secondary/40">
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary text-foreground font-mono text-sm">{String(i+1).padStart(2,"0")}</span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{m.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.summary} · {m.lessons.length} aulas · {m.durationMin} min</p>
                    </div>
                  </div>
                  <span className="shrink-0">{m.completed ? <CheckCircle2 className="h-5 w-5 text-primary" /> : <Circle className="h-5 w-5 text-muted-foreground" />}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </StudentShell>
  );
}
