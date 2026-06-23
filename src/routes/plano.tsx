import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { PLANS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plano")({
  head: () => ({ meta: [{ title: "Planos — FCIA Academy" }, { name: "description", content: "Escolha o plano ideal para você ou sua empresa." }] }),
  component: PlanPage,
});

function PlanPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Planos" title="Escolha o plano ideal" description="Sem cartão para começar. Cancele quando quiser." />
        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name} className={cn(
              "relative overflow-hidden rounded-3xl border p-8 backdrop-blur-xl",
              p.highlighted ? "border-primary/40 bg-card/80 glow-primary" : "border-border/60 bg-card/60",
            )}>
              {p.highlighted && <span className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-primary to-accent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">Popular</span>}
              <h3 className="font-display text-xl font-semibold text-foreground">{p.name}</h3>
              <p className="mt-2 font-display text-4xl font-bold text-foreground">{p.price}<span className="text-sm font-normal text-muted-foreground">{p.price.startsWith("R$") && p.price !== "R$ 0" ? "/mês" : ""}</span></p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}</li>)}
              </ul>
              <button className={cn(
                "mt-8 w-full rounded-full px-4 py-2.5 text-sm font-medium transition-transform hover:-translate-y-0.5",
                p.highlighted ? "bg-gradient-to-r from-primary to-accent text-primary-foreground ring-glow" : "border border-border bg-card/50 text-foreground",
              )}>{p.cta}</button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
