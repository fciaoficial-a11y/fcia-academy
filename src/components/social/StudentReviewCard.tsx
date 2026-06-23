import { Star } from "lucide-react";
import type { StudentReview } from "@/lib/mock-data";

export function StudentReviewCard({ r }: { r: StudentReview }) {
  return (
    <article className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <header className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-xs font-bold text-foreground">
          {r.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.course} · {r.at}</p>
        </div>
        <div className="flex shrink-0 items-center gap-0.5 text-primary">
          {Array.from({ length: r.rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-current" />
          ))}
        </div>
      </header>
      <p className="mt-3 text-sm text-foreground">{r.comment}</p>
    </article>
  );
}