import { createFileRoute, notFound } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { QuizEngine } from "@/components/learning/QuizEngine";
import { QUIZ_BANK } from "@/lib/mock-data";

export const Route = createFileRoute("/quiz/$id")({
  head: ({ params }) => {
    const q = QUIZ_BANK[params.id];
    return { meta: [
      { title: q ? `Quiz: ${q.moduleTitle} — FCIA Academy` : "Quiz — FCIA Academy" },
      { name: "description", content: "Quiz avaliativo com nota mínima de aprovação." },
    ] };
  },
  loader: ({ params }) => {
    const quiz = QUIZ_BANK[params.id];
    if (!quiz) throw notFound();
    return { quiz };
  },
  notFoundComponent: () => <StudentShell><p className="text-muted-foreground">Quiz não encontrado.</p></StudentShell>,
  errorComponent: ({ error }) => <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>,
  component: QuizPage,
});

function QuizPage() {
  const { quiz } = Route.useLoaderData();
  return (
    <StudentShell>
      <PageHeader crumbs={[{ label: quiz.courseTitle }, { label: "Quiz" }]} eyebrow={quiz.courseTitle} title={`Quiz · ${quiz.moduleTitle}`} description={`${quiz.questions.length} questões · nota mínima ${quiz.passingScore}%`} />
      <QuizEngine quiz={quiz} />
    </StudentShell>
  );
}
