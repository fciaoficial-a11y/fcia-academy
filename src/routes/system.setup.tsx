import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ShieldCheck, Database, KeyRound, Lock } from "lucide-react";

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

const FIELDS: { key: FieldKey; label: string; placeholder: string; secret?: boolean; hint: string }[] = [
  { key: "SUPABASE_URL", label: "SUPABASE_URL", placeholder: "https://<project-ref>.supabase.co", hint: "URL pública da API REST/Auth do projeto." },
  { key: "SUPABASE_ANON_KEY", label: "SUPABASE_ANON_KEY", placeholder: "eyJhbGciOi...", hint: "Chave pública (anon) — segura para frontend.", secret: true },
  { key: "SUPABASE_PROJECT_REF", label: "SUPABASE_PROJECT_REF", placeholder: "awimyyqqnnohoixiqxwf", hint: "Identificador do projeto Supabase oficial." },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "SUPABASE_SERVICE_ROLE_KEY", placeholder: "eyJhbGciOi...", hint: "Chave privilegiada — uso exclusivo server-side.", secret: true },
  { key: "SUPABASE_DB_URL", label: "SUPABASE_DB_URL", placeholder: "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres", hint: "String de conexão direta ao Postgres.", secret: true },
];

const AUTHORIZED_REF = "awimyyqqnnohoixiqxwf";

function SystemSetupPage() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    SUPABASE_URL: "",
    SUPABASE_ANON_KEY: "",
    SUPABASE_PROJECT_REF: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    SUPABASE_DB_URL: "",
  });
  const [environment, setEnvironment] = useState("production");

  const filledCount = useMemo(() => Object.values(values).filter((v) => v.trim().length > 0).length, [values]);
  const refMatches = values.SUPABASE_PROJECT_REF.trim() === AUTHORIZED_REF;
  const allFilled = filledCount === FIELDS.length;

  const mask = (v: string) => (v.length <= 8 ? "•".repeat(v.length) : `${v.slice(0, 4)}…${v.slice(-4)}`);

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
              Preencha os campos manualmente. Project Ref autorizado:{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{AUTHORIZED_REF}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {FIELDS.map((f) => (
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
              <Row label="Tipo de conexão" value="Supabase (REST + Postgres direto)" />
              <Row label="Estratégia de auth" value="anon (client) + service_role (server-only)" />
              <Row
                label="ANON_KEY"
                value={values.SUPABASE_ANON_KEY ? mask(values.SUPABASE_ANON_KEY) : "—"}
              />
              <Row
                label="SERVICE_ROLE_KEY"
                value={values.SUPABASE_SERVICE_ROLE_KEY ? mask(values.SUPABASE_SERVICE_ROLE_KEY) : "—"}
              />
              <Row label="DB_URL" value={values.SUPABASE_DB_URL ? mask(values.SUPABASE_DB_URL) : "—"} />
            </dl>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={allFilled ? "default" : "secondary"}>
                {filledCount}/{FIELDS.length} campos preenchidos
              </Badge>
              <Badge variant={refMatches ? "default" : "destructive"}>
                {refMatches ? "Project Ref autorizado ✓" : "Project Ref divergente"}
              </Badge>
              <Badge variant="outline">Persistência: desativada</Badge>
              <Badge variant="outline">Conexão: bloqueada</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Confirmação explícita
            </CardTitle>
            <CardDescription>
              Nenhuma conexão será aberta automaticamente. Aprovação manual é obrigatória.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Ao clicar abaixo, apenas um <strong>resumo de auditoria</strong> é registrado no console
              local. Nenhum dado é enviado a servidores, nenhum secret é gravado e nenhuma chamada à
              Supabase é executada.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!allFilled || !refMatches}
                onClick={() =>
                  console.info("[FCIA setup] Auditoria local:", {
                    url: values.SUPABASE_URL,
                    ref: values.SUPABASE_PROJECT_REF,
                    environment,
                    keys: {
                      anon: Boolean(values.SUPABASE_ANON_KEY),
                      service_role: Boolean(values.SUPABASE_SERVICE_ROLE_KEY),
                      db_url: Boolean(values.SUPABASE_DB_URL),
                    },
                  })
                }
              >
                Gerar resumo de auditoria
              </Button>
              <Button variant="outline" disabled>
                Testar conexão (requer autorização)
              </Button>
            </div>
            {!refMatches && values.SUPABASE_PROJECT_REF.length > 0 && (
              <p className="text-xs text-destructive">
                Project Ref difere do autorizado ({AUTHORIZED_REF}). Conexão permanece bloqueada.
              </p>
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