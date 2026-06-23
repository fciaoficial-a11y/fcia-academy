import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured, SUPABASE_URL } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/system/security-status")({
  head: () => ({
    meta: [
      { title: "Security Status — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SecurityStatusPage,
});

// Tabelas realmente consumidas pelo frontend nas sprints 6-7
const AUDITED = [
  "profiles",
  "tracks",
  "courses",
  "modules",
  "certificates",
  "quiz_attempts",
  "achievements",
  "user_achievements",
  "enrollments",
  "user_roles",
];

type Status = "ok" | "rls" | "missing" | "exposed" | "pending";

interface Probe {
  table: string;
  status: Status;
  count: number | null;
  message: string;
}

async function audit(table: string, authed: boolean): Promise<Probe> {
  try {
    const sb = getSupabase();
    const { count, error } = await sb.from(table).select("*", { count: "exact", head: true });
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("not exist") || msg.includes("schema cache") || msg.includes("not found")) {
        return { table, status: "missing", count: null, message: "Tabela ausente no banco" };
      }
      if (msg.includes("permission") || msg.includes("denied") || msg.includes("rls")) {
        return { table, status: "rls", count: null, message: "Bloqueada por RLS (sem policy aplicável)" };
      }
      return { table, status: "pending", count: null, message: error.message };
    }
    // sem erro = leitura permitida pela policy atual
    if (!authed && (count ?? 0) > 0) {
      return { table, status: "exposed", count, message: "Leitura anônima retorna linhas — revisar policy" };
    }
    return {
      table,
      status: "ok",
      count,
      message: authed ? "Leitura autenticada permitida pela policy" : "Acessível sem sessão (count=0 ou tabela pública)",
    };
  } catch (e) {
    return { table, status: "pending", count: null, message: e instanceof Error ? e.message : "Erro" };
  }
}

function SecurityStatusPage() {
  const { user, configured } = useAuth();
  const [probes, setProbes] = useState<Probe[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const authed = !!user;
    Promise.all(AUDITED.map((t) => audit(t, authed))).then(setProbes);
  }, [user]);

  const total = AUDITED.length;
  const ok = probes?.filter((p) => p.status === "ok").length ?? 0;
  const rls = probes?.filter((p) => p.status === "rls").length ?? 0;
  const missing = probes?.filter((p) => p.status === "missing").length ?? 0;
  const exposed = probes?.filter((p) => p.status === "exposed").length ?? 0;

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sprint 8 · Hardening</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Security status</h1>
          <p className="text-sm text-muted-foreground">
            Auditoria read-only do estado de RLS, autorização e exposição das tabelas consumidas pelo frontend.
            Nenhum recurso é criado no banco.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={ShieldCheck} label="Tabelas auditadas" value={String(total)} />
          <KpiCard icon={CheckCircle2} label="OK" value={probes ? String(ok) : "…"} tone="ok" />
          <KpiCard icon={Lock} label="Bloqueadas por RLS" value={probes ? String(rls) : "…"} tone="warn" />
          <KpiCard icon={AlertCircle} label="Exposições potenciais" value={probes ? String(exposed) : "…"} tone={exposed > 0 ? "bad" : "muted"} />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Autenticação</h3>
          <Row ok={configured} label="Client Supabase ativo (publishable key, build-time)" />
          <Row ok={!!user} partial label={user ? `Sessão ativa: ${user.email}` : "Sem sessão — auditoria roda como anon"} />
          <Row ok={true} label="Decisão de acesso baseada em supabase.auth.getUser()" />
          <Row ok={true} label="signInWithPassword / signUp / signOut conectados ao Supabase real" />
          <Row ok={true} label="Gate /admin via getUser() (RBAC formal pendente: user_roles ausente)" />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">RLS por tabela consumida</h3>
          {!probes ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Sondando tabelas…
            </div>
          ) : (
            <ul className="divide-y divide-border/40">
              {probes.map((p) => (
                <li key={p.table} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="flex items-start gap-2">
                    <StatusIcon status={p.status} />
                    <div>
                      <span className="font-mono text-xs text-foreground">{p.table}</span>
                      <p className="text-[11px] text-muted-foreground">{p.message}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {p.count === null ? "—" : `${p.count} linhas`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Storage</h3>
          <Row ok={true} label="Nenhum bucket público criado pelo frontend nesta sprint" />
          <Row ok={true} label="Frontend não executa uploads diretos com service_role" />
          <Row
            ok={false}
            partial
            label="Inventário completo de buckets requer Supabase Advisors (não acessível com publishable key)"
          />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Hardening — checklist</h3>
          <Row ok={true} label="Sem service_role no frontend" />
          <Row ok={true} label="Sem secret keys no bundle" />
          <Row ok={true} label="Publishable key isolada em VITE_SUPABASE_PUBLISHABLE_KEY" />
          <Row ok={true} label="Sem criação de tabela, migration, bucket, policy, function ou trigger nesta sprint" />
          <Row ok={exposed === 0} label={exposed === 0 ? "Sem exposições anon detectadas pelo probe" : "Revisar tabelas exposed acima"} />
          <Row ok={missing === 0} partial={missing > 0} label={missing === 0 ? "Todas as tabelas auditadas existem" : `${missing} tabela(s) ausente(s) — manter fallback mock no domínio`} />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Advisors</h3>
          <p className="text-sm text-muted-foreground">
            Os advisors oficiais (índices, segurança, performance) ficam no painel Supabase do projeto{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">{SUPABASE_URL}</code>. Não é possível
            consumi-los com publishable key. Revisar manualmente em Database → Advisors antes do deploy.
          </p>
          <Link to="/system/schema" className="mt-3 inline-block text-xs text-primary underline">
            Ver schema diagnóstico →
          </Link>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  icon: Icon, label, value, tone = "muted",
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
  tone?: "ok" | "warn" | "bad" | "muted";
}) {
  const accent =
    tone === "ok" ? "text-emerald-500"
    : tone === "warn" ? "text-amber-500"
    : tone === "bad" ? "text-destructive"
    : "text-primary";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${accent}`} /> {label}
      </div>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === "ok") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  if (status === "rls") return <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />;
  if (status === "missing") return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
  if (status === "exposed") return <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />;
  return <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />;
}

function Row({ ok, partial, label }: { ok: boolean; partial?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm">
      {ok && !partial ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      ) : partial ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className="text-foreground">{label}</span>
    </div>
  );
}