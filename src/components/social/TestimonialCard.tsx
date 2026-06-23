import { Quote, Star } from "lucide-react";
import type { Testimonial } from "@/lib/mock-data";

export function TestimonialCard({ t }: { t: Testimonial }) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
      <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/30" aria-hidden />
      <div className="flex items-center gap-1 text-primary">
        {Array.from({ length: t.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
      <footer className="mt-5 flex items-center gap-3 border-t border-border/40 pt-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
          <p className="truncate text-xs text-muted-foreground">{t.role} · {t.company}</p>
        </div>
      </footer>
    </article>
  );
}