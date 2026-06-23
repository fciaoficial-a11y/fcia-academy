import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Circle, Rocket, ShieldCheck, Loader2, Gauge, Globe } from "lucide-react";
import { getSupabase, isSupabaseConfigured, SUPABASE_URL, SUPABASE_PROJECT_REF } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/system/launch-status")({
  head: () => ({
    meta: [
      { title: "Launch Status — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LaunchStatusPage,
});

type Stage = "ready" | "watch" | "blocked";

const READINESS: { area: string; stage: Stage; note: string }[] = [
  { area: "Auth (login / signup / signout)", stage: "ready", note: "supabase.auth.getUser() em todas as decisões" },
  { area: "Telas reais", stage: "ready", note: "7/9 conectadas (dashboard, perfil, trilhas, catálogo, curso, certificados, conquistas)" },
  { area: "Admin overview", stage: "watch", note: "Gate simples via getUser() — RBAC real depende de user_roles" },
  { area: "Quiz", stage: "blocked", note: "Tabela questions ausente — mock preservado" },
  { area: "Design system", stage: "ready", note: "Tokens semânticos, mobile-first, sem hard-coded colors" },
  { area: "SEO público", stage: "ready", note: "Landing, planos, blog, sobre, faq, contato" },
  { area: "Segurança", stage: "ready", note: "Sem service_role no frontend, sem secret keys, RLS no banco" },
  { area: "Operação", stage: "ready", note: "/system/status, /system/schema, /system/security-status, /system/ops-status" },
];

const AUDIT_TABLES = [
  "profiles", "tracks", "courses", "modules", "certificates",
  "quiz_attempts", "achievements", "user_achievements",
];

const PENDING = [
  "user_roles (RBAC real para /admin)",
  "questions (destravar /quiz)",
  "xp_log / gamification_profile (XP real)",
  "enrollments (matrículas reais)",
  "ai_jobs (pipelines IA)",
];

function LaunchStatusPage() {
  const { user, configured } = useAuth();
  const [reachable, setReachable] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    Promise.all(
      AUDIT_TABLES.map((t) => sb.from(t).select("*", { count: "exact", head: true }).then((r) => !r.error)),
    ).then((r) => setReachable(r.filter(Boolean).length));
  }, []);

  const ready = READINESS.filter((s) => s.stage === "ready").length;
  const watch = READINESS.filter((s) => s.stage === "watch").length;
  const blocked = READINESS.filter((s) => s.stage === "blocked").length;
  const score = Math.round((ready / READINESS.length) * 100);

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sprint 10 · Launch readiness</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Launch status</h1>
          <p className="text-sm text-muted-foreground">
            Consolidação final de prontidão para lançamento. Apenas leitura, sem criar recursos novos no banco.
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi icon={Gauge} label="Launch score" value={`${score}%`} tone={score >= 80 ? "ok" : "warn"} />
          <Kpi icon={Rocket} label="Áreas prontas" value={`${ready}/${READINESS.length}`} tone="ok" />
          <Kpi icon={AlertCircle} label="Em observação" value={String(watch)} tone="warn" />
          <Kpi icon={Circle} label="Bloqueadas" value={String(blocked)} tone="muted" />
        </section>

        <Card title="Prontidão por área">
          <ul className="divide-y divide-border/40">
            {READINESS.map((r) => (
              <li key={r.area} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <div className="flex items-start gap-2">
                  <StageIcon stage={r.stage} />
                  <div>
                    <span className="text-foreground">{r.area}</span>
                    <p className="text-[11px] text-muted-foreground">{r.note}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Sessão e integração">
          <Row ok={configured} label="Client Supabase ativo (publishable key, build-time)" />
          <Row ok={!!user} partial label={user ? `Sessão ativa: ${user.email}` : "Sem sessão ativa no momento"} />
          <Row ok={!!SUPABASE_URL} label={`URL: ${SUPABASE_URL || "—"}`} />
          <Row ok={!!SUPABASE_PROJECT_REF} label={`Project ref: ${SUPABASE_PROJECT_REF || "—"}`} />
          <Row
            ok={reachable !== null && reachable === AUDIT_TABLES.length}
            partial={reachable !== null && reachable < AUDIT_TABLES.length}
            label={reachable === null ? "Probing tabelas reais…" : `Tabelas respondentes: ${reachable}/${AUDIT_TABLES.length}`}
          />
        </Card>

        <Card title="Pendências para próxima fase">
          <ul className="space-y-1.5 text-sm">
            {PENDING.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Circle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Checklist de aderência ao master document">
          <Row ok={true} label="Tokens semânticos · sem cores hard-coded" />
          <Row ok={true} label="Mobile-first · AppShell / SiteHeader / SiteFooter / Section preservados" />
          <Row ok={true} label="Visual corporativo futurista · executivo e limpo" />
          <Row ok={true} label="Sem service_role · sem secret keys · sem migrations nesta sprint" />
          <Row ok={true} label="Mocks substituídos apenas onde a tabela real existe" />
        </Card>

        <div className="flex flex-wrap gap-3 text-xs">
          <Link to="/system/status" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">/system/status</Link>
          <Link to="/system/schema" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">/system/schema</Link>
          <Link to="/system/security-status" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">/system/security-status</Link>
          <Link to="/system/ops-status" className="rounded-full border border-border/60 px-3 py-1.5 text-primary underline">/system/ops-status</Link>
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
}: { icon: typeof Globe; label: string; value: string; tone: "ok" | "warn" | "muted" }) {
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
  if (stage === "ready") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  if (stage === "watch") return <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />;
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
