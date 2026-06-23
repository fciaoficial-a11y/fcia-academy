import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Lock, Loader2 } from "lucide-react";
import { getSupabase, isSupabaseConfigured } from "@/integrations/supabase/client";

export const Route = createFileRoute("/system/schema")({
  head: () => ({
    meta: [
      { title: "Schema — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SystemSchemaPage,
});

type DomainGroup = { domain: string; tables: string[] };

const EXPECTED: DomainGroup[] = [
  { domain: "Identidade", tables: ["profiles", "user_roles"] },
  { domain: "Catálogo", tables: ["tracks", "courses", "modules"] },
  { domain: "Avaliação", tables: ["questions", "quiz_attempts"] },
  { domain: "Certificação", tables: ["certificates"] },
  { domain: "Gamificação", tables: ["xp_log", "gamification_profile"] },
  { domain: "Matrículas", tables: ["enrollments"] },
  { domain: "IA", tables: ["ai_jobs"] },
];

const ALTERNATIVES: { domain: string; expected: string; candidate: string; note: string }[] = [
  { domain: "Gamificação", expected: "gamification_profile", candidate: "user_achievements", note: "Tabela real presente no banco" },
  { domain: "Gamificação", expected: "xp_log", candidate: "achievements", note: "Tabela real presente no banco" },
  { domain: "Matrículas", expected: "enrollments", candidate: "payments", note: "Tabela real presente no banco" },
];

type Probe = { status: "found" | "missing" | "rls" | "pending"; count: number | null; message: string };

async function probe(table: string): Promise<Probe> {
  try {
    const sb = getSupabase();
    const { count, error } = await sb.from(table).select("*", { count: "exact", head: true });
    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("not exist") || msg.includes("not found") || msg.includes("schema cache")) {
        return { status: "missing", count: null, message: "Tabela ausente" };
      }
      if (msg.includes("permission") || msg.includes("rls") || msg.includes("denied")) {
        return { status: "rls", count: null, message: "RLS impede leitura anônima" };
      }
      return { status: "pending", count: null, message: error.message };
    }
    return { status: "found", count: count ?? 0, message: "Acessível" };
  } catch (e) {
    return { status: "pending", count: null, message: e instanceof Error ? e.message : "Erro" };
  }
}

function SystemSchemaPage() {
  const [results, setResults] = useState<Record<string, Probe>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const all = EXPECTED.flatMap((g) => g.tables);
    Promise.all(all.map(async (t) => [t, await probe(t)] as const)).then((entries) => {
      setResults(Object.fromEntries(entries));
      setLoading(false);
    });
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-center text-sm text-muted-foreground">
        <div>
          Supabase não configurado. Acesse <a className="text-primary underline" href="/system/setup">/system/setup</a>.
        </div>
      </main>
    );
  }

  const all = EXPECTED.flatMap((g) => g.tables);
  const found = all.filter((t) => results[t]?.status === "found").length;
  const missing = all.filter((t) => results[t]?.status === "missing").length;
  const rls = all.filter((t) => results[t]?.status === "rls").length;

  return (
    <main className="min-h-screen bg-background px-4 py-16 text-foreground">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sprint 5B · Schema</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Diagnóstico degradado</h1>
          <p className="text-sm text-muted-foreground">
            Probe via <code className="rounded bg-muted px-1">select count head</code> com publishable key.
            Nenhum recurso foi criado. Tabelas que respondem RLS aparecem como protegidas.
          </p>
        </header>

        <section className="grid grid-cols-3 gap-3 text-center text-sm">
          <Stat label="Encontradas" value={found} tone="ok" />
          <Stat label="RLS / protegidas" value={rls} tone="warn" />
          <Stat label="Ausentes" value={missing} tone="bad" />
        </section>

        {EXPECTED.map((group) => (
          <section key={group.domain} className="rounded-2xl border border-border/60 bg-card/60 p-5">
            <h3 className="mb-3 text-sm font-semibold">{group.domain}</h3>
            <ul className="space-y-2 text-sm">
              {group.tables.map((t) => {
                const r = results[t];
                return (
                  <li key={t} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-none last:pb-0">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      {loading || !r ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : r.status === "found" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : r.status === "rls" ? (
                        <Lock className="h-4 w-4 text-amber-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-destructive" />
                      )}
                      <span>{t}</span>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      {!r ? "—" : r.status === "found" ? `${r.count} linhas` : r.message}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "bad" }) {
  const cls =
    tone === "ok"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-500"
      : tone === "warn"
      ? "border-amber-500/30 bg-amber-500/5 text-amber-500"
      : "border-destructive/40 bg-destructive/5 text-destructive";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
    </div>
  );
}