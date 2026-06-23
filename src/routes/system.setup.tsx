import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ShieldCheck, Database } from "lucide-react";

export const Route = createFileRoute("/system/setup")({
  head: () => ({
    meta: [
      { title: "Setup de Infraestrutura — FCIA Academy" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: SystemSetupPage,
});

type Status = "idle" | "testing" | "ok" | "error";

function SystemSetupPage() {
  const [url, setUrl] = useState("");
  const [key, setKey] = useState("");
  const [ref, setRef] = useState("");
  const [env, setEnv] = useState("development");
  const [tableName, setTableName] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [clientMsg, setClientMsg] = useState<string>("");
  const [readMsg, setReadMsg] = useState<string>("");

  const urlValid = useMemo(
    () => /^https:\/\/[a-z0-9-]+\.supabase\.(co|in)$/i.test(url.trim()),
    [url],
  );
  const filled = urlValid && key.trim().length > 20 && ref.trim().length > 0;
  const canTest = filled && confirmed;

  async function handleTest() {
    setStatus("testing");
    setClientMsg("");
    setReadMsg("");
    try {
      const client = createClient(url.trim(), key.trim(), {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      if (!client) throw new Error("Client não inicializado");
      setClientMsg("Client Supabase inicializado com sucesso.");

      if (tableName.trim()) {
        const { error } = await client
          .from(tableName.trim())
          .select("*", { count: "exact", head: true });
        if (error) {
          setReadMsg(
            `Leitura falhou: ${error.message}. Verifique o nome da tabela e as policies de RLS para anon.`,
          );
        } else {
          setReadMsg(`Leitura realizada com sucesso na tabela "${tableName.trim()}".`);
        }
      } else {
        setReadMsg("Nenhuma tabela informada — apenas inicialização do client validada.");
      }
      setStatus("ok");
    } catch (err) {
      setClientMsg(err instanceof Error ? err.message : "Erro desconhecido");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="space-y-2">
          <Badge variant="secondary" className="gap-1">
            <ShieldCheck className="size-3" /> Read-only · Frontend Client
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Setup de Infraestrutura
          </h1>
          <p className="text-sm text-muted-foreground">
            Validação manual da conexão Supabase usando apenas a publishable key.
            Nenhuma credencial é persistida — estado local apenas.
          </p>
        </header>

        <section className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h2 className="font-medium">Preenchimento manual</h2>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="url">SUPABASE_URL</Label>
              <Input
                id="url"
                placeholder="https://xxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              {url && !urlValid && (
                <p className="text-xs text-destructive">
                  Formato esperado: https://&lt;ref&gt;.supabase.co
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="key">SUPABASE_PUBLISHABLE_KEY</Label>
              <Input
                id="key"
                type="password"
                placeholder="eyJhbGciOi... (anon/publishable)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ref">SUPABASE_PROJECT_REF</Label>
              <Input
                id="ref"
                placeholder="abcdwxyz12345"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Ambiente</Label>
              <Select value={env} onValueChange={setEnv}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="table">
                Tabela pública para teste (opcional)
              </Label>
              <Input
                id="table"
                placeholder="ex: posts (deixe vazio para apenas inicializar o client)"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="font-medium">Auditoria de parâmetros</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <Row label="URL" value={url || "—"} />
            <Row label="Project Ref" value={ref || "—"} />
            <Row label="Ambiente" value={env} />
            <Row label="Tipo de conexão" value="Frontend Supabase Client" />
            <Row label="Estratégia de auth" value="publishable key + RLS" />
            <Row label="Persistência" value="Nenhuma (estado local)" />
          </dl>
        </section>

        <section className="rounded-xl border border-border bg-card p-6 space-y-3">
          <h2 className="font-medium">Confirmação explícita</h2>
          <label className="flex items-start gap-3 text-sm">
            <Checkbox
              checked={confirmed}
              onCheckedChange={(v) => setConfirmed(Boolean(v))}
              className="mt-0.5"
            />
            <span className="text-muted-foreground">
              Confirmo que os dados informados pertencem ao projeto correto, que
              a chave informada é a <strong>publishable/anon</strong> (nunca
              service_role) e autorizo um teste de leitura read-only.
            </span>
          </label>
          <Button onClick={handleTest} disabled={!canTest || status === "testing"}>
            {status === "testing" ? "Testando..." : "Testar conexão"}
          </Button>
        </section>

        {status !== "idle" && (
          <section className="rounded-xl border border-border bg-card p-6 space-y-3">
            <div className="flex items-center gap-2">
              {status === "ok" ? (
                <CheckCircle2 className="size-5 text-emerald-600" />
              ) : status === "error" ? (
                <AlertTriangle className="size-5 text-destructive" />
              ) : (
                <Database className="size-5 text-muted-foreground" />
              )}
              <h2 className="font-medium">Resultado da conexão</h2>
            </div>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Row label="URL conectada" value={url} />
              <Row label="Project Ref" value={ref} />
              <Row
                label="Status do client"
                value={clientMsg || (status === "testing" ? "Inicializando..." : "—")}
              />
              <Row
                label="Status da leitura"
                value={readMsg || (status === "testing" ? "Aguardando..." : "—")}
              />
            </dl>
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              Nenhum recurso foi criado. Operação 100% read-only via client público.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm font-medium break-all">{value}</dd>
    </div>
  );
}