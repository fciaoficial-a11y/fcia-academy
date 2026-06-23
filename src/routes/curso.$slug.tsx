import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { CheckCircle2, Circle, Clock, Loader2, BookOpen, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  courseBySlugQO,
  courseLessonProgressQO,
  courseKey,
  enrollInCourse,
  enrollmentsKey,
  lessonProgressKey,
  myEnrollmentsQO,
  setLastLesson,
  toggleLessonCompletion,
  type ModuleWithLessons,
} from "@/lib/learning";

export const Route = createFileRoute("/curso/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Curso ${params.slug} — FCIA Academy` },
      { name: "description", content: "Detalhe do curso e módulos." },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(courseBySlugQO(params.slug));
    if (!data) throw notFound();
  },
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
  const data = useSuspenseQuery(courseBySlugQO(slug));
  const enrollments = useQuery(myEnrollmentsQO(user?.id));

  if (!data.data) throw notFound();

  const { course, modules } = data.data;
  const isEnrolled = (enrollments.data ?? []).some((e) => e.course_id === course.id);
  const allLessonIds = useMemo(
    () => modules.flatMap((m) => m.lessons.map((l) => l.id)),
    [modules],
  );

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
          <BookOpen className="h-3 w-3" /> {modules.length} módulos · {allLessonIds.length} aulas
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
          Conteúdo
        </h2>
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este curso ainda não tem módulos.</p>
        ) : isEnrolled && user ? (
          <ModulePlayer
            courseId={course.id}
            slug={slug}
            modules={modules}
            userId={user.id}
            lessonIds={allLessonIds}
          />
        ) : (
          <ul className="divide-y divide-border/60 rounded-xl border border-border/60 bg-card/40">
            {modules.map((m) => (
              <li key={m.id} className="px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{m.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {m.lessons.length} aula{m.lessons.length === 1 ? "" : "s"}
                  </span>
                </div>
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

function ModulePlayer({
  courseId,
  slug,
  modules,
  userId,
  lessonIds,
}: {
  courseId: string;
  slug: string;
  modules: ModuleWithLessons[];
  userId: string;
  lessonIds: string[];
}) {
  const qc = useQueryClient();
  const progress = useQuery(courseLessonProgressQO(userId, courseId, lessonIds));
  const enrollments = useQuery(myEnrollmentsQO(userId));
  const completed = useMemo(() => progress.data ?? new Set<string>(), [progress.data]);

  const enrollment = (enrollments.data ?? []).find((e) => e.course_id === courseId);
  const lastLessonId = enrollment?.lastLessonId ?? null;

  const toggle = useMutation({
    mutationFn: (m: { lessonId: string; done: boolean }) =>
      toggleLessonCompletion(m.lessonId, userId, m.done),
    onMutate: () => undefined,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: lessonProgressKey(userId, courseId) });
      qc.invalidateQueries({ queryKey: enrollmentsKey(userId) });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setLast = useMutation({
    mutationFn: (lessonId: string) => setLastLesson(courseId, lessonId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: enrollmentsKey(userId) });
      qc.invalidateQueries({ queryKey: courseKey(slug) });
    },
  });

  const total = lessonIds.length;
  const done = lessonIds.filter((id) => completed.has(id)).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  // próxima aula = primeira não concluída em ordem (módulo, depois aula)
  const nextLessonId = useMemo(() => {
    for (const m of modules) {
      for (const l of m.lessons) {
        if (!completed.has(l.id)) return l.id;
      }
    }
    return null;
  }, [modules, completed]);
  const resumeId = lastLessonId ?? nextLessonId;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card/40 p-4">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>
            {done}/{total} aulas · {pct}%
          </span>
          {resumeId && (
            <a
              href={`#lesson-${resumeId}`}
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              {lastLessonId ? "Continuar de onde parou" : "Começar"}
            </a>
          )}
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="space-y-4">
        {modules.map((m, mi) => {
          const moduleDone =
            m.lessons.length > 0 && m.lessons.every((l) => completed.has(l.id));
          return (
            <li
              key={m.id}
              className="rounded-xl border border-border/60 bg-card/40 overflow-hidden"
            >
              <header className="flex items-center gap-3 border-b border-border/60 bg-card/60 px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {String(mi + 1).padStart(2, "0")}
                </span>
                <h3 className="text-sm font-semibold text-foreground">{m.title}</h3>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {moduleDone ? "Concluído" : `${m.lessons.length} aula${m.lessons.length === 1 ? "" : "s"}`}
                </span>
              </header>
              {m.lessons.length === 0 ? (
                <p className="px-4 py-3 text-xs text-muted-foreground">
                  Sem aulas neste módulo.
                </p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {m.lessons.map((l) => {
                    const isDone = completed.has(l.id);
                    const isCurrent = l.id === resumeId;
                    return (
                      <li
                        key={l.id}
                        id={`lesson-${l.id}`}
                        className={
                          "flex items-start gap-3 px-4 py-3 text-sm " +
                          (isCurrent ? "bg-primary/5" : "")
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggle.mutate(
                              { lessonId: l.id, done: isDone },
                              {
                                onSuccess: () => {
                                  if (!isDone) setLast.mutate(l.id);
                                },
                              },
                            )
                          }
                          disabled={toggle.isPending}
                          className="mt-0.5 grid h-6 w-6 place-items-center rounded-full hover:bg-secondary/60"
                          aria-label={isDone ? "Marcar como pendente" : "Marcar como concluído"}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={
                              "font-medium " +
                              (isDone ? "text-muted-foreground line-through" : "text-foreground")
                            }
                          >
                            {l.title}
                          </p>
                          {l.content && (
                            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-xs text-muted-foreground">
                              {l.content}
                            </p>
                          )}
                        </div>
                        {isCurrent && !isDone && (
                          <span className="ml-2 mt-1 inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            atual
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}