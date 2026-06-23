import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Award, Loader2 } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { myEnrollmentsQO, type EnrollmentWithCourse } from "@/lib/learning";
import { listMyAttempts, getMyCertificate } from "@/lib/ai-study.functions";

export const Route = createFileRoute("/meus-cursos")({
  head: () => ({
    meta: [
      { title: "Meus cursos — FCIA Academy" },
      { name: "description", content: "Cursos em que você está matriculado." },
    ],
  }),
  component: MyCourses,
});

function MyCourses() {
  const { user, loading } = useAuth();
  const q = useQuery(myEnrollmentsQO(user?.id));

  if (loading) {
    return (
      <StudentShell>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </div>
      </StudentShell>
    );
  }

  if (!user) {
    return (
      <StudentShell>
        <PageHeader eyebrow="Aprendizado" title="Meus cursos" />
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">Entre para ver seus cursos.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Fazer login</Link>
          </Button>
        </div>
      </StudentShell>
    );
  }

  const enrollments = q.data ?? [];

  return (
    <StudentShell>
      <PageHeader
        eyebrow="Aprendizado"
        title="Meus cursos"
        description={`${enrollments.length} matrícula(s)`}
      />
      {q.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando matrículas…
        </div>
      ) : q.error ? (
        <p className="text-sm text-destructive">Erro: {(q.error as Error).message}</p>
      ) : enrollments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">Você ainda não está matriculado em nenhum curso.</p>
          <Button asChild className="mt-4">
            <Link to="/catalogo">Explorar catálogo</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((e) => (
            <li key={e.id}>
              <EnrollmentCard enrollment={e} />
            </li>
          ))}
        </ul>
      )}
    </StudentShell>
  );
}

function EnrollmentCard({ enrollment }: { enrollment: EnrollmentWithCourse }) {
  const { course, progress, completedUnits, totalUnits, unitLabel } = enrollment;
  const listAttempts = useServerFn(listMyAttempts);
  const getCert = useServerFn(getMyCertificate);
  const attempts = useQuery({
    queryKey: ["attempts", course.id],
    queryFn: () => listAttempts({ data: { courseId: course.id } }),
  });
  const cert = useQuery({
    queryKey: ["cert", course.id],
    queryFn: () => getCert({ data: { courseId: course.id } }),
  });
  const passed = ((attempts.data ?? []) as Array<{ passed: boolean }>).some((a) => a.passed);
  const certData = cert.data as { code: string } | null;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-base font-semibold text-foreground">{course.title}</h3>
        {passed && (
          <Badge variant="secondary" className="gap-1">
            <Award className="h-3 w-3" /> Aprovado
          </Badge>
        )}
      </div>
      {course.description && (
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
      )}
      <div className="mt-4">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {completedUnits}/{totalUnits} {unitLabel}{totalUnits === 1 ? "" : "s"} · {progress}%
        </p>
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <Button asChild size="sm" className="flex-1">
          <Link to="/curso/$slug" params={{ slug: course.slug }}>
            {progress === 0 ? "Começar" : "Continuar"}
          </Link>
        </Button>
        {certData ? (
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/certificado/$code" params={{ code: certData.code }}>
              Certificado
            </Link>
          </Button>
        ) : progress >= 100 || passed ? (
          <Button asChild size="sm" variant="outline" className="flex-1">
            <Link to="/curso/$slug/prova" params={{ slug: course.slug }}>
              Fazer prova
            </Link>
          </Button>
        ) : null}
      </div>
    </article>
  );
}
