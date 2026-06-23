import { Play, Pause, Volume2, Maximize2, Subtitles, SkipForward, CheckCircle2 } from "lucide-react";
import type { Lesson } from "@/lib/mock-data";

interface CoursePlayerProps {
  lesson: Lesson;
  moduleTitle: string;
  description?: string;
}

export function CoursePlayer({ lesson, moduleTitle, description }: CoursePlayerProps) {
  const status = lesson.completed ? "Concluída" : "Em andamento";
  return (
    <article className="space-y-4">
      <div className="group relative aspect-video overflow-hidden rounded-3xl border border-border/60 bg-card/80 backdrop-blur-xl">
        <div className="absolute inset-0 tech-grid opacity-30" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" aria-hidden />
        <div className="grid h-full w-full place-items-center">
          <button
            type="button"
            aria-label="Reproduzir aula"
            className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow transition-transform hover:scale-105"
          >
            <Play className="h-8 w-8" />
          </button>
        </div>
        <div className="absolute left-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-background/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground backdrop-blur">
          {lesson.completed && <CheckCircle2 className="h-3 w-3 text-primary" />} {status}
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2 bg-gradient-to-t from-background/95 via-background/60 to-transparent p-4">
          <div className="h-1 w-full overflow-hidden rounded-full bg-secondary/60">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary to-accent" />
          </div>
          <div className="flex items-center justify-between text-xs text-foreground">
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Play/Pause"><Pause className="h-4 w-4" /></button>
              <button type="button" aria-label="Próxima"><SkipForward className="h-4 w-4" /></button>
              <button type="button" aria-label="Volume"><Volume2 className="h-4 w-4" /></button>
              <span className="font-mono text-[11px] text-muted-foreground">
                03:42 / {String(lesson.durationMin).padStart(2, "0")}:00
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" aria-label="Legendas"><Subtitles className="h-4 w-4" /></button>
              <button type="button" aria-label="Tela cheia"><Maximize2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </div>

      <header className="space-y-1">
        <span className="eyebrow text-primary">{moduleTitle}</span>
        <h2 className="font-display text-2xl font-semibold text-foreground">{lesson.title}</h2>
        <p className="text-sm text-muted-foreground">
          {description ?? `Aula de ${lesson.type} · ${lesson.durationMin} minutos.`}
        </p>
      </header>
    </article>
  );
}