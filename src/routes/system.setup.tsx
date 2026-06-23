import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_PROJECT_REF,
  SUPABASE_PUBLISHABLE_KEY,
} from "@/integrations/supabase/client";

export const Route = createFileRoute("/system/setup")({
  head: () => ({
    meta: [
      { title: "Setup — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SystemSetupPage,
});

function mask(key: string) {
  if (!key) return "—";
  if (key.length < 14) return "•••";
  return `${key.slice(0, 8)}…${key.slice(-6)}`;
}

function SystemSetupPage() {
  const ok = isSupabaseConfigured;
  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sprint 5B · Setup</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Configuração do Supabase</h1>
          <p className="text-sm text-muted-foreground">
            A chave é lida em build-time a partir das variáveis de ambiente do projeto
            (<code className="rounded bg-muted px-1">VITE_SUPABASE_URL</code> e
            <code className="rounded bg-muted px-1"> VITE_SUPABASE_PUBLISHABLE_KEY</code>). Não é solicitada novamente.
          </p>
        </header>

        <section
          className={`rounded-2xl border p-6 ${
            ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5"
          }`}
        >
          <div className="flex items-start gap-3">
            {ok ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="mt-0.5 h-5 w-5 text-destructive" />
            )}
            <div className="space-y-1">
              <h2 className="text-base font-semibold">
                {ok ? "Client Supabase inicializado" : "Bloqueado — configuração ausente"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {ok
                  ? "A publishable key está registrada como variável de ambiente. Nenhuma ação necessária."
                  : "Cole VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY em .env na raiz do projeto e refaça o build."}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
          <h3 className="mb-4 text-sm font-semibold">Auditoria</h3>
          <dl className="grid gap-3 text-sm">
            <Row label="URL" value={SUPABASE_URL || "—"} />
            <Row label="Project Ref" value={SUPABASE_PROJECT_REF || "—"} />
            <Row label="Publishable key" value={mask(SUPABASE_PUBLISHABLE_KEY)} />
            <Row label="Persistência" value="localStorage (auto-refresh ativo)" />
            <Row label="Recursos criados" value="nenhum" />
          </dl>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <Link
            to="/system/schema"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <ShieldCheck className="h-4 w-4" /> Diagnóstico de schema
          </Link>
          <Link
            to="/system/status"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
          >
            Status geral
          </Link>
        </section>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-2 last:border-none last:pb-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono text-xs text-foreground">{value}</dd>
    </div>
  );
}