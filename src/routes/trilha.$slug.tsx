import { createFileRoute, notFound } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseCard } from "@/components/cards/CourseCard";
import { TRACKS, COURSES } from "@/lib/mock-data";
import { Clock, Layers } from "lucide-react";

export const Route = createFileRoute("/trilha/$slug")({
  head: ({ params }) => {
    const t = TRACKS.find((x) => x.slug === params.slug);
    return { meta: [
      { title: t ? `${t.title} — Trilha FCIA Academy` : "Trilha — FCIA Academy" },
      { name: "description", content: t?.description ?? "Trilha de aprendizagem." },
    ] };
  },
  loader: ({ params }) => {
    const track = TRACKS.find((x) => x.slug === params.slug);
    if (!track) throw notFound();
    return { track };
  },
  notFoundComponent: () => <StudentShell><p className="text-muted-foreground">Trilha não encontrada.</p></StudentShell>,
  errorComponent: ({ error }) => <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>,
  component: TrackDetail,
});

function TrackDetail() {
  const { track } = Route.useLoaderData();
  const courses = COURSES.filter((c) => c.trackSlug === track.slug);
  const Icon = track.icon;
  return (
    <StudentShell>
      <PageHeader crumbs={[{ label: "Trilhas", to: "/trilhas" }, { label: track.title }]} eyebrow={track.category} title={track.title} description={track.description} />
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-primary">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Icon className="h-7 w-7" /></span>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Layers className="h-3.5 w-3.5" />{track.courses} cursos</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{track.hours}h</span>
            <span>{track.level}</span>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${track.progress}%` }} />
          </div>
          <span className="mt-1 block text-xs text-muted-foreground">{track.progress}% concluído</span>
        </div>
      </section>
      <section className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">Cursos desta trilha</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </section>
    </StudentShell>
  );
}
