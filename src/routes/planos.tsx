import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Minus, ShieldCheck, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { PLANS_FULL, FAQS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — FCIA Academy" },
      { name: "description", content: "Compare Free, Pro, Premium e Enterprise. Comece grátis e cancele quando quiser." },
      { property: "og:title", content: "Planos — FCIA Academy" },
      { property: "og:description", content: "4 planos para alunos e empresas. Comece grátis." },
    ],
  }),
  component: PlansPage,
});

const COMPARE_ROWS: { feature: string; values: (boolean | string)[] }[] = [
  { feature: "Cursos abertos", values: ["3", "Todos", "Todos", "Todos"] },
  { feature: "Trilhas guiadas", values: [false, true, true, true] },
  { feature: "Certificados validáveis", values: [false, true, true, true] },
  { feature: "Gamificação completa", values: [false, true, true, true] },
  { feature: "AI Studio", values: [false, "Limitado", "Ilimitado", "Ilimitado"] },
  { feature: "Mentoria 1:1 mensal", values: [false, false, true, true] },
  { feature: "Code reviews", values: [false, false, "Ilimitado", "Ilimitado"] },
  { feature: "SSO + relatórios", values: [false, false, false, true] },
  { feature: "CSM dedicado", values: [false, false, false, true] },
];

function Cell({ v }: { v: boolean | string }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (v === false) return <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />;
  return <span className="text-xs font-medium text-foreground">{v}</span>;
}

function PlansPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Planos" title="Escolha o ritmo da sua evolução" description="Sem cartão para começar. Cancele quando quiser. 7 dias de garantia." />

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {PLANS_FULL.map((p) => (
            <article key={p.slug} className={cn(
              "relative overflow-hidden rounded-3xl border p-6 backdrop-blur-xl",
              p.highlighted ? "border-primary/50 bg-card/80 glow-primary" : "border-border/60 bg-card/60",
            )}>
              {p.highlighted && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  <Sparkles className="h-3 w-3" /> Recomendado
                </span>
              )}
              <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{p.description}</p>
              <p className="mt-5 font-display text-4xl font-bold text-foreground">
                {p.price}<span className="ml-1 text-sm font-normal text-muted-foreground">{p.priceHint}</span>
              </p>
              <ul className="mt-5 space-y-2 text-sm text-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>
                ))}
                {p.notIncluded?.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-muted-foreground"><Minus className="mt-0.5 h-4 w-4 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link
                to={p.slug === "enterprise" ? "/contato" : "/checkout"}
                search={p.slug === "enterprise" ? undefined : { plan: p.slug }}
                className={cn(
                  "mt-7 block w-full rounded-full px-4 py-2.5 text-center text-sm font-medium transition-transform hover:-translate-y-0.5",
                  p.highlighted ? "bg-gradient-to-r from-primary to-accent text-primary-foreground ring-glow" : "border border-border bg-card/50 text-foreground",
                )}
              >
                {p.cta}
              </Link>
            </article>
          ))}
        </div>

        {/* Comparativo */}
        <section className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 backdrop-blur-xl">
          <div className="grid grid-cols-5 border-b border-border/60 bg-secondary/40 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <div>Recurso</div>
            {PLANS_FULL.map((p) => <div key={p.slug} className="text-center text-foreground">{p.name}</div>)}
          </div>
          {COMPARE_ROWS.map((row, i) => (
            <div key={row.feature} className={cn("grid grid-cols-5 items-center px-4 py-3 text-sm", i % 2 === 1 && "bg-background/30")}>
              <div className="text-foreground">{row.feature}</div>
              {row.values.map((v, j) => <div key={j} className="text-center"><Cell v={v} /></div>)}
            </div>
          ))}
        </section>

        {/* Garantia */}
        <div className="flex items-center gap-3 rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
          <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
          <p className="text-sm text-foreground">
            <strong>Garantia incondicional de 7 dias.</strong>{" "}
            <span className="text-muted-foreground">Se não fizer sentido, devolvemos 100% do valor.</span>
          </p>
        </div>

        {/* FAQ resumido */}
        <section className="space-y-2">
          <h2 className="font-display text-2xl font-semibold text-foreground">Perguntas sobre cobrança</h2>
          {FAQS.slice(0, 3).map((f, i) => (
            <details key={i} className="group rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
              <summary className="cursor-pointer text-sm font-medium text-foreground">{f.q}</summary>
              <p className="mt-2 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </section>
      </section>
    </AppShell>
  );
}