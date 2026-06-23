import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { z } from "zod";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchInput } from "@/components/shared/SearchInput";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle2, Clock, Compass, ShoppingBag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { coursesQO, myEnrollmentsQO, type CourseRow, type EnrollmentWithCourse } from "@/lib/learning";

type Track = { id: string; slug: string; title: string; description: string | null; hours_load: number | null };

const tracksQO = () =>
  queryOptions({
    queryKey: ["vitrine", "tracks"] as const,
    queryFn: async (): Promise<Track[]> => {
      const { data, error } = await supabase
        .from("tracks")
        .select("id, slug, title, description, hours_load")
        .order("title", { ascending: true });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    staleTime: 60_000,
  });

const searchSchema = z.object({
  q: z.string().optional().catch(""),
  tab: z.enum(["cursos", "trilhas"]).optional().catch("cursos"),
});

export const Route = createFileRoute("/vitrine")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Vitrine — FCIA Academy" },
      { name: "description", content: "Cursos e trilhas publicados na FCIA Academy. Matricule-se em poucos cliques." },
      { property: "og:title", content: "Vitrine FCIA Academy" },
      { property: "og:description", content: "Conheça cursos e trilhas premium da FCIA Academy." },
    ],
  }),
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(coursesQO());
    void context.queryClient.ensureQueryData(tracksQO());
  },
  errorComponent: ({ error }) => (
    <AppShell><p className="p-6 text-sm text-destructive">Erro: {error.message}</p></AppShell>
  ),
  component: VitrinePage,
});

function VitrinePage() {
  const { q = "", tab = "cursos" } = Route.useSearch();
  const navigate = useNavigate();
  const courses = useSuspenseQuery(coursesQO());
  const tracks = useSuspenseQuery(tracksQO());
  const { user } = useAuth();
  const enrollments = useQuery(myEnrollmentsQO(user?.id));
  const enrollmentByCourse = useMemo(() => {
    const m = new Map<string, EnrollmentWithCourse>();
    (enrollments.data ?? []).forEach((e) => m.set(e.course_id, e));
    return m;
  }, [enrollments.data]);
  const [search, setSearch] = useState(q);

  const filteredCourses = useMemo(() => {
    const s = search.trim().toLowerCase();
    const all = courses.data ?? [];
    if (!s) return all;
    return all.filter((c) => c.title.toLowerCase().includes(s) || (c.description ?? "").toLowerCase().includes(s));
  }, [courses.data, search]);

  const filteredTracks = useMemo(() => {
    const s = search.trim().toLowerCase();
    const all = tracks.data ?? [];
    if (!s) return all;
    return all.filter((t) => t.title.toLowerCase().includes(s) || (t.description ?? "").toLowerCase().includes(s));
  }, [tracks.data, search]);

  const setTab = (nextTab: "cursos" | "trilhas") =>
    navigate({ to: "/vitrine", search: { q: search || undefined, tab: nextTab } });

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Vitrine pública"
          title="Cursos e trilhas FCIA"
          description="Comece em minutos. Conteúdo premium, certificação ao final."
          actions={
            <SearchInput
              placeholder="Buscar…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          }
        />

        <div className="inline-flex gap-1 rounded-full border border-border/60 bg-card/40 p-1">
          <TabButton active={tab === "cursos"} onClick={() => setTab("cursos")} icon={<BookOpen className="h-3.5 w-3.5" />}>
            Cursos ({courses.data.length})
          </TabButton>
          <TabButton active={tab === "trilhas"} onClick={() => setTab("trilhas")} icon={<Compass className="h-3.5 w-3.5" />}>
            Trilhas ({tracks.data.length})
          </TabButton>
        </div>

        {tab === "cursos" ? (
          filteredCourses.length === 0 ? (
            <EmptyState label="Nenhum curso publicado ainda." />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((c) => (
                <li key={c.id}>
                  <CourseCard
                    course={c}
                    enrollment={enrollmentByCourse.get(c.id) ?? null}
                    userId={user?.id}
                  />
                </li>
              ))}
            </ul>
          )
        ) : filteredTracks.length === 0 ? (
          <EmptyState label="Nenhuma trilha publicada ainda." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTracks.map((t) => (
              <li key={t.id}>
                <TrackCard track={t} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active ? "bg-gradient-to-r from-primary to-accent text-primary-foreground ring-glow" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function formatPrice(cents: number | undefined, currency: string | undefined) {
  if (!cents) return null;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(cents / 100);
}

function CourseCard({
  course,
  enrollment,
  userId,
}: {
  course: CourseRow;
  enrollment: EnrollmentWithCourse | null;
  userId: string | undefined;
}) {
  const isActive = enrollment?.accessStatus === "active";
  const isPending = enrollment?.accessStatus === "pending";
  const price = formatPrice(course.price_cents, course.currency);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Curso</Badge>
        {isActive && (
          <span className="inline-flex items-center gap-1 text-[10px] text-primary">
            <CheckCircle2 className="h-3 w-3" /> Matriculado
          </span>
        )}
        {isPending && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-500">
            Aguardando pagamento
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-foreground">{course.title}</h3>
      {course.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{course.description}</p>}
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {course.hours_load != null && (
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {course.hours_load}h</span>
        )}
        <span className="inline-flex items-center gap-1"><BookOpen className="h-3 w-3" /> Módulos</span>
      </div>
      {price && <p className="mt-3 font-mono text-lg font-semibold text-foreground">{price}</p>}
      <div className="mt-auto flex gap-2 pt-4">
        <Button asChild variant="outline" size="sm" className="flex-1">
          <Link to="/curso/$slug" params={{ slug: course.slug }}>Ver curso</Link>
        </Button>
        {isActive ? (
          <Button asChild size="sm" className="flex-1">
            <Link to="/curso/$slug" params={{ slug: course.slug }}>Acessar</Link>
          </Button>
        ) : isPending ? (
          <Button asChild size="sm" className="flex-1">
            <Link to="/checkout/$courseId" params={{ courseId: course.id }}>Concluir pagamento</Link>
          </Button>
        ) : !userId ? (
          <Button asChild size="sm" className="flex-1">
            <Link to="/cadastro" search={{ next: `/checkout/${course.id}` }}>
              <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Matricular
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="flex-1">
            <Link to="/checkout/$courseId" params={{ courseId: course.id }}>
              <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Matricular
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

function TrackCard({ track }: { track: Track }) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider">Trilha</Badge>
      <h3 className="mt-3 font-display text-base font-semibold text-foreground">{track.title}</h3>
      {track.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{track.description}</p>}
      {track.hours_load != null && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> {track.hours_load}h totais
        </p>
      )}
      <div className="mt-auto pt-4">
        <Button asChild size="sm" className="w-full">
          <Link to="/trilha/$slug" params={{ slug: track.slug }}>Explorar trilha</Link>
        </Button>
      </div>
    </article>
  );
}
