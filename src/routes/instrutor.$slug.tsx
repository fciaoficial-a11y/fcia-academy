import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { Award, Star, Users, BookOpen, Linkedin, Twitter, Globe } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CourseCard } from "@/components/cards/CourseCard";
import { StudentReviewCard } from "@/components/social/StudentReviewCard";
import { RatingCard } from "@/components/social/RatingCard";
import { INSTRUCTORS, COURSES, STUDENT_REVIEWS } from "@/lib/mock-data";

export const Route = createFileRoute("/instrutor/$slug")({
  head: ({ params }) => {
    const i = INSTRUCTORS.find((x) => x.slug === params.slug);
    return {
      meta: [
        { title: i ? `${i.name} — Instrutor FCIA Academy` : "Instrutor — FCIA Academy" },
        { name: "description", content: i?.bio ?? "Perfil de instrutor." },
      ],
    };
  },
  loader: ({ params }) => {
    const instructor = INSTRUCTORS.find((x) => x.slug === params.slug);
    if (!instructor) throw notFound();
    return { instructor };
  },
  notFoundComponent: () => <AppShell><p className="text-muted-foreground">Instrutor não encontrado.</p></AppShell>,
  errorComponent: ({ error }) => <AppShell><p className="text-destructive">Erro: {error.message}</p></AppShell>,
  component: InstructorPage,
});

function InstructorPage() {
  const { instructor } = Route.useLoaderData();
  const courses = COURSES.filter((c) => c.instructor === instructor.name);
  const reviews = STUDENT_REVIEWS.slice(0, 3);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeader crumbs={[{ label: "Instrutores" }, { label: instructor.name }]} eyebrow="Instrutor" title={instructor.name} description={instructor.role} />

        {/* Hero */}
        <section className="grid gap-6 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-primary to-accent text-3xl font-bold text-primary-foreground ring-glow">
            {instructor.initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-foreground">{instructor.bio}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {instructor.socials.linkedin && (
                <a href="#" className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-xs text-foreground"><Linkedin className="h-3 w-3" /> {instructor.socials.linkedin}</a>
              )}
              {instructor.socials.twitter && (
                <a href="#" className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-xs text-foreground"><Twitter className="h-3 w-3" /> {instructor.socials.twitter}</a>
              )}
              {instructor.socials.site && (
                <a href="#" className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1 text-xs text-foreground"><Globe className="h-3 w-3" /> {instructor.socials.site}</a>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <Stat icon={Users} label="Alunos" value={instructor.students.toLocaleString("pt-BR")} />
            <Stat icon={BookOpen} label="Cursos" value={String(instructor.courses)} />
            <Stat icon={Star} label="Nota" value={instructor.rating.toFixed(1)} />
          </div>
        </section>

        {/* Cursos */}
        <section className="space-y-4">
          <h2 className="font-display text-xl font-semibold text-foreground">Cursos de {instructor.name.split(" ")[0]}</h2>
          {courses.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
              Em breve novos cursos. Veja o <Link to="/catalogo" className="text-primary hover:underline">catálogo completo</Link>.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((c) => <CourseCard key={c.slug} course={c} />)}
            </div>
          )}
        </section>

        {/* Avaliações & Certificações */}
        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-foreground">Avaliações dos alunos</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {reviews.map((r) => <StudentReviewCard key={r.id} r={r} />)}
            </div>
          </div>
          <div className="space-y-4">
            <RatingCard rating={instructor.rating} totalReviews={instructor.reviews} />
            <div className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
                <Award className="h-4 w-4 text-primary" /> Certificações
              </h3>
              <ul className="mt-3 space-y-2 text-sm">
                {instructor.certifications.map((c: string) => (
                  <li key={c} className="rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-foreground">{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </section>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3 text-center">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 font-display text-lg font-semibold text-foreground">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}