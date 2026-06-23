import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Award, BookOpen, CheckCircle2, ChevronDown, Clock, Compass,
  Layers, ShieldCheck, ShoppingBag, Sparkles, Target, Zap,
} from "lucide-react";
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

export const Route = createFileRoute("/vitrine")({
  head: () => ({
    meta: [
      { title: "Vitrine FCIA Academy — Cursos e Trilhas Premium" },
      { name: "description", content: "Aprenda com cursos e trilhas premium da FCIA Academy. Certificados validáveis, mentoria e fluxo de matrícula em minutos." },
      { property: "og:title", content: "Vitrine FCIA Academy" },
      { property: "og:description", content: "Cursos e trilhas publicados, prontos para te levar ao próximo nível." },
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
  const courses = useSuspenseQuery(coursesQO());
  const tracks = useSuspenseQuery(tracksQO());
  const { user } = useAuth();
  const enrollments = useQuery(myEnrollmentsQO(user?.id));
  const enrollmentByCourse = useMemo(() => {
    const m = new Map<string, EnrollmentWithCourse>();
    (enrollments.data ?? []).forEach((e) => m.set(e.course_id, e));
    return m;
  }, [enrollments.data]);
  const allCourses = courses.data ?? [];
  const allTracks = tracks.data ?? [];
  const featured = allCourses.slice(0, 3);

  return (
    <AppShell>
      {/* HERO */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 lg:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> Vitrine oficial · cursos e trilhas premium
        </span>
        <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Domine novas habilidades com a <span className="text-gradient">FCIA Academy</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Conteúdo denso, trilhas curadas e certificação validável. Comece em minutos — pague via PIX e libere o acesso na hora.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a href="#cursos" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
            Ver cursos <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#trilhas" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary/60">
            Explorar trilhas
          </a>
        </div>
      </section>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <header className="mb-6 flex items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-[0.18em] text-primary">Em destaque</span>
              <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">Comece por aqui</h2>
            </div>
          </header>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} enrollment={enrollmentByCourse.get(c.id) ?? null} userId={user?.id} highlight />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* CURSOS */}
      <section id="cursos" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-primary">Cursos publicados</span>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">Catálogo de cursos</h2>
          </div>
          <span className="text-xs text-muted-foreground">{allCourses.length} {allCourses.length === 1 ? "curso" : "cursos"}</span>
        </header>
        {allCourses.length === 0 ? (
          <EmptyState icon={<BookOpen className="h-5 w-5" />} label="Nenhum curso publicado ainda." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allCourses.map((c) => (
              <li key={c.id}>
                <CourseCard course={c} enrollment={enrollmentByCourse.get(c.id) ?? null} userId={user?.id} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* TRILHAS */}
      <section id="trilhas" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.18em] text-primary">Trilhas guiadas</span>
            <h2 className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">Aprenda em sequência</h2>
          </div>
          <span className="text-xs text-muted-foreground">{allTracks.length} {allTracks.length === 1 ? "trilha" : "trilhas"}</span>
        </header>
        {allTracks.length === 0 ? (
          <EmptyState icon={<Compass className="h-5 w-5" />} label="Nenhuma trilha publicada ainda." />
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allTracks.map((t) => (
              <li key={t.id}><TrackCard track={t} /></li>
            ))}
          </ul>
        )}
      </section>

      {/* EBOOKS — placeholder futuro */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start gap-3 rounded-3xl border border-dashed border-border/60 bg-card/40 p-6 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 text-primary">
              <Layers className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-base font-semibold text-foreground">Ebooks chegando em breve</p>
              <p className="text-xs text-muted-foreground">Materiais densos e diretos para complementar suas trilhas.</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Em breve</Badge>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.18em] text-primary">Por que FCIA</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Uma plataforma feita para você evoluir</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Target, title: "Trilhas guiadas", desc: "Sequências curatoriais do básico ao avançado." },
            { icon: Zap, title: "Liberação imediata", desc: "Pague via PIX e acesse o conteúdo na hora." },
            { icon: Award, title: "Certificado validável", desc: "Código público de validação e selo digital." },
            { icon: ShieldCheck, title: "Garantia de 7 dias", desc: "Não gostou? Devolvemos 100% do valor." },
            { icon: BookOpen, title: "Catálogo vivo", desc: "Novos cursos sendo publicados constantemente." },
            { icon: Sparkles, title: "AI Studio", desc: "Resumos, quizzes e estudo assistido por IA." },
          ].map(({ icon: Icon, title, desc }) => (
            <article key={title} className="rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <header className="mb-8 text-center">
          <span className="text-xs uppercase tracking-[0.18em] text-primary">FAQ</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Perguntas frequentes</h2>
        </header>
        <div className="space-y-2">
          {[
            { q: "Como funciona o pagamento?", a: "Via PIX. A confirmação é automática e o acesso é liberado em segundos após a aprovação." },
            { q: "Por quanto tempo tenho acesso?", a: "O acesso ao curso comprado é vitalício enquanto a plataforma estiver no ar." },
            { q: "Recebo certificado?", a: "Sim. Ao concluir o curso, emitimos um certificado com código público de validação." },
            { q: "Posso cancelar?", a: "Sim. Você tem 7 dias de garantia incondicional para solicitar reembolso integral." },
          ].map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium text-foreground">
                {f.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

    </AppShell>
  );
}

function EmptyState({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
      {icon && <span className="grid h-10 w-10 place-items-center rounded-xl bg-card/60 text-muted-foreground">{icon}</span>}
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
  highlight = false,
}: {
  course: CourseRow;
  enrollment: EnrollmentWithCourse | null;
  userId: string | undefined;
  highlight?: boolean;
}) {
  const isActive = enrollment?.accessStatus === "active";
  const isPending = enrollment?.accessStatus === "pending";
  const price = formatPrice(course.price_cents, course.currency);

  return (
    <article className={`flex h-full flex-col rounded-2xl border p-5 backdrop-blur-xl transition-transform hover:-translate-y-0.5 ${
      highlight ? "border-primary/40 bg-card/80 ring-glow" : "border-border/60 bg-card/60"
    }`}>
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
            <Link to="/curso/$slug" params={{ slug: course.slug }}>Acessar curso</Link>
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
