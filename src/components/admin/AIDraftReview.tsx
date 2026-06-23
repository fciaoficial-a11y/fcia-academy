import { CheckCircle2, BookOpen, ListChecks, Award } from "lucide-react";

export interface AiDraftPayload {
  title: string;
  description: string;
  objectives: string[];
  hoursLoad: number;
  modules: { title: string; summary: string; content: string; exercises: string[] }[];
  questionBank: { stem: string; options: string[]; correctIndex: number; explanation: string }[];
  certificateTemplate: { heading: string; body: string; signature: string };
}

export function AIDraftReview({ payload }: { payload: AiDraftPayload }) {
  return (
    <article className="space-y-6 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <header className="space-y-2">
        <span className="eyebrow text-primary">Draft pronto para revisão</span>
        <h2 className="font-display text-2xl font-semibold text-foreground">{payload.title}</h2>
        <p className="text-sm text-muted-foreground">{payload.description}</p>
        <p className="text-xs text-muted-foreground">Carga horária sugerida: {payload.hoursLoad}h</p>
      </header>

      <section>
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" /> Objetivos de aprendizagem
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          {payload.objectives.map((o, i) => (
            <li key={i}>• {o}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <BookOpen className="h-4 w-4 text-primary" /> Módulos ({payload.modules.length})
        </h3>
        <ol className="mt-2 space-y-3">
          {payload.modules.map((m, i) => (
            <li key={i} className="rounded-2xl border border-border/50 bg-background/40 p-4">
              <p className="font-display text-sm font-semibold text-foreground">
                {i + 1}. {m.title}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{m.summary}</p>
              {m.exercises?.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {m.exercises.map((ex, j) => (
                    <li key={j}>· {ex}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <ListChecks className="h-4 w-4 text-primary" /> Banco de questões ({payload.questionBank.length})
        </h3>
        <ul className="mt-2 space-y-2 text-sm">
          {payload.questionBank.slice(0, 5).map((q, i) => (
            <li key={i} className="rounded-xl border border-border/50 bg-background/40 p-3">
              <p className="text-foreground">{i + 1}. {q.stem}</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {q.options.map((o, j) => (
                  <li key={j} className={j === q.correctIndex ? "text-primary" : undefined}>
                    {String.fromCharCode(65 + j)}) {o}
                  </li>
                ))}
              </ul>
            </li>
          ))}
          {payload.questionBank.length > 5 && (
            <li className="text-xs text-muted-foreground">+ {payload.questionBank.length - 5} questões adicionais</li>
          )}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/50 bg-background/40 p-4">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <Award className="h-4 w-4 text-primary" /> Certificado
        </h3>
        <p className="mt-2 text-sm font-medium text-foreground">{payload.certificateTemplate.heading}</p>
        <p className="mt-1 text-xs text-muted-foreground">{payload.certificateTemplate.body}</p>
        <p className="mt-2 text-xs text-muted-foreground">— {payload.certificateTemplate.signature}</p>
      </section>
    </article>
  );
}