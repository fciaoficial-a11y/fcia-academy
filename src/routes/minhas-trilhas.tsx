import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { TrackCard } from "@/components/cards/TrackCard";
import { TRACKS } from "@/lib/mock-data";

export const Route = createFileRoute("/minhas-trilhas")({
  head: () => ({ meta: [{ title: "Minhas trilhas — FCIA Academy" }, { name: "description", content: "Trilhas que você está cursando." }] }),
  component: MyTracks,
});

function MyTracks() {
  const mine = TRACKS.filter((t) => t.progress > 0);
  return (
    <StudentShell>
      <PageHeader eyebrow="Trilhas" title="Minhas trilhas" description={`${mine.length} trilhas em andamento`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mine.map((t) => <TrackCard key={t.slug} track={t} />)}
      </div>
    </StudentShell>
  );
}
