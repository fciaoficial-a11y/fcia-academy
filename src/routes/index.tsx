import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, Zap, Award, Target,
  ShieldCheck, Check, ChevronDown, Store,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { TrackCard } from "@/components/cards/TrackCard";
import { TestimonialCard } from "@/components/social/TestimonialCard";
import {
  TRACKS, TESTIMONIALS, FAQS,
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — Cursos premium de tecnologia, vendidos por curso" },
      { name: "description", content: "Compre cursos individuais de alta qualidade na vitrine FCIA. Aprendizado prático, aplicado e com certificado validável." },
      { property: "og:title", content: "FCIA Academy — Vitrine de cursos premium" },
      { property: "og:description", content: "Cursos vendidos individualmente. Escolha, compre e comece agora pela vitrine." },
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
          <Sparkles className="h-3 w-3 text-primary" /> Sem assinatura · acesso vitalício
        </span>
        <h1 className="mt-6 max-w-4xl font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Pague só pelo curso que vai <span className="text-gradient">mudar sua carreira</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Cursos premium de tecnologia aplicada, vendidos individualmente. Escolha, compre e comece em minutos — direto na vitrine.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/vitrine" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
            Explorar vitrine <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/" hash="trilhas" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary/60">
            Cursos em destaque
          </Link>
        </div>
        <p className="mt-3 text-[11px] text-muted-foreground">Pagamento único · acesso vitalício · 7 dias de garantia</p>
      </section>

      {/* VITRINE — BLOCO DOMINANTE */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/70 to-accent/10 p-8 backdrop-blur-xl ring-glow sm:p-14">
          <div className="absolute inset-0 tech-grid opacity-20" aria-hidden />
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="eyebrow inline-flex items-center gap-2 text-primary">
                <Store className="h-3.5 w-3.5" /> Vitrine FCIA
              </span>
              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-5xl">
                Escolha o curso. <span className="text-gradient">Compre. Comece agora.</span>
              </h2>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                Catálogo completo de cursos e trilhas, com preço por item, acesso vitalício e certificado validável. Sem mensalidade, sem amarras.
              </p>
              <ul className="mt-5 grid gap-2 text-sm text-foreground sm:grid-cols-2">
                {["Compra por curso individual", "Acesso vitalício", "Certificado validável", "Pagamento via PIX"].map((l) => (
                  <li key={l} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {l}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link to="/vitrine" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
                  Ir para a vitrine <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative grid gap-3 sm:grid-cols-2">
              {[
                { t: "Curso", n: "React Avançado", p: "R$ 297" },
                { t: "Trilha", n: "Full-Stack 2025", p: "R$ 897" },
                { t: "Curso", n: "TypeScript Pro", p: "R$ 247" },
                { t: "Curso", n: "Node.js APIs", p: "R$ 297" },
              ].map((c) => (
                <div key={c.n} className="rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur">
                  <p className="eyebrow text-primary">{c.t}</p>
                  <p className="mt-1 font-display text-base font-semibold text-foreground">{c.n}</p>
                  <p className="mt-3 font-display text-lg font-bold text-foreground">{c.p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section id="beneficios" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 scroll-mt-24">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Por que FCIA</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Conteúdo denso. Resultado real.</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Target, title: "Aplicado de verdade", desc: "Projetos reais, código que vai parar no seu portfólio." },
            { icon: Zap, title: "Direto ao ponto", desc: "Sem enrolação. Cada aula entrega uma habilidade prática." },
            { icon: Award, title: "Certificado validável", desc: "Emissão automática com código público — compatível com LinkedIn." },
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

      {/* TRILHAS EM DESTAQUE */}
      <section id="trilhas" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 scroll-mt-24">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <span className="eyebrow text-primary">Em destaque</span>
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Mais procurados agora</h2>
          </div>
          <Link to="/vitrine" className="text-sm text-primary hover:underline">Ver vitrine completa →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRACKS.slice(0, 3).map((t) => <TrackCard key={t.slug} track={t} />)}
        </div>
      </section>

      {/* PROVA SOCIAL — DEPOIMENTOS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Prova social</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Quem comprou, recomenda</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <TestimonialCard key={t.id} t={t} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-20 sm:px-6 scroll-mt-24">
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
            <h3 className="font-display text-lg font-semibold text-foreground">7 dias de garantia. Risco zero.</h3>
            <p className="text-sm text-muted-foreground">Não gostou? Devolvemos 100% do valor. Sem pergunta, sem burocracia.</p>
          </div>
          <Link to="/vitrine" className="shrink-0 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-semibold text-primary-foreground ring-glow">
            Ir para a vitrine <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
