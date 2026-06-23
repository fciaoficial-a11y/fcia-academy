import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Circle, Activity, Layers, ShieldCheck, Database, Loader2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_PROJECT_REF } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/system/ops-status")({
  head: () => ({
    meta: [
      { title: "Ops Status — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OpsStatusPage,
});

type Stage = "stable" | "fallback" | "blocked";

const SCREENS: { route: string; label: string; stage: Stage; source: string; note: string }[] = [
  { route: "/dashboard", label: "Dashboard", stage: "stable", source: "tracks + courses + certificates", note: "Resumo real (Sprint 6)" },
  { route: "/perfil", label: "Perfil", stage: "stable", source: "profiles", note: "Lookup por user.id (Sprint 6)" },
  { route: "/trilhas", label: "Trilhas", stage: "stable", source: "tracks", note: "Dados reais + fallback mock" },
  { route: "/catalogo", label: "Catálogo de cursos", stage: "stable", source: "courses", note: "Dados reais + fallback mock" },
  { route: "/curso/$slug", label: "Curso detalhe", stage: "stable", source: "courses + modules", note: "FK tolerante" },
  { route: "/certificados", label: "Certificados", stage: "stable", source: "certificates", note: "Listagem real" },
  { route: "/conquistas", label: "Conquistas", stage: "stable", source: "achievements + user_achievements", note: "Sprint 7" },
  { route: "/admin", label: "Admin overview", stage: "fallback", source: "getUser()", note: "Gate simples — user_roles ausente" },
  { route: "/quiz/$id", label: "Quiz", stage: "blocked", source: "questions", note: "Tabela ausente — manter mock" },
];

const PUBLIC_FUNNEL = [
  { route: "/", label: "Landing" },
  { route: "/trilhas", label: "Trilhas (público)" },
  { route: "/catalogo", label: "Catálogo (público)" },
  { route: "/planos", label: "Planos" },
  { route: "/certificado/$id", label: "Validação de certificado" },
  { route: "/cadastro", label: "Cadastro" },
  { route: "/login", label: "Login" },
];

const AUDIT_TABLES = [
  "profiles", "tracks", "courses", "modules", "certificates",
  "quiz_attempts", "achievements", "user_achievements",
];

function OpsStatusPage() {
  const { user, configured } = useAuth();
  const [reachable, setReachable] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    Promise.all(
      AUDIT_TABLES.map((t) => sb.from(t).select("*", { count: "exact", head: true }).then((r) => !r.error)),
    ).then((r) => setReachable(r.filter(Boolean).length));
  }, []);

  const stable = SCREENS.filter((s) => s.stage === "stable").length;
  const fallback = SCREENS.filter((s) => s.stage === "fallback").length;
  const blocked = SCREENS.filter((s) => s.stage === "blocked").length;

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sprint 9 · Operação e escala</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Ops status</h1>
          <p className="text-sm text-muted-foreground">
            Visão operacional consolidada: telas estáveis, telas com fallback, auth, RLS e integração Supabase.
            Nenhum recurso novo é criado.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Activity} label="Telas estáveis" value={`${stable}/${SCREENS.length}`} tone="ok" />
          <Kpi icon={Layers} label="Fallback" value={String(fallback)} tone="warn" />
          <Kpi icon={Circle} label="Bloqueadas" value={String(blocked)} tone="muted" />
          <Kpi
            icon={Database}
            label="Tabelas reais"
            value={reachable === null ? "…" : `${reachable}/${AUDIT_TABLES.length}`}
            tone="ok"
          />
        </section>

        <Card title="Auth e gate admin">
          <Row ok={configured} label="Client Supabase ativo (publishable key, build-time)" />
          <Row ok={!!user} partial label={user ? `Sessão ativa: ${user.email}` : "Sem sessão ativa no momento"} />
          <Row ok={true} label="Decisão de acesso via supabase.auth.getUser()" />
          <Row ok={true} label="signIn / signUp / signOut conectados" />
          <Row ok={true} partial label="Admin overview com gate simples (user_roles pendente)" />
        </Card>

        <Card title="Telas do produto">
          <ul className="divide-y divide-border/40">
            {SCREENS.map((s) => (
              <li key={s.route} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <StageIcon stage={s.stage} />
                  <div>
                    <span className="font-mono text-xs">{s.label}</span>
                    <p className="text-[11px] text-muted-foreground">{s.note}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{s.source}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Funil público (conversão)">
          <ul className="grid gap-2 sm:grid-cols-2">
            {PUBLIC_FUNNEL.map((p) => (
              <li key={p.route} className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-card/40 px-3 py-2 text-sm">
                <span>{p.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{p.route}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Integração Supabase">
          <Row ok={!!SUPABASE_URL} label={`URL: ${SUPABASE_URL || "—"}`} />
          <Row ok={!!SUPABASE_PROJECT_REF} label={`Project ref: ${SUPABASE_PROJECT_REF || "—"}`} />
          <Row ok={true} label="Sem service_role, sem secret keys no frontend" />
          <Row ok={true} label="Nenhum recurso novo criado nesta sprint (tables, policies, functions, triggers, buckets)" />
        </Card>

        <div className="flex flex-wrap gap-3 text-xs">
          <Link to="/system/status" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">
            /system/status
          </Link>
          <Link to="/system/schema" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">
            /system/schema
          </Link>
          <Link to="/system/security-status" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">
            /system/security-status
          </Link>
        </div>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Kpi({
  icon: Icon, label, value, tone,
}: { icon: typeof Activity; label: string; value: string; tone: "ok" | "warn" | "muted" }) {
  const c = tone === "ok" ? "text-emerald-500" : tone === "warn" ? "text-amber-500" : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${c}`} /> {label}
      </div>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function StageIcon({ stage }: { stage: Stage }) {
  if (stage === "stable") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  if (stage === "fallback") return <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />;
  return <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />;
}

function Row({ ok, partial, label }: { ok: boolean; partial?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm">
      {ok && !partial ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      ) : partial ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      ) : (
        <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
      )}
      <span className="text-foreground">{label}</span>
    </div>
  );
}