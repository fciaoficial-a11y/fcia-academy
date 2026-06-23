import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, Zap, Award, Target, Users, Brain, BookOpen,
  ShieldCheck, Check, Star, ChevronDown,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { TrackCard } from "@/components/cards/TrackCard";
import { TestimonialCard } from "@/components/social/TestimonialCard";
import { SuccessCaseCard } from "@/components/social/SuccessCaseCard";
import { RatingCard } from "@/components/social/RatingCard";
import {
  TRACKS, TESTIMONIALS, SUCCESS_CASES, PLANS_FULL, FAQS,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — Aprenda em trilhas com certificados validáveis" },
      { name: "description", content: "Trilhas guiadas, gamificação ativa, mentoria humana e certificados validáveis. Para profissionais e empresas em escala." },
      { property: "og:title", content: "FCIA Academy — A nova forma de aprender" },
      { property: "og:description", content: "Trilhas, XP, certificados e AI Studio em uma plataforma premium." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      {/* HERO */}
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-16 text-center sm:px-6 lg:pt-24">
        <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" /> 12.430+ alunos · nota 4,9 · certificados validáveis
        </span>
        <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          A nova forma de <span className="text-gradient">aprender tecnologia</span> em alta performance.
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Trilhas guiadas por especialistas, gamificação que mantém o ritmo e certificados validáveis publicamente.
          Comece grátis e cancele quando quiser.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/cadastro" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
            Começar grátis <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/catalogo" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary/60">
            Explorar catálogo
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">7 dias de garantia incondicional · sem cartão para começar</p>

        {/* Stat strip */}
        <div className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { v: "12.430+", l: "alunos ativos" },
            { v: "84", l: "cursos premium" },
            { v: "9.812", l: "certificados emitidos" },
            { v: "4,9", l: "nota média" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl text-center">
              <p className="font-display text-2xl font-bold text-gradient">{s.v}</p>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PROVA SOCIAL — LOGOS */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">Times de alta performance que confiam na FCIA</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 opacity-80 sm:gap-12">
          {["Nubank", "iFood", "Globo", "Mercado Livre", "Stone", "Loft"].map((b) => (
            <span key={b} className="font-display text-base font-semibold tracking-tight text-foreground/70">{b}</span>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Benefícios</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Tudo o que falta nos cursos tradicionais</h2>
          <p className="mt-3 text-sm text-muted-foreground">Conteúdo denso, gamificação consistente e mentoria humana ao alcance.</p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Target, title: "Trilhas guiadas", desc: "Sequências curatoriais do básico ao avançado, com objetivos mensuráveis." },
            { icon: Zap, title: "Gamificação ativa", desc: "XP, níveis, streaks diários e conquistas que mantêm o ritmo." },
            { icon: Award, title: "Certificados validáveis", desc: "Emissão automática com código público de validação." },
            { icon: Brain, title: "AI Studio integrado", desc: "Gere quizzes, resumos e objetivos com IA assistida." },
            { icon: Users, title: "Mentoria humana", desc: "Sessões 1:1 e code reviews ilimitados no plano Premium." },
            { icon: BookOpen, title: "Catálogo vivo", desc: "Novos cursos toda semana, sem custo adicional." },
          ].map(({ icon: Icon, title, desc }) => (
            <article key={title} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-transform hover:-translate-y-0.5">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" aria-hidden />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* METODOLOGIA FCIA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="rounded-3xl border border-border/60 bg-card/60 p-8 backdrop-blur-xl sm:p-12">
          <header className="mx-auto mb-10 max-w-2xl text-center">
            <span className="eyebrow text-primary">Metodologia FCIA</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Aprenda · Pratique · Comprove</h2>
          </header>
          <ol className="grid gap-6 lg:grid-cols-3">
            {[
              { n: "01", title: "Aprenda em trilhas", desc: "Conteúdo organizado em camadas progressivas com pré-requisitos claros." },
              { n: "02", title: "Pratique com IA", desc: "Quizzes adaptativos, exercícios e mentoria contínua entre aulas." },
              { n: "03", title: "Comprove com certificado", desc: "Validação pública e selo digital compatível com LinkedIn." },
            ].map((s) => (
              <li key={s.n} className="relative rounded-2xl border border-border/40 bg-background/40 p-6">
                <span className="font-display text-4xl font-bold text-gradient">{s.n}</span>
                <h3 className="mt-3 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* TRILHAS EM DESTAQUE */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-primary">Em destaque</span>
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Trilhas mais procuradas</h2>
          </div>
          <Link to="/trilhas" className="text-sm text-primary hover:underline">Ver todas →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.slice(0, 3).map((t) => <TrackCard key={t.slug} track={t} />)}
        </div>
      </section>

      {/* CERTIFICAÇÃO */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid items-center gap-8 rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-background p-8 backdrop-blur-xl lg:grid-cols-2 lg:p-12">
          <div>
            <span className="eyebrow text-primary">Certificação</span>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
              Certificados que <span className="text-gradient">o mercado reconhece</span>
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Cada certificado tem código público validável e selo compatível com LinkedIn, GitHub e Notion.
              Compartilhe sua evolução em um clique.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-foreground">
              {["Validação pública por URL", "Selo digital exportável", "Compatível com LinkedIn", "Vitalício e gratuito após emitido"].map((l) => (
                <li key={l} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {l}</li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border/40 bg-background/40 p-6 ring-glow">
            <div className="absolute inset-0 tech-grid opacity-30" aria-hidden />
            <div className="relative flex h-full flex-col items-center justify-center text-center">
              <Award className="h-12 w-12 text-primary" />
              <p className="mt-3 eyebrow text-primary">FCIA Academy</p>
              <p className="font-display text-xl font-semibold text-foreground">Certificado de Conclusão</p>
              <p className="mt-1 text-sm text-muted-foreground">React Fundamentos · 12h</p>
              <span className="mt-4 rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-[10px] text-foreground">FCIA-A4F2-9X10</span>
            </div>
          </div>
        </div>
      </section>

      {/* PROVA SOCIAL — DEPOIMENTOS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Quem usa, recomenda</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Histórias reais de quem evoluiu com a FCIA</h2>
        </header>
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <RatingCard rating={4.9} totalReviews={3420} label="Avaliação geral" />
          </div>
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SUCCESS_CASES.map((c) => <SuccessCaseCard key={c.id} c={c} />)}
        </div>
      </section>

      {/* PLANOS PREVIEW */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Planos</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Escolha o ritmo que cabe na sua jornada</h2>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {PLANS_FULL.map((p) => (
            <article key={p.slug} className={cn(
              "relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl",
              p.highlighted ? "border-primary/40 bg-card/80 glow-primary" : "border-border/60 bg-card/60",
            )}>
              {p.highlighted && <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Recomendado</span>}
              <h3 className="font-display text-lg font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              <p className="mt-4 font-display text-3xl font-bold text-foreground">
                {p.price}<span className="ml-1 text-xs font-normal text-muted-foreground">{p.priceHint}</span>
              </p>
              <Link to="/planos" className={cn(
                "mt-5 block w-full rounded-full px-4 py-2 text-center text-xs font-medium",
                p.highlighted ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "border border-border bg-card/50 text-foreground",
              )}>{p.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <header className="mb-8 text-center">
          <span className="eyebrow text-primary">FAQ</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Perguntas frequentes</h2>
        </header>
        <div className="space-y-2">
          {FAQS.map((f, i) => (
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

      {/* GARANTIA */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border/60 bg-card/60 p-8 text-center backdrop-blur-xl sm:flex-row sm:text-left">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-lg font-semibold text-foreground">Garantia incondicional de 7 dias</h3>
            <p className="text-sm text-muted-foreground">Se não fizer sentido, devolvemos 100% do valor pago. Sem perguntas, sem burocracia.</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/60 to-accent/10 p-10 text-center backdrop-blur-xl ring-glow sm:p-14">
          <div className="absolute inset-0 tech-grid opacity-20" aria-hidden />
          <div className="relative">
            <div className="mx-auto flex items-center justify-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
            </div>
            <h2 className="mt-4 font-display text-3xl font-semibold text-foreground sm:text-5xl">
              Pronto para acelerar sua <span className="text-gradient">carreira em tech</span>?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
              Junte-se a milhares de profissionais que já evoluem com a FCIA. Comece grátis hoje.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link to="/cadastro" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-medium text-primary-foreground ring-glow">
                Criar conta grátis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/planos" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-6 py-3 text-sm font-medium text-foreground">
                Ver todos os planos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
