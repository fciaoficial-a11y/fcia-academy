import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, ShieldCheck, Database, KeyRound, Lock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export const Route = createFileRoute("/system/setup")({
  head: () => ({
    meta: [
      { title: "Setup de Infraestrutura · FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SystemSetupPage,
});

type FieldKey =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "SUPABASE_PROJECT_REF"
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "SUPABASE_DB_URL";

const REQUIRED_FIELDS: { key: FieldKey; label: string; placeholder: string; secret?: boolean; hint: string }[] = [
  { key: "SUPABASE_URL", label: "SUPABASE_URL", placeholder: "https://<project-ref>.supabase.co", hint: "URL pública da API REST/Auth do projeto." },
  { key: "SUPABASE_ANON_KEY", label: "SUPABASE_ANON_KEY", placeholder: "eyJhbGciOi...", hint: "Chave pública (anon) — usada apenas nesta sessão.", secret: true },
  { key: "SUPABASE_PROJECT_REF", label: "SUPABASE_PROJECT_REF", placeholder: "awimyyqqnnohoixiqxwf", hint: "Identificador do projeto — exibido apenas para auditoria." },
];

const OPTIONAL_FIELDS: { key: FieldKey; label: string; placeholder: string; secret?: boolean; hint: string }[] = [
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "SUPABASE_SERVICE_ROLE_KEY (opcional)", placeholder: "eyJhbGciOi...", hint: "Placeholder — não utilizado nesta fase.", secret: true },
  { key: "SUPABASE_DB_URL", label: "SUPABASE_DB_URL (opcional)", placeholder: "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres", hint: "Placeholder — não utilizado nesta fase.", secret: true },
];

type TestResult =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      database: string;
      schema: string;
      tables: string[];
    };

function SystemSetupPage() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    SUPABASE_URL: "",
    SUPABASE_ANON_KEY: "",
    SUPABASE_PROJECT_REF: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    SUPABASE_DB_URL: "",
  });
  const [environment, setEnvironment] = useState("production");
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<TestResult>({ status: "idle" });

  const requiredFilled = useMemo(
    () => REQUIRED_FIELDS.every((f) => values[f.key].trim().length > 0),
    [values],
  );
  const canTest = requiredFilled && confirmed && result.status !== "loading";

  const mask = (v: string) => (v.length <= 8 ? "•".repeat(v.length) : `${v.slice(0, 4)}…${v.slice(-4)}`);

  async function handleTest() {
    setResult({ status: "loading" });
    try {
      const baseUrl = values.SUPABASE_URL.trim().replace(/\/$/, "");
      const apikey = values.SUPABASE_ANON_KEY.trim();
      if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(baseUrl)) {
        throw new Error(
          "SUPABASE_URL inválida. Formato esperado: https://<project-ref>.supabase.co (sem barra final, sem /rest/v1).",
        );
      }
      const res = await fetch(`${baseUrl}/rest/v1/`, {
        method: "GET",
        headers: { apikey, Authorization: `Bearer ${apikey}` },
      });
      const raw = await res.text();
      if (!res.ok) {
        let detail = raw.slice(0, 300);
        try {
          const j = JSON.parse(raw) as { message?: string; hint?: string };
          detail = [j.message, j.hint].filter(Boolean).join(" — ") || detail;
        } catch {
          /* keep raw */
        }
        const hint401 =
          res.status === 401
            ? " · Verifique se a ANON_KEY corresponde exatamente ao projeto da URL informada (e não é a service_role nem chave de outro projeto)."
            : "";
        throw new Error(`HTTP ${res.status} — ${detail || res.statusText}${hint401}`);
      }
      const spec = JSON.parse(raw) as { definitions?: Record<string, unknown> };
      const tables = Object.keys(spec.definitions ?? {}).sort();
      setResult({
        status: "ok",
        database: "postgres",
        schema: "public",
        tables,
      });
    } catch (err) {
      setResult({
        status: "error",
        message: err instanceof Error ? err.message : "Erro desconhecido ao consultar a API.",
      });
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <Badge variant="outline" className="gap-1.5">
            <Lock className="h-3 w-3" /> Área restrita · Infraestrutura
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Setup de Infraestrutura</h1>
          <p className="text-sm text-muted-foreground">
            Configuração controlada do projeto Supabase oficial da FCIA Academy. Nenhum valor é
            persistido, transmitido ou conectado nesta tela.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Modo somente-leitura</AlertTitle>
          <AlertDescription>
            Esta tela é apenas para auditoria visual dos parâmetros. Nada será salvo, nenhum secret
            será gravado e nenhuma conexão será aberta sem autorização explícita.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5" /> Placeholders Supabase
            </CardTitle>
            <CardDescription>
              Preencha os campos manualmente. Apenas <code className="rounded bg-muted px-1 font-mono text-xs">SUPABASE_URL</code> e{" "}
              <code className="rounded bg-muted px-1 font-mono text-xs">SUPABASE_ANON_KEY</code> são usados nesta fase.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <Label htmlFor={f.key}>{f.label}</Label>
                <Input
                  id={f.key}
                  type={f.secret ? "password" : "text"}
                  autoComplete="off"
                  placeholder={f.placeholder}
                  value={values[f.key]}
                  onChange={(e) => setValues((p) => ({ ...p, [f.key]: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">{f.hint}</p>
              </div>
            ))}
            <div className="space-y-1.5">
              <Label htmlFor="environment">Ambiente</Label>
              <select
                id="environment"
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="production">production</option>
                <option value="staging">staging</option>
                <option value="development">development</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" /> Auditoria de parâmetros
            </CardTitle>
            <CardDescription>Revisão antes de qualquer tentativa de conexão.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <Row label="URL informada" value={values.SUPABASE_URL || "—"} />
              <Row label="Project Ref" value={values.SUPABASE_PROJECT_REF || "—"} />
              <Row label="Ambiente" value={environment} />
              <Row label="Tipo de conexão" value="Supabase REST (read-only)" />
              <Row label="Estratégia de auth" value="anon key (client-side)" />
              <Row
                label="ANON_KEY"
                value={values.SUPABASE_ANON_KEY ? mask(values.SUPABASE_ANON_KEY) : "—"}
              />
              <Row
                label="SERVICE_ROLE_KEY"
                value={values.SUPABASE_SERVICE_ROLE_KEY ? `${mask(values.SUPABASE_SERVICE_ROLE_KEY)} (não usado)` : "— (opcional)"}
              />
              <Row
                label="DB_URL"
                value={values.SUPABASE_DB_URL ? `${mask(values.SUPABASE_DB_URL)} (não usado)` : "— (opcional)"}
              />
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={requiredFilled ? "default" : "secondary"}>
                {requiredFilled ? "Campos obrigatórios prontos" : "Preencha URL + ANON_KEY + REF"}
              </Badge>
              <Badge variant="outline">Persistência: desativada</Badge>
              <Badge variant="outline">Modo: READ ONLY</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Confirmação explícita
            </CardTitle>
            <CardDescription>
              O teste só é habilitado após confirmação. Apenas leituras read-only são executadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-start gap-3 rounded-md border border-border bg-card/50 p-3 text-sm">
              <Checkbox
                checked={confirmed}
                onCheckedChange={(v) => setConfirmed(v === true)}
                className="mt-0.5"
              />
              <span className="text-foreground">
                Confirmo que os parâmetros acima foram revisados e autorizo uma chamada{" "}
                <strong>read-only</strong> à URL informada. Nenhum recurso será criado, alterado ou removido.
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button disabled={!canTest} onClick={handleTest}>
                {result.status === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testando…
                  </>
                ) : (
                  "Testar conexão (read-only)"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.status === "ok" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : result.status === "error" ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Database className="h-5 w-5" />
              )}
              Resultado da conexão
            </CardTitle>
            <CardDescription>Saída da leitura read-only do schema público.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {result.status === "idle" && (
              <p className="text-sm text-muted-foreground">Nenhum teste executado.</p>
            )}
            {result.status === "loading" && (
              <p className="text-sm text-muted-foreground">Consultando endpoint REST…</p>
            )}
            {result.status === "error" && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Falha na conexão</AlertTitle>
                <AlertDescription>{result.message}</AlertDescription>
              </Alert>
            )}
            {result.status === "ok" && (
              <>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <Row label="URL conectada" value={values.SUPABASE_URL} />
                  <Row label="Project Ref conectado" value={values.SUPABASE_PROJECT_REF || "—"} />
                  <Row label="current_database" value={result.database} />
                  <Row label="current_schema" value={result.schema} />
                  <Row label="Tabelas encontradas" value={String(result.tables.length)} />
                  <Row label="Status" value="READ ONLY" />
                </dl>
                <div>
                  <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                    Lista de tabelas (schema public)
                  </p>
                  {result.tables.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma tabela exposta via REST.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {result.tables.map((t) => (
                        <Badge key={t} variant="secondary" className="font-mono text-xs">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Nenhum recurso foi criado</AlertTitle>
                  <AlertDescription>
                    A chamada usou apenas o endpoint <code>/rest/v1/</code> com a anon key, em modo
                    somente leitura. Nenhuma migration, tabela, policy, função, trigger ou bucket foi
                    tocado.
                  </AlertDescription>
                </Alert>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card/50 p-3">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all font-mono text-sm text-foreground">{value}</dd>
    </div>
  );
}