import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import {
  ArrowRight, Sparkles, ShoppingBag, GraduationCap, Award,
  Target, Brain, ShieldCheck, Users, ChevronDown,
  Code2, Database, Briefcase, Star,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import heroMentor from "@/assets/landing-hero-mentor.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";

const STATS = [
  { n: "+12k", l: "alunos ativos" },
  { n: "+8k", l: "certificados emitidos" },
  { n: "4,9", l: "nota média" },
  { n: "+900h", l: "de conteúdo aplicado" },
];

const STEPS = [
  { icon: ShoppingBag, t: "Escolha na vitrine", d: "Encontre a habilidade que muda o seu próximo mês." },
  { icon: GraduationCap, t: "Aprenda aplicado", d: "Conteúdo direto, projetos reais, ritmo seu." },
  { icon: Award, t: "Conquiste o certificado", d: "Validável, com código público, pronto pro LinkedIn." },
];

const DIFFS = [
  { icon: Target, t: "Conteúdo que vira resultado", d: "Cada aula entrega uma habilidade que você usa na segunda-feira." },
  { icon: ShieldCheck, t: "Certificado que vale", d: "Validação pública. RH reconhece. LinkedIn aceita." },
  { icon: Brain, t: "IA acelerando seu estudo", d: "Resumos, exercícios e revisão personalizada para você aprender mais rápido." },
  { icon: Users, t: "Mentoria humana", d: "Por trás da plataforma, gente de verdade ajudando você a evoluir." },
];

const TESTIMONIES = [
  { avatar: avatar1, name: "Marina Costa", role: "Desenvolvedora Front-end", quote: "Em 3 meses fui de iniciante para junior contratada. O conteúdo é direto e prático." },
  { avatar: avatar2, name: "Lucas Almeida", role: "Analista de Dados", quote: "Fui promovido depois de aplicar o que aprendi. A diferença é noite e dia." },
  { avatar: avatar3, name: "Camila Ribeiro", role: "Product Manager", quote: "Consegui meu primeiro emprego em tech com o certificado FCIA no currículo." },
];

const CATEGORIES = [
  { icon: Code2, t: "Tecnologia", d: "Desenvolvimento, engenharia e arquitetura." },
  { icon: Database, t: "Dados & IA", d: "Análise, engenharia de dados e inteligência artificial." },
  { icon: Briefcase, t: "Negócios em tech", d: "Produto, gestão e carreira no mercado digital." },
];

const FAQS = [
  { q: "Como funciona a compra?", a: "Você escolhe na vitrine, paga uma única vez (PIX ou cartão) e o acesso é liberado em minutos." },
  { q: "Como acesso depois de comprar?", a: "Direto pela sua conta, em qualquer dispositivo, sempre que quiser." },
  { q: "O certificado é reconhecido?", a: "Sim. Emitido com código público de validação, aceito no LinkedIn e por processos seletivos." },
  { q: "Tenho quanto tempo para concluir?", a: "Sem prazo. Acesso vitalício — você estuda no seu ritmo, para sempre." },
  { q: "Como funciona a vitrine?", a: "É onde você descobre tudo o que está disponível, filtra por área e escolhe só o que faz sentido pra você." },
  { q: "Posso comprar mais de um?", a: "Pode. Sem assinatura, sem amarras — você monta a sua própria trilha." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — Sua próxima skill em tech começa aqui" },
      { name: "description", content: "Descubra a vitrine FCIA: cursos, trilhas e certificados que aceleram a sua carreira em tecnologia." },
      { property: "og:title", content: "FCIA Academy — Sua próxima skill em tech começa aqui" },
      { property: "og:description", content: "Explore a vitrine FCIA e descubra o conteúdo que está movendo carreiras em tecnologia." },
    ],
  }),
  component: Index,
});

function Index() {
  const heroRef = useRef<HTMLElement | null>(null);
  const spot1Ref = useRef<HTMLDivElement | null>(null);
  const spot2Ref = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const s1 = spot1Ref.current;
    const s2 = spot2Ref.current;
    const c = cursorRef.current;
    if (!hero || !s1 || !s2 || !c) return;

    const onMove = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      s1.style.left = `${x}px`;
      s1.style.top = `${y}px`;
      s2.style.left = `${x + 30}px`;
      s2.style.top = `${y + 20}px`;
      c.style.left = `${x}px`;
      c.style.top = `${y}px`;
    };
    const onEnter = () => {
      s1.style.opacity = "1";
      s2.style.opacity = "1";
      c.style.opacity = "1";
    };
    const onLeave = () => {
      s1.style.opacity = "0";
      s2.style.opacity = "0";
      c.style.opacity = "0";
    };
    hero.addEventListener("mousemove", onMove);
    hero.addEventListener("mouseenter", onEnter);
    hero.addEventListener("mouseleave", onLeave);
    return () => {
      hero.removeEventListener("mousemove", onMove);
      hero.removeEventListener("mouseenter", onEnter);
      hero.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <AppShell>
      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden [cursor:none]">
        <div
          ref={spot1Ref}
          aria-hidden
          className="pointer-events-none absolute z-0 rounded-full opacity-0 transition-opacity duration-300"
          style={{
            width: 500,
            height: 500,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at center, rgba(0,212,255,0.18), transparent 70%)",
            filter: "blur(2px)",
          }}
        />
        <div
          ref={spot2Ref}
          aria-hidden
          className="pointer-events-none absolute z-0 rounded-full opacity-0 transition-opacity duration-300"
          style={{
            width: 350,
            height: 350,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle at center, rgba(168,85,247,0.12), transparent 70%)",
            filter: "blur(8px)",
          }}
        />
        <div
          ref={cursorRef}
          aria-hidden
          className="pointer-events-none absolute z-50 rounded-full opacity-0 transition-opacity duration-200"
          style={{
            width: 12,
            height: 12,
            transform: "translate(-50%, -50%)",
            background: "#00D4FF",
            mixBlendMode: "screen",
          }}
        />
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="absolute inset-0 tech-grid opacity-30" />
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px] animate-pulse" />
          <div className="absolute top-40 right-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px]" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-24">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" /> Educação em tecnologia que move carreira
            </span>
            <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              A tech que te promove <span className="text-gradient">começa aqui</span>.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              Conteúdo aplicado, mentoria de verdade e certificado que o mercado reconhece. Descubra o que está esperando por você na vitrine.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/vitrine" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-7 py-3.5 text-sm font-semibold text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
                Explorar vitrine <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#como-funciona" className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-6 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary/60">
                Como funciona
              </a>
            </div>
            <p className="mt-4 text-[11px] text-muted-foreground">Comece em minutos · Sem amarras · Conteúdo aplicado</p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-primary/40 via-transparent to-accent/40 opacity-60 blur-2xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/40 backdrop-blur-xl ring-glow">
              <img src={heroMentor} alt="Mentor FCIA Academy" width={1024} height={1536} className="aspect-[3/4] w-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent p-5">
                <p className="text-xs text-muted-foreground">Conduzida por especialistas</p>
                <p className="font-display text-base font-semibold text-foreground">Quem ensina, vive o mercado.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MICROPROVA */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl sm:grid-cols-4 sm:p-8">
          {STATS.map((s) => (
            <div key={s.l} className="text-center">
              <p className="font-display text-3xl font-bold text-gradient sm:text-4xl">{s.n}</p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como-funciona" className="mx-auto max-w-7xl px-4 pb-20 scroll-mt-24 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Como funciona</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Simples. Direto. Seu.</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, t, d }, i) => (
            <article key={t} className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <span className="absolute right-4 top-4 font-display text-5xl font-bold text-primary/10">0{i + 1}</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* DIFERENCIAIS */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <header className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow text-primary">Por que FCIA</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Feita para quem quer evoluir de verdade.</h2>
        </header>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DIFFS.map(({ icon: Icon, t, d }) => (
            <article key={t} className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl transition-transform hover:-translate-y-1">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:bg-primary/20" aria-hidden />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold text-foreground">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* PROVA SOCIAL */}
      <ShuffleTestimonials />

      {/* TENSÃO DE CURIOSIDADE */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/70 to-accent/10 p-8 backdrop-blur-xl ring-glow sm:p-14">
          <div className="absolute inset-0 tech-grid opacity-20" aria-hidden />
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-accent/20 blur-[100px]" aria-hidden />
          <div className="relative mx-auto max-w-3xl text-center">
            <span className="eyebrow text-primary">O que tem na vitrine</span>
            <h2 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-5xl">
              Dezenas de caminhos. <span className="text-gradient">Um clique de distância.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Cursos e trilhas para cada momento da sua jornada em tech. O próximo passo da sua carreira pode estar logo ali.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 sm:grid-cols-3">
            {CATEGORIES.map(({ icon: Icon, t, d }) => (
              <div key={t} className="rounded-2xl border border-border/60 bg-background/40 p-5 backdrop-blur transition-transform hover:-translate-y-1">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-4 font-display text-base font-semibold text-foreground">{t}</p>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-10 flex justify-center">
            <Link to="/vitrine" className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-8 py-4 text-base font-semibold text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
              Ver o catálogo completo <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-4 pb-20 scroll-mt-24 sm:px-6">
        <header className="mb-8 text-center">
          <span className="eyebrow text-primary">Tira-dúvidas</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">Antes de explorar, é simples assim.</h2>
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

      {/* CTA FINAL */}
      <section className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-card/70 to-accent/15 p-10 text-center backdrop-blur-xl ring-glow sm:p-16">
          <div className="absolute inset-0 tech-grid opacity-20" aria-hidden />
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-[120px]" aria-hidden />
          <div className="relative">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold text-foreground sm:text-5xl">
              O próximo capítulo da sua carreira <span className="text-gradient">está na vitrine</span>.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Entre. Olhe. Escolha o seu. Não custa nada descobrir.
            </p>
            <Link to="/vitrine" className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-10 py-4 text-base font-semibold text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
              Explorar vitrine <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
