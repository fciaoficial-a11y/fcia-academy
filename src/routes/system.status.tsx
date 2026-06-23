import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, AlertCircle } from "lucide-react";
import {
  getSupabase,
  isSupabaseConfigured,
  SUPABASE_URL,
  SUPABASE_PROJECT_REF,
} from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/system/status")({
  head: () => ({
    meta: [
      { title: "Status — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SystemStatusPage,
});

const EXPECTED = [
  "profiles", "user_roles", "tracks", "courses", "modules",
  "questions", "quiz_attempts", "certificates", "xp_log",
  "gamification_profile", "enrollments", "ai_jobs",
];

const MOCK_STATUS: { screen: string; replaced: boolean; note: string }[] = [
  { screen: "trilhas", replaced: true, note: "Sprint 6 ✅ — bloco Dados reais + fallback mock" },
  { screen: "cursos (catálogo)", replaced: true, note: "Sprint 6 ✅ — bloco Dados reais + fallback mock" },
  { screen: "curso/[slug]", replaced: true, note: "Sprint 6 ✅ — courses + modules + fallback mock" },
  { screen: "perfil", replaced: true, note: "Sprint 6 ✅ — profiles por user.id (fallback p/ XP)" },
  { screen: "certificados", replaced: true, note: "Sprint 6 ✅ — certificates + fallback mock" },
  { screen: "dashboard", replaced: true, note: "Sprint 6 ✅ — resumo real (tracks/courses/certificates)" },
  { screen: "quiz", replaced: false, note: "Bloqueada — questions ausente (quiz_attempts ✅)" },
  { screen: "conquistas", replaced: false, note: "Avaliar mapeamento alternativo: achievements / user_achievements" },
  { screen: "admin overview", replaced: false, note: "Bloqueada — user_roles ausente, gate fica em getUser()" },
];

function SystemStatusPage() {
  const { user, configured } = useAuth();
  const [found, setFound] = useState<number | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    let n = 0;
    Promise.all(
      EXPECTED.map((t) => sb.from(t).select("*", { count: "exact", head: true }).then((r) => !r.error)),
    ).then((results) => {
      n = results.filter(Boolean).length;
      setFound(n);
    });
  }, []);

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sprint 5B · Status</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Aderência ao master document</h1>
        </header>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Infra</h3>
          <Check ok={configured} label="Client Supabase inicializado" />
          <Check ok={!!SUPABASE_URL} label={`URL ativa: ${SUPABASE_URL || "—"}`} />
          <Check ok={!!SUPABASE_PROJECT_REF} label={`Project ref: ${SUPABASE_PROJECT_REF || "—"}`} />
          <Check ok={configured} label="Publishable key registrada no .env (build-time)" />
          <Check ok={true} label="Nenhum recurso novo foi criado no banco" />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Schema</h3>
          <Check
            ok={(found ?? 0) > 0}
            partial={found !== null && found < EXPECTED.length}
            label={
              found === null
                ? "Diagnosticando…"
                : `${found} de ${EXPECTED.length} tabelas acessíveis com publishable key`
            }
          />
          <Link to="/system/schema" className="mt-3 inline-block text-xs text-primary underline">
            Ver diagnóstico completo →
          </Link>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Autenticação</h3>
          <Check ok={configured} label="supabase.auth conectado (getUser, getSession, signIn, signUp, signOut)" />
          <Check ok={!!user} partial label={user ? `Sessão ativa: ${user.email}` : "Sem sessão ativa no momento"} />
          <Check ok={true} label="Gate admin via getUser() (has_role pendente)" />
        </section>

        <section className="rounded-2xl border border-border/60 bg-card/60 p-6">
          <h3 className="mb-4 text-sm font-semibold">Substituição de mocks</h3>
          <ul className="space-y-2 text-sm">
            {MOCK_STATUS.map((m) => (
              <li
                key={m.screen}
                className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 last:border-none last:pb-0"
              >
                <div className="flex items-center gap-2">
                  {m.replaced ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="font-mono text-xs">{m.screen}</span>
                </div>
                <span className="text-xs text-muted-foreground">{m.note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function Check({ ok, partial, label }: { ok: boolean; partial?: boolean; label: string }) {
  return (
    <div className="flex items-start gap-2 py-1.5 text-sm">
      {ok && !partial ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
      ) : partial ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      ) : (
        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className="text-foreground">{label}</span>
    </div>
  );
}