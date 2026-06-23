import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { CheckCircle2, Circle, Clock, Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  courseBySlugQO,
  courseProgressQO,
  enrollInCourse,
  enrollmentsKey,
  myEnrollmentsQO,
  progressKey,
  toggleModuleCompletion,
  type ModuleRow,
} from "@/lib/learning";

export const Route = createFileRoute("/curso/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Curso ${params.slug} — FCIA Academy` },
      { name: "description", content: "Detalhe do curso e módulos." },
    ],
  }),
  notFoundComponent: () => (
    <StudentShell>
      <p className="text-muted-foreground">Curso não encontrado.</p>
    </StudentShell>
  ),
  errorComponent: ({ error }) => (
    <StudentShell>
      <p className="text-destructive">Erro: {error.message}</p>
    </StudentShell>
  ),
  component: CourseDetail,
});

function CourseDetail() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const data = useQuery(courseBySlugQO(slug));
  const enrollments = useQuery(myEnrollmentsQO(user?.id));

  if (data.isLoading) {
    return (
      <StudentShell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      </StudentShell>
    );
  }
  if (data.error)
    return (
      <StudentShell>
        <p className="text-destructive">Erro: {(data.error as Error).message}</p>
      </StudentShell>
    );
  if (!data.data) throw notFound();

  const { course, modules } = data.data;
  const isEnrolled = (enrollments.data ?? []).some((e) => e.course_id === course.id);

  return (
    <StudentShell>
      <PageHeader
        crumbs={[{ label: "Catálogo", to: "/catalogo" }, { label: course.title }]}
        eyebrow="Curso"
        title={course.title}
        description={course.description ?? undefined}
      />
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {course.hours_load != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.hours_load}h
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> {modules.length} módulos
        </span>
      </div>

      {!user ? (
        <Button asChild>
          <Link to="/login">Entrar para matricular</Link>
        </Button>
      ) : !isEnrolled ? (
        <EnrollCTA courseId={course.id} userId={user.id} />
      ) : null}

      <section className="space-y-2">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Módulos
        </h2>
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este curso ainda não tem módulos.</p>
        ) : isEnrolled && user ? (
          <ModuleList courseId={course.id} modules={modules} userId={user.id} />
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
            {modules.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                <Circle className="h-4 w-4 text-muted-foreground" />
                <span>{m.title}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {isEnrolled && (
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to="/meus-cursos">Voltar aos meus cursos</Link>
          </Button>
          <Button asChild>
            <Link to="/curso/$slug/prova" params={{ slug }}>
              Ir para prova
            </Link>
          </Button>
        </div>
      )}
    </StudentShell>
  );
}

function EnrollCTA({ courseId, userId }: { courseId: string; userId: string }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => enrollInCourse(courseId, userId),
    onSuccess: () => {
      toast.success("Matrícula realizada");
      qc.invalidateQueries({ queryKey: enrollmentsKey(userId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Button onClick={() => m.mutate()} disabled={m.isPending}>
      {m.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      Matricular neste curso
    </Button>
  );
}

function ModuleList({
  courseId,
  modules,
  userId,
}: {
  courseId: string;
  modules: ModuleRow[];
  userId: string;
}) {
  const qc = useQueryClient();
  const progress = useQuery(courseProgressQO(userId, courseId));
  const completed = useMemo(() => progress.data ?? new Set<string>(), [progress.data]);

  const toggle = useMutation({
    mutationFn: (m: { moduleId: string; done: boolean }) =>
      toggleModuleCompletion(m.moduleId, userId, m.done),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: progressKey(userId, courseId) });
      qc.invalidateQueries({ queryKey: enrollmentsKey(userId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
      {modules.map((m) => {
        const done = completed.has(m.id);
        return (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3 text-sm">
            <button
              type="button"
              onClick={() => toggle.mutate({ moduleId: m.id, done })}
              disabled={toggle.isPending}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-secondary/60"
              aria-label={done ? "Marcar como pendente" : "Marcar como concluído"}
            >
              {done ? (
                <CheckCircle2 className="h-5 w-5 text-primary" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>
            <span className={done ? "text-muted-foreground line-through" : ""}>{m.title}</span>
          </li>
        );
      })}
    </ul>
  );
}