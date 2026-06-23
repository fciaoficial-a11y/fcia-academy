import { Link } from "@tanstack/react-router";
import { Layers, Clock } from "lucide-react";
import type { Track } from "@/lib/mock-data";

export function TrackCard({ track }: { track: Track }) {
  const Icon = track.icon;
  return (
    <Link
      to="/trilha/$slug"
      params={{ slug: track.slug }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-transform hover:-translate-y-0.5"
    >
      <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${track.color} opacity-15 blur-3xl`} />
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <span className="eyebrow text-muted-foreground">{track.category}</span>
          <h3 className="truncate font-display text-lg font-semibold text-foreground">{track.title}</h3>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{track.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Layers className="h-3 w-3" />{track.courses} cursos</span>
        <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{track.hours}h</span>
        <span>{track.level}</span>
      </div>
      {track.progress > 0 && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${track.progress}%` }} />
          </div>
          <span className="mt-1 block text-[10px] text-muted-foreground">{track.progress}% concluído</span>
        </div>
      )}
    </Link>
  );
}
