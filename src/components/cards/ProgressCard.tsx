import type { Course } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";

export function ProgressCard({ course }: { course: Course }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl sm:flex-row sm:items-center">
      <div className="min-w-0 flex-1">
        <span className="eyebrow text-muted-foreground">Em andamento</span>
        <h3 className="truncate font-display text-base font-semibold text-foreground">{course.title}</h3>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${course.progress}%` }} />
        </div>
        <span className="mt-1 block text-[11px] text-muted-foreground">{course.progress}% · {course.hours}h totais</span>
      </div>
      <Link
        to="/curso/$slug" params={{ slug: course.slug }}
        className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow"
      >
        <Play className="h-3.5 w-3.5" /> Continuar
      </Link>
    </div>
  );
}
