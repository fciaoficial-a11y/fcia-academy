import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { TrackCard } from "@/components/cards/TrackCard";
import { FilterChips } from "@/components/shared/FilterChips";
import { TRACKS, CATEGORIES } from "@/lib/mock-data";

export const Route = createFileRoute("/trilhas")({
  head: () => ({ meta: [{ title: "Trilhas — FCIA Academy" }, { name: "description", content: "Trilhas guiadas com progresso e certificação." }] }),
  component: TracksPage,
});

function TracksPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Trilhas" title="Aprenda em sequência" description="Caminhos curados por especialistas, do básico ao avançado." />
        <FilterChips label="Categoria" options={["Todas", ...CATEGORIES]} active="Todas" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => <TrackCard key={t.slug} track={t} />)}
        </div>
      </section>
    </AppShell>
  );
}
