import { Link } from "@tanstack/react-router";
import { Clock, BookOpen, Star } from "lucide-react";
import type { Course } from "@/lib/mock-data";

export function CourseCard({ course }: { course: Course }) {
  const Icon = course.icon;
  return (
    <Link
      to="/curso/$slug"
      params={{ slug: course.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-transform hover:-translate-y-0.5"
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full bg-secondary/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{course.level}</span>
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-foreground">{course.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{course.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{course.hours}h</span>
        <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules} módulos</span>
        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-primary" />{course.rating}</span>
      </div>
      {course.progress > 0 && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${course.progress}%` }} />
          </div>
          <span className="mt-1 block text-[10px] text-muted-foreground">{course.progress}% concluído</span>
        </div>
      )}
    </Link>
  );
}
