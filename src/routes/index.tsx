import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Zap, Award } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FCIA Academy — Trilhas, gamificação e certificados" },
      {
        name: "description",
        content:
          "Plataforma de educação online com trilhas guiadas, gamificação ativa e certificados digitais validáveis.",
      },
      { property: "og:title", content: "FCIA Academy" },
      {
        property: "og:description",
        content: "Aprenda em trilhas guiadas com XP, streaks e certificados validáveis.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <section className="relative mx-auto flex max-w-7xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 lg:pt-28">
        <span className="eyebrow inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-muted-foreground backdrop-blur">
          <Sparkles className="h-3 w-3 text-primary" />
          Sprint 1 · Foundation
        </span>

        <h1 className="mt-6 max-w-3xl font-display text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Aprenda em <span className="text-gradient">trilhas guiadas</span> com
          gamificação ativa.
        </h1>

        <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
          Design System FCIA Academy ativo. Tokens, tipografia, sombras, grid
          tech e dark-first carregados. Layout shell pronto para Sprint 2.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5">
            Explorar trilhas <ArrowRight className="h-4 w-4" />
          </button>
          <button className="inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-5 py-2.5 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-secondary/60">
            Ver planos
          </button>
        </div>

        <div className="mt-20 grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Trilhas guiadas",
              desc: "Sequências curatoriais com progresso persistente.",
            },
            {
              icon: Zap,
              title: "Gamificação",
              desc: "XP, níveis, streak diário e badges para retenção.",
            },
            {
              icon: Award,
              title: "Certificados validáveis",
              desc: "Emissão automática com código público de validação.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-6 text-left backdrop-blur-xl transition-transform hover:-translate-y-0.5"
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                {title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
