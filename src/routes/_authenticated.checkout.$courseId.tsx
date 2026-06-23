import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Copy, Loader2, QrCode, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { createPixCheckout, getPaymentStatus } from "@/lib/payments.functions";

type Course = { id: string; slug: string; title: string; price_cents: number; currency: string };

export const Route = createFileRoute("/_authenticated/checkout/$courseId")({
  head: () => ({
    meta: [
      { title: "Checkout PIX — FCIA Academy" },
      { name: "description", content: "Pague via PIX e libere o acesso ao curso." },
    ],
  }),
  loader: async ({ params }) => {
    const { data, error } = await supabase
      .from("courses")
      .select("id, slug, title, price_cents, currency")
      .eq("id", params.courseId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Curso não encontrado");
    return { course: data as Course };
  },
  errorComponent: ({ error }) => (
    <AppShell><p className="p-6 text-sm text-destructive">Erro: {error.message}</p></AppShell>
  ),
  component: CheckoutPixPage,
});

function CheckoutPixPage() {
  const { course } = Route.useLoaderData();
  const navigate = useNavigate();
  const createFn = useServerFn(createPixCheckout);
  const statusFn = useServerFn(getPaymentStatus);

  const createM = useMutation({
    mutationFn: () => createFn({ data: { courseId: course.id } }),
    onError: (e: Error) => toast.error(e.message),
    onSuccess: (res) => {
      if (res.alreadyActive) {
        toast.success("Acesso já liberado");
        navigate({ to: "/curso/$slug", params: { slug: course.slug } });
      }
    },
  });

  // Auto start on mount
  useEffect(() => {
    if (!createM.isPending && !createM.data && !createM.isError) {
      createM.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paymentId = createM.data && !createM.data.alreadyActive ? createM.data.paymentId : null;

  const statusQ = useQuery({
    queryKey: ["payment-status", paymentId],
    enabled: !!paymentId,
    queryFn: () => statusFn({ data: { paymentId: paymentId! } }),
    refetchInterval: (q) => (q.state.data?.status === "approved" ? false : 5000),
  });

  useEffect(() => {
    if (statusQ.data?.status === "approved") {
      toast.success("Pagamento aprovado! Acesso liberado.");
      const t = setTimeout(() => navigate({ to: "/curso/$slug", params: { slug: course.slug } }), 1200);
      return () => clearTimeout(t);
    }
  }, [statusQ.data?.status, course.slug, navigate]);

  return (
    <AppShell>
      <section className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <PageHeader
          eyebrow="Checkout PIX"
          title={course.title}
          description="Pague em segundos. Liberação automática após confirmação."
        />
        <div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          {createM.isPending && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Gerando cobrança PIX…
            </div>
          )}
          {createM.isError && (
            <div className="space-y-3 py-6 text-sm">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span>{(createM.error as Error).message}</span>
              </div>
              <Button size="sm" onClick={() => createM.mutate()}>Tentar novamente</Button>
            </div>
          )}
          {createM.data && !createM.data.alreadyActive && (
            <PixPanel
              data={createM.data}
              status={statusQ.data?.status ?? "pending"}
              currency={course.currency}
            />
          )}
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-primary" /> Pagamento processado pelo Mercado Pago
        </p>
        <div className="text-center">
          <Link to="/vitrine" className="text-xs text-muted-foreground hover:text-foreground">
            ← Voltar para a vitrine
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function PixPanel({
  data,
  status,
  currency,
}: {
  data: { qrCode: string | null; qrCodeBase64: string | null; ticketUrl: string | null; expiresAt: string | null; amountCents: number };
  status: string;
  currency: string;
}) {
  const isApproved = status === "approved";
  const formatted = useMemo(
    () => new Intl.NumberFormat("pt-BR", { style: "currency", currency: currency || "BRL" }).format(data.amountCents / 100),
    [data.amountCents, currency],
  );

  if (isApproved) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary" />
        <h3 className="font-display text-xl font-semibold text-foreground">Pagamento aprovado!</h3>
        <p className="text-sm text-muted-foreground">Redirecionando ao curso…</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-2">
        {data.qrCodeBase64 ? (
          <img
            src={`data:image/png;base64,${data.qrCodeBase64}`}
            alt="QR Code PIX"
            className="h-48 w-48 rounded-lg border border-border/60 bg-white p-2"
          />
        ) : (
          <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-border/60 text-muted-foreground">
            <QrCode className="h-10 w-10" />
          </div>
        )}
        <p className="font-mono text-lg font-semibold text-foreground">{formatted}</p>
      </div>
      <div className="space-y-4">
        <div>
          <h3 className="font-display text-base font-semibold text-foreground">Pague em qualquer banco</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Abra o app do seu banco, escaneie o QR Code ou copie o código PIX.
          </p>
        </div>
        {data.qrCode && <CopyField value={data.qrCode} />}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Aguardando confirmação… Status: <span className="font-medium text-foreground">{status}</span>
        </div>
        {data.ticketUrl && (
          <a href={data.ticketUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
            Abrir comprovante no Mercado Pago
          </a>
        )}
      </div>
    </div>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success("Código PIX copiado");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground">Código PIX (copia e cola)</label>
      <div className="flex gap-2">
        <input
          readOnly
          value={value}
          className="h-9 flex-1 truncate rounded-xl border border-input bg-background/60 px-3 font-mono text-xs text-foreground outline-none"
        />
        <Button size="sm" variant="outline" onClick={copy}>
          <Copy className="mr-1 h-3.5 w-3.5" /> {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
    </div>
  );
}