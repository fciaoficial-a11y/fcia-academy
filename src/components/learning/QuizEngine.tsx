import { useMemo, useState } from "react";
import { Brain, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import type { Quiz, QuizQuestion } from "@/lib/mock-data";

type QuizState = "idle" | "in-progress" | "approved" | "failed";

interface QuizEngineProps {
  quiz: Quiz;
}

export function QuizEngine({ quiz }: QuizEngineProps) {
  const [state, setState] = useState<QuizState>("idle");
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const result = useMemo(() => {
    const correct = quiz.questions.filter((q) => answers[q.id] === q.correctIndex).length;
    const total = quiz.questions.length;
    const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
    return { correct, total, pct, wrong: total - correct };
  }, [answers, quiz.questions]);

  const submit = () => setState(result.pct >= quiz.passingScore ? "approved" : "failed");
  const reset = () => {
    setAnswers({});
    setState("in-progress");
  };

  if (state === "idle") {
    return (
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-accent">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Brain className="h-6 w-6" /></span>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">Pronto para o quiz?</h3>
            <p className="text-sm text-muted-foreground">{quiz.questions.length} questões · nota mínima {quiz.passingScore}% · refaça quantas vezes precisar.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setState("in-progress")}
          className="mt-5 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-medium text-primary-foreground ring-glow"
        >
          Iniciar quiz
        </button>
      </section>
    );
  }

  if (state === "approved" || state === "failed") {
    const ok = state === "approved";
    return (
      <section className={`relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl ${ok ? "border-primary/40 bg-card/60 glow-primary" : "border-destructive/40 bg-card/60"}`}>
        <div className="flex items-start gap-3">
          <span className={`grid h-12 w-12 place-items-center rounded-xl ${ok ? "bg-gradient-to-br from-primary to-accent text-primary-foreground" : "bg-destructive/15 text-destructive"}`}>
            {ok ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-xl font-semibold text-foreground">{ok ? "Aprovado!" : "Quase lá"}</h3>
            <p className="text-sm text-muted-foreground">
              {result.correct} acertos · {result.wrong} erros · {result.pct}% — mínimo {quiz.passingScore}%
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ResultStat label="Acertos" value={result.correct} accent />
          <ResultStat label="Erros" value={result.wrong} />
          <ResultStat label="Percentual" value={`${result.pct}%`} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary">
            <RotateCcw className="h-4 w-4" /> Refazer quiz
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        {quiz.questions.map((q: QuizQuestion, i: number) => (
          <li key={q.id} className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold text-foreground">
              <span className="text-primary">{i + 1}.</span> {q.prompt}
            </p>
            <div className="mt-3 grid gap-2">
              {q.options.map((opt: string, oi: number) => {
                const selected = answers[q.id] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition-colors ${selected ? "border-primary/60 bg-primary/10 text-foreground" : "border-border/40 bg-background/40 text-foreground hover:bg-secondary/40"}`}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={selected}
                      onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                      className="h-4 w-4 accent-[oklch(var(--primary))]"
                    />
                    {opt}
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {Object.keys(answers).length} de {quiz.questions.length} respondidas
        </span>
        <button
          type="button"
          onClick={submit}
          disabled={Object.keys(answers).length < quiz.questions.length}
          className="rounded-full bg-gradient-to-r from-primary to-accent px-6 py-2.5 text-sm font-medium text-primary-foreground ring-glow disabled:opacity-50"
        >
          Enviar respostas
        </button>
      </div>
    </div>
  );
}

function ResultStat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3 text-center">
      <p className={`font-display text-xl font-semibold ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}