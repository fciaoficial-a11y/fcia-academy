import { createFileRoute, notFound } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { QUIZ_BANK } from "@/lib/mock-data";
import { Brain } from "lucide-react";

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
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-accent">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Brain className="h-5 w-5" /></span>
          <p className="text-sm text-muted-foreground">Você pode refazer o quiz quantas vezes precisar. A maior nota é registrada.</p>
        </div>
      </section>

      <ol className="space-y-4">
        {quiz.questions.map((q, i) => (
          <li key={q.id} className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold text-foreground"><span className="text-primary">{i + 1}.</span> {q.prompt}</p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-3 rounded-xl border border-border/40 bg-background/40 p-3 text-sm text-foreground transition-colors hover:bg-secondary/40">
                  <input type="radio" name={q.id} className="h-4 w-4 accent-[oklch(var(--primary))]" />
                  {opt}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex justify-end">
        <button className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-medium text-primary-foreground ring-glow">Enviar respostas</button>
      </div>
    </StudentShell>
  );
}
