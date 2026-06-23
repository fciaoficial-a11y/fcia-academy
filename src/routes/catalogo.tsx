import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  coursesQO,
  myEnrollmentsQO,
  enrollInCourse,
  enrollmentsKey,
  type CourseRow,
} from "@/lib/learning";

export const Route = createFileRoute("/catalogo")({
  head: () => ({
    meta: [
      { title: "Catálogo — FCIA Academy" },
      { name: "description", content: "Cursos publicados disponíveis para matrícula." },
    ],
  }),
  component: CatalogPage,
});

function CatalogPage() {
  const [search, setSearch] = useState("");
  const courses = useQuery(coursesQO());
  const { user } = useAuth();
  const enrollments = useQuery(myEnrollmentsQO(user?.id));
  const enrolledIds = useMemo(
    () => new Set((enrollments.data ?? []).map((e) => e.course_id)),
    [enrollments.data],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const all = courses.data ?? [];
    if (!q) return all;
    return all.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        (c.description ?? "").toLowerCase().includes(q),
    );
  }, [courses.data, search]);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Catálogo"
          title="Cursos publicados"
          description={`${courses.data?.length ?? 0} cursos disponíveis`}
          actions={
            <SearchInput
              placeholder="Buscar curso…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        />

        {courses.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Carregando cursos…
          </div>
        ) : courses.error ? (
          <p className="text-sm text-destructive">Erro: {(courses.error as Error).message}</p>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => (
              <li key={c.id}>
                <CatalogCard course={c} enrolled={enrolledIds.has(c.id)} userId={user?.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        Nenhum curso publicado ainda. Em breve novos conteúdos.
      </p>
    </div>
  );
}

function CatalogCard({
  course,
  enrolled,
  userId,
}: {
  course: CourseRow;
  enrolled: boolean;
  userId: string | undefined;
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const enrollM = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error("auth");
      return enrollInCourse(course.id, userId);
    },
    onSuccess: () => {
      toast.success("Matrícula realizada");
      qc.invalidateQueries({ queryKey: enrollmentsKey(userId ?? "anon") });
      navigate({ to: "/curso/$slug", params: { slug: course.slug } });
    },
    onError: (e: Error) => toast.error(e.message || "Falha ao matricular"),
  });

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
          Curso
        </Badge>
        {enrolled && (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary">
            <CheckCircle2 className="h-3 w-3" /> Matriculado
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-foreground">{course.title}</h3>
      {course.description && (
        <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{course.description}</p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {course.hours_load != null && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {course.hours_load}h
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <BookOpen className="h-3 w-3" /> Módulos
        </span>
      </div>
      <div className="mt-auto flex gap-2 pt-4">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/curso/$slug" params={{ slug: course.slug }}>
            Ver curso
          </Link>
        </Button>
        {enrolled ? (
          <Button asChild size="sm" className="flex-1">
            <Link to="/curso/$slug" params={{ slug: course.slug }}>
              Continuar
            </Link>
          </Button>
        ) : !userId ? (
          <Button asChild size="sm" className="flex-1">
            <Link to="/login">Entrar para matricular</Link>
          </Button>
        ) : (
          <Button
            size="sm"
            className="flex-1"
            disabled={enrollM.isPending}
            onClick={() => enrollM.mutate()}
          >
            {enrollM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Matricular"}
          </Button>
        )}
      </div>
    </article>
  );
}
