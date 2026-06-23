import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Lock, MapPin, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { TrackCard } from "@/components/cards/TrackCard";
import { FilterChips } from "@/components/shared/FilterChips";
import { TRACKS, CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { tracksQuery, normalize } from "@/lib/supabase-queries";
import { DataState, RealDataSection } from "@/components/data/DataState";

export const Route = createFileRoute("/trilhas")({
  head: () => ({ meta: [{ title: "Trilhas — FCIA Academy" }, { name: "description", content: "Trilhas guiadas com progresso e certificação." }] }),
  component: TracksPage,
});

function TracksPage() {
  const q = useQuery(tracksQuery());
  const rows = q.data?.rows;
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Trilhas" title="Aprenda em sequência" description="Caminhos curados por especialistas, do básico ao avançado." />

        <RealDataSection title="Trilhas do banco" source={`tracks · ${q.data?.count ?? 0} linhas`}>
          <DataState
            loading={q.isLoading}
            error={q.error as Error | null}
            data={rows}
            configured={q.data?.configured ?? true}
            emptyTitle="Tabela tracks está vazia"
            emptyHint="Insira registros no Supabase para vê-los aqui. O conteúdo curado abaixo permanece como fallback."
          >
            {(data) => (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.map((r, i) => {
                  const n = normalize(r, String(i));
                  return (
                    <li key={n.id} className="rounded-2xl border border-border/60 bg-card/60 p-4">
                      <p className="font-display text-sm font-semibold text-foreground">{n.title}</p>
                      {n.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.description}</p>}
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {n.level ?? "—"} · {n.category ?? "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </DataState>
        </RealDataSection>

        {/* Roadmap visual */}
        <section className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <header className="mb-6 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <span className="eyebrow text-primary">Seu roadmap</span>
              <h2 className="font-display text-lg font-semibold text-foreground">Progresso visual das trilhas</h2>
            </div>
          </header>

          <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border/60 sm:before:left-[19px]">
            {TRACKS.map((t, i) => {
              const status = t.progress === 100 ? "done" : t.progress > 0 ? "active" : i > 0 && TRACKS[i - 1].progress === 0 ? "locked" : "available";
              return (
                <li key={t.slug} className="relative pl-10 sm:pl-14">
                  <span className={cn(
                    "absolute left-0 top-0 grid h-8 w-8 place-items-center rounded-full ring-4 ring-background sm:h-10 sm:w-10",
                    status === "done" && "bg-gradient-to-br from-primary to-accent text-primary-foreground",
                    status === "active" && "bg-primary/20 text-primary ring-primary/30",
                    status === "available" && "bg-secondary text-foreground",
                    status === "locked" && "bg-secondary/40 text-muted-foreground",
                  )}>
                    {status === "done" ? <CheckCircle2 className="h-4 w-4" /> :
                     status === "locked" ? <Lock className="h-4 w-4" /> :
                     status === "active" ? <Sparkles className="h-4 w-4" /> :
                     <Circle className="h-4 w-4" />}
                  </span>
                  <Link
                    to="/trilha/$slug"
                    params={{ slug: t.slug }}
                    className={cn(
                      "grid gap-2 rounded-2xl border border-border/60 bg-background/40 p-4 backdrop-blur transition-colors hover:bg-secondary/30 sm:grid-cols-[1fr_auto] sm:items-center",
                      status === "locked" && "opacity-60",
                    )}
                  >
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Objetivo: dominar {t.tags.slice(0, 2).join(" + ")}</p>
                      <p className="truncate font-display text-base font-semibold text-foreground">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.courses} cursos · {t.hours}h · {t.level}</p>
                    </div>
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <div className="h-1.5 w-32 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${t.progress}%` }} />
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground">{t.progress}%</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        <FilterChips label="Categoria" options={["Todas", ...CATEGORIES]} active="Todas" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => <TrackCard key={t.slug} track={t} />)}
        </div>
      </section>
    </AppShell>
  );
}
