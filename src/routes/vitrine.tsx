import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery, useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight, Award, BookOpen, CheckCircle2, ChevronDown, Clock, Compass,
  Flame, Layers, Rocket, ShieldCheck, ShoppingBag, Sparkles, Star, Target, TrendingUp, Zap,
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
      { title: "Vitrine FCIA Academy — Catálogo Premium de Cursos e Trilhas" },
      { name: "description", content: "Cursos selecionados, trilhas guiadas e certificação validável. Matrícula via PIX em minutos, acesso liberado na hora." },
      { property: "og:title", content: "Vitrine FCIA Academy — Catálogo Premium" },
      { property: "og:description", content: "O catálogo curado para quem quer evoluir rápido. Cursos premium, trilhas guiadas e certificação validável." },
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
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 lg:pt-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
          <Flame className="h-3 w-3" /> Catálogo curado · matrícula liberada via PIX
        </span>
        <h1 className="mt-6 max-w-4xl font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          O catálogo premium que <span className="text-gradient">acelera sua carreira</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Cursos selecionados a dedo, trilhas guiadas do zero ao avançado e certificação validável. Sem enrolação — matrícula em 2 minutos.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a href="#cursos" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg ring-glow transition-transform hover:-translate-y-0.5">
            Matricular agora <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <a href="#trilhas" className="inline-flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Ver trilhas guiadas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Garantia 7 dias</span>
          <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-primary" /> Acesso imediato via PIX</span>
          <span className="inline-flex items-center gap-1.5"><Award className="h-3.5 w-3.5 text-primary" /> Certificado validável</span>
          <span className="inline-flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-primary text-primary" /> +2.400 alunos</span>
        </div>
      </section>

      {/* DESTAQUES */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <header className="mb-8 flex items-end justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Flame className="h-3.5 w-3.5" /> Mais procurados
              </span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Comece pelos campeões</h2>
              <p className="mt-1 text-sm text-muted-foreground">A seleção de quem quer resultado rápido.</p>
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
        <header className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catálogo completo</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Escolha sua próxima conquista</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cada curso é uma decisão — não só um item de catálogo.</p>
          </div>
          <span className="hidden rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground sm:inline-block">
            {allCourses.length} {allCourses.length === 1 ? "curso disponível" : "cursos disponíveis"}
          </span>
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

      {/* TRILHAS — banda de destaque */}
      <section id="trilhas" className="relative mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-card/60 to-accent/15 p-6 backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
          <header className="relative mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                <Compass className="h-3.5 w-3.5" /> Jornadas guiadas
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">
                Não estude solto. <span className="text-gradient">Siga uma trilha.</span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Sequências curadas que levam você do zero ao domínio — sem perder tempo escolhendo o próximo passo.
              </p>
            </div>
            <span className="rounded-full border border-border/60 bg-card/60 px-3 py-1 text-xs text-muted-foreground">
              {allTracks.length} {allTracks.length === 1 ? "trilha ativa" : "trilhas ativas"}
            </span>
          </header>
          {allTracks.length === 0 ? (
            <EmptyState icon={<Compass className="h-5 w-5" />} label="Nenhuma trilha publicada ainda." />
          ) : (
            <ul className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allTracks.map((t) => (
                <li key={t.id}><TrackCard track={t} /></li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* EBOOKS — microbanda discreta */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="flex items-center justify-between gap-3 rounded-full border border-dashed border-border/50 bg-card/30 px-5 py-2.5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary/70" />
            Ebooks complementares chegando em breve para reforçar suas trilhas.
          </span>
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Em breve</Badge>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Por que FCIA</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Tudo que você precisa para evoluir rápido</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Target, title: "Trilhas guiadas", desc: "Do básico ao avançado, sem você decidir o próximo passo." },
            { icon: Zap, title: "PIX e pronto", desc: "Pagou, liberou. Sem espera, sem burocracia." },
            { icon: Award, title: "Certificado validável", desc: "Selo digital com código público — comprove sua evolução." },
            { icon: ShieldCheck, title: "7 dias de garantia", desc: "Não curtiu? Devolvemos 100%, sem perguntas." },
            { icon: TrendingUp, title: "Catálogo vivo", desc: "Novos cursos publicados toda semana." },
            { icon: Sparkles, title: "AI Studio incluso", desc: "Resumos, quizzes e tutoria com IA — sem custo extra." },
          ].map(({ icon: Icon, title, desc }) => (
            <article key={title} className="group rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-colors hover:border-primary/40">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md transition-transform group-hover:scale-105">
                <Icon className="h-4.5 w-4.5" />
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
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Antes que você pergunte</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Sem dúvida, só matrícula</h2>
        </header>
        <div className="space-y-2">
          {[
            { q: "E se eu não gostar do curso?", a: "Devolvemos 100% do valor em até 7 dias, sem perguntas e sem letras miúdas. O risco é todo nosso." },
            { q: "Preciso esperar quanto tempo para acessar?", a: "Zero. O PIX é confirmado em segundos e o curso libera automaticamente — você começa a estudar agora." },
            { q: "O certificado vale alguma coisa?", a: "Sim. Cada certificado tem um código público de validação que qualquer empresa pode conferir online." },
            { q: "Por quanto tempo fica liberado?", a: "Para sempre. Comprou um curso, é seu — sem mensalidade, sem renovação, sem pegadinha." },
            { q: "Posso parcelar?", a: "Por enquanto trabalhamos só com PIX à vista para garantir o melhor preço. Em breve teremos cartão." },
          ].map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl transition-colors hover:border-primary/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-foreground">
                {f.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-6 text-center">
          <Rocket className="h-6 w-6 text-primary" />
          <p className="font-display text-lg font-semibold text-foreground">Pronto para começar?</p>
          <p className="text-sm text-muted-foreground">Escolha um curso, pague via PIX e libere o acesso na hora.</p>
          <a href="#cursos" className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg ring-glow transition-transform hover:-translate-y-0.5">
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </a>
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
    <article className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-xl ${
      highlight
        ? "border-primary/50 bg-gradient-to-br from-card/90 to-primary/5 shadow-lg ring-glow"
        : "border-border/60 bg-card/60 hover:border-primary/40"
    }`}>
      {highlight && (
        <span className="pointer-events-none absolute -right-12 top-4 rotate-45 bg-gradient-to-r from-primary to-accent px-12 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
          Top
        </span>
      )}
      <div className="flex items-start justify-between gap-3">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
          {highlight ? "Destaque" : "Curso"}
        </Badge>
        {isActive && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
            <CheckCircle2 className="h-3 w-3" /> Matriculado
          </span>
        )}
        {isPending && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-500">
            Pagamento pendente
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-foreground">{course.title}</h3>
      {course.description && <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{course.description}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {course.hours_load != null && (
          <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-0.5">
            <Clock className="h-3 w-3" /> {course.hours_load}h
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-0.5">
          <BookOpen className="h-3 w-3" /> Módulos
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background/40 px-2 py-0.5">
          <Award className="h-3 w-3" /> Certificado
        </span>
      </div>
      {price && (
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">à vista no PIX</span>
        </div>
      )}
      {price && <p className="font-mono text-2xl font-bold text-foreground">{price}</p>}
      <div className="mt-auto flex gap-2 pt-4">
        <Button asChild variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-foreground">
          <Link to="/curso/$slug" params={{ slug: course.slug }}>Detalhes</Link>
        </Button>
        {isActive ? (
          <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent font-semibold shadow-md hover:shadow-lg">
            <Link to="/curso/$slug" params={{ slug: course.slug }}>Acessar curso</Link>
          </Button>
        ) : isPending ? (
          <Button asChild size="sm" className="flex-1 bg-amber-500 font-semibold text-white hover:bg-amber-500/90">
            <Link to="/checkout/$courseId" params={{ courseId: course.id }}>Concluir pagamento</Link>
          </Button>
        ) : !userId ? (
          <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent font-semibold shadow-md hover:shadow-lg">
            <Link to="/cadastro" search={{ next: `/checkout/${course.id}` }}>
              <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Quero esse
            </Link>
          </Button>
        ) : (
          <Button asChild size="sm" className="flex-1 bg-gradient-to-r from-primary to-accent font-semibold shadow-md hover:shadow-lg">
            <Link to="/checkout/$courseId" params={{ courseId: course.id }}>
              <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Matricular agora
            </Link>
          </Button>
        )}
      </div>
    </article>
  );
}

function TrackCard({ track }: { track: Track }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border/60 bg-card/80 p-5 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl">
      <div className="flex items-center justify-between">
        <Badge className="w-fit bg-primary/15 text-[10px] uppercase tracking-wider text-primary hover:bg-primary/20">
          <Compass className="mr-1 h-3 w-3" /> Trilha
        </Badge>
        {track.hours_load != null && (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" /> {track.hours_load}h
          </span>
        )}
      </div>
      <h3 className="mt-3 font-display text-lg font-semibold leading-tight text-foreground">{track.title}</h3>
      {track.description && <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{track.description}</p>}
      <p className="mt-3 text-xs font-medium text-primary">Jornada completa, do zero ao domínio.</p>
      <div className="mt-auto pt-4">
        <Button asChild size="sm" className="w-full bg-gradient-to-r from-primary to-accent font-semibold shadow-md hover:shadow-lg">
          <Link to="/trilha/$slug" params={{ slug: track.slug }}>
            Começar trilha <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
