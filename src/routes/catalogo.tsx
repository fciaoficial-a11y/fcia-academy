import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { FilterChips } from "@/components/shared/FilterChips";
import { CourseCard } from "@/components/cards/CourseCard";
import { TrackCard } from "@/components/cards/TrackCard";
import { COURSES, TRACKS, CATEGORIES, LEVELS, TAGS } from "@/lib/mock-data";
import { coursesQuery, normalize } from "@/lib/supabase-queries";
import { DataState, RealDataSection } from "@/components/data/DataState";

export const Route = createFileRoute("/catalogo")({
  head: () => ({ meta: [{ title: "Catálogo — FCIA Academy" }, { name: "description", content: "Explore todas as trilhas e cursos da FCIA Academy." }] }),
  component: CatalogPage,
});

function CatalogPage() {
  const q = useQuery(coursesQuery());
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Catálogo" title="Explore trilhas e cursos" description="Filtre por categoria, nível ou tag." actions={<SearchInput placeholder="O que quer aprender hoje?" />} />
        <RealDataSection title="Cursos do banco" source={`courses · ${q.data?.count ?? 0} linhas`}>
          <DataState
            loading={q.isLoading}
            error={q.error as Error | null}
            data={q.data?.rows}
            configured={q.data?.configured ?? true}
            emptyTitle="Tabela courses está vazia"
            emptyHint="Conteúdo curado abaixo permanece como fallback."
          >
            {(data) => (
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {data.map((r, i) => {
                  const n = normalize(r, String(i));
                  return (
                    <li key={n.id} className="rounded-2xl border border-border/60 bg-card/60 p-4">
                      <p className="font-display text-sm font-semibold text-foreground">{n.title}</p>
                      {n.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{n.description}</p>}
                      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">{n.level ?? "—"}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </DataState>
        </RealDataSection>
        <div className="space-y-3">
          <FilterChips label="Categoria" options={["Todas", ...CATEGORIES]} active="Todas" />
          <FilterChips label="Nível" options={["Todos", ...LEVELS]} active="Todos" />
          <FilterChips label="Tags" options={TAGS.slice(0, 8)} />
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-foreground">Trilhas em destaque</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TRACKS.map((t) => <TrackCard key={t.slug} track={t} />)}
          </div>
        </div>
        <div>
          <h2 className="mb-4 font-display text-xl font-semibold text-foreground">Todos os cursos</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {COURSES.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
