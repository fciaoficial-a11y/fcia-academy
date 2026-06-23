import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Lock, ShieldCheck, Tag, Check } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { PLANS_FULL } from "@/lib/mock-data";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — FCIA Academy" },
      { name: "description", content: "Finalize sua assinatura na FCIA Academy." },
    ],
  }),
  component: CheckoutPage,
});

const COUPONS: Record<string, number> = {
  FCIA10: 10,
  BLACKFCIA: 30,
  WELCOME: 15,
};

function parsePrice(p: string): number {
  const m = p.replace(/\./g, "").replace(",", ".").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[0]) : 0;
}

function CheckoutPage() {
  const [planSlug, setPlanSlug] = useState<typeof PLANS_FULL[number]["slug"]>("pro");
  const [coupon, setCoupon] = useState("");
  const [applied, setApplied] = useState<{ code: string; pct: number } | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const plan = PLANS_FULL.find((p) => p.slug === planSlug)!;
  const base = parsePrice(plan.price);
  const discount = useMemo(() => (applied ? (base * applied.pct) / 100 : 0), [applied, base]);
  const total = Math.max(base - discount, 0);

  const applyCoupon = () => {
    const pct = COUPONS[coupon.trim().toUpperCase()];
    if (pct) setApplied({ code: coupon.trim().toUpperCase(), pct });
    else setApplied(null);
  };

  if (submitted) {
    return (
      <AppShell>
        <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-primary/40 bg-card/80 p-10 text-center backdrop-blur-xl glow-primary">
            <Check className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-display text-2xl font-semibold text-foreground">Assinatura confirmada (mock)</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seu acesso ao plano <strong>{plan.name}</strong> foi liberado. Nenhum cartão foi cobrado nesta simulação.
            </p>
            <Link to="/dashboard" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow">
              Ir para o dashboard
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl space-y-8 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Checkout" title="Finalize sua assinatura" description="Ambiente seguro · sem cobrança real nesta simulação." />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}
            className="space-y-6 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl"
          >
            <section className="space-y-3">
              <h3 className="font-display text-base font-semibold text-foreground">1. Escolha o plano</h3>
              <div className="grid gap-2 sm:grid-cols-3">
                {PLANS_FULL.filter((p) => p.slug !== "enterprise" && p.slug !== "free").map((p) => (
                  <label key={p.slug} className={`cursor-pointer rounded-2xl border p-3 text-sm transition-colors ${planSlug === p.slug ? "border-primary/60 bg-primary/10" : "border-border/40 bg-background/40 hover:bg-secondary/40"}`}>
                    <input type="radio" name="plan" className="sr-only" checked={planSlug === p.slug} onChange={() => setPlanSlug(p.slug)} />
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.price}<span className="text-muted-foreground">{p.priceHint}</span></p>
                  </label>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-semibold text-foreground">2. Dados do pagador</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome completo" placeholder="Marina Souza" />
                <Field label="E-mail" type="email" placeholder="marina@fcia.io" />
                <Field label="CPF/CNPJ" placeholder="000.000.000-00" />
                <Field label="Telefone" placeholder="(11) 99999-0000" />
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="font-display text-base font-semibold text-foreground">3. Cartão de crédito</h3>
              <Field label="Número do cartão" placeholder="0000 0000 0000 0000" icon={<CreditCard className="h-4 w-4" />} />
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Validade" placeholder="MM/AA" />
                <Field label="CVV" placeholder="000" />
                <Field label="Parcelas" placeholder="1x sem juros" />
              </div>
            </section>

            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground ring-glow">
              <Lock className="h-4 w-4" /> Finalizar pagamento — R$ {total.toFixed(2).replace(".", ",")}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-primary" /> Ambiente simulado · nenhum dado real é enviado
            </p>
          </form>

          {/* Resumo */}
          <aside className="space-y-4">
            <section className="space-y-3 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
              <h3 className="font-display text-base font-semibold text-foreground">Resumo do pedido</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Plano {plan.name}</span>
                <span className="font-mono text-foreground">{plan.price}{plan.priceHint}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">React Fundamentos (incluso)</span>
                <span className="text-muted-foreground">—</span>
              </div>

              <div className="border-t border-border/40 pt-3">
                <label className="block text-xs font-medium text-foreground">Cupom de desconto</label>
                <div className="mt-1 flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="FCIA10"
                      className="h-9 w-full rounded-xl border border-input bg-background/60 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40"
                    />
                  </div>
                  <button type="button" onClick={applyCoupon} className="rounded-xl bg-secondary/60 px-3 text-xs font-medium text-foreground hover:bg-secondary">
                    Aplicar
                  </button>
                </div>
                {applied && (
                  <p className="mt-1 text-xs text-primary">Cupom {applied.code} aplicado · -{applied.pct}%</p>
                )}
                {coupon && !applied && (
                  <p className="mt-1 text-xs text-destructive">Cupom inválido. Tente FCIA10, WELCOME ou BLACKFCIA.</p>
                )}
              </div>

              <div className="space-y-1.5 border-t border-border/40 pt-3 text-sm">
                <Row label="Subtotal" value={`R$ ${base.toFixed(2).replace(".", ",")}`} />
                {discount > 0 && <Row label={`Desconto (${applied?.pct}%)`} value={`- R$ ${discount.toFixed(2).replace(".", ",")}`} accent />}
                <Row label="Total" value={`R$ ${total.toFixed(2).replace(".", ",")}/mês`} bold />
              </div>
            </section>

            <div className="flex items-center gap-2 rounded-2xl border border-border/40 bg-background/40 p-4 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-primary" /> Pagamento criptografado · garantia de 7 dias
            </div>
          </aside>
        </div>
      </section>
    </AppShell>
  );
}

function Field({ label, placeholder, type = "text", icon }: { label: string; placeholder?: string; type?: string; icon?: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          className={`h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40 ${icon ? "pl-9" : ""}`}
        />
      </div>
    </label>
  );
}

function Row({ label, value, bold, accent }: { label: string; value: string; bold?: boolean; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-semibold text-foreground" : accent ? "text-primary" : "text-muted-foreground"}`}>
      <span>{label}</span>
      <span className="font-mono">{value}</span>
    </div>
  );
}