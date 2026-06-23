import { Link } from "@tanstack/react-router";
import { CheckCircle2, Circle, Lock, Play, FileText, PenSquare } from "lucide-react";
import type { Lesson } from "@/lib/mock-data";

interface LessonCardProps {
  lesson: Lesson;
  locked?: boolean;
}

const TYPE_ICON = {
  video: Play,
  leitura: FileText,
  exercicio: PenSquare,
} as const;

export function LessonCard({ lesson, locked }: LessonCardProps) {
  const TypeIcon = TYPE_ICON[lesson.type];
  const inner = (
    <span className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl transition-colors hover:bg-secondary/40">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary text-foreground">
        {locked ? <Lock className="h-4 w-4" /> : <TypeIcon className="h-4 w-4" />}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-foreground">{lesson.title}</span>
        <span className="block text-xs capitalize text-muted-foreground">{lesson.type} · {lesson.durationMin} min</span>
      </span>
      {lesson.completed ? (
        <CheckCircle2 className="h-5 w-5 text-primary" />
      ) : (
        <Circle className="h-5 w-5 text-muted-foreground" />
      )}
    </span>
  );

  if (locked) return <div aria-disabled className="opacity-60">{inner}</div>;
  return <Link to="/aula/$slug" params={{ slug: lesson.slug }}>{inner}</Link>;
}