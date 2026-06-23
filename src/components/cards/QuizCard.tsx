import { Link } from "@tanstack/react-router";
import { Brain } from "lucide-react";

export function QuizCard({ id, title, questions, passing }: { id: string; title: string; questions: number; passing: number }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="eyebrow text-primary">Quiz</span>
          <h3 className="truncate font-display text-base font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{questions} questões · nota mínima {passing}%</p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Brain className="h-5 w-5" />
        </span>
      </div>
      <Link to="/quiz/$id" params={{ id }} className="mt-4 inline-flex rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-xs font-medium text-primary-foreground ring-glow">
        Iniciar quiz
      </Link>
    </div>
  );
}
