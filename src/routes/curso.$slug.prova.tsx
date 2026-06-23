import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExamRunner } from "@/components/learning/ExamRunner";
import { coursesQuery, normalize } from "@/lib/supabase-queries";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/curso/$slug/prova")({
  head: ({ params }) => ({ meta: [{ title: `Prova — ${params.slug} — FCIA Academy` }] }),
  notFoundComponent: () => (
    <StudentShell><p className="text-muted-foreground">Curso não encontrado.</p></StudentShell>
  ),
  errorComponent: ({ error }) => (
    <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>
  ),
  component: ExamPage,
});

function ExamPage() {
  const { slug } = Route.useParams();
  const courses = useQuery(coursesQuery());
  const row = courses.data?.rows.find((r) => normalize(r).slug === slug);
  const course = row ? normalize(row) : null;

  return (
    <StudentShell>
      <PageHeader
        crumbs={[{ label: "Meus cursos", to: "/meus-cursos" }, { label: course?.title ?? slug, to: "/curso/$slug" as any }, { label: "Prova" }]}
        eyebrow="Avaliação"
        title={`Prova · ${course?.title ?? slug}`}
        description="10 questões aleatórias · nota mínima 70%"
      />
      {courses.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando curso…</div>
      ) : !course ? (
        <p className="text-sm text-destructive">Curso não está disponível no banco.</p>
      ) : (
        <ExamRunner courseId={course.id} courseSlug={slug} />
      )}
    </StudentShell>
  );
}