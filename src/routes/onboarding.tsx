import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/onboarding")({
  validateSearch: z.object({ next: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Bem-vindo — FCIA Academy" },
      { name: "description", content: "Conte um pouco sobre você para personalizar sua jornada." },
    ],
  }),
  component: OnboardingPage,
});

const OBJECTIVES = [
  { v: "certificacao", l: "Obter certificação" },
  { v: "aprender", l: "Aprender um novo tema" },
  { v: "carreira", l: "Avançar na carreira" },
  { v: "atualizar", l: "Atualizar conhecimentos" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const { user, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [objective, setObjective] = useState(OBJECTIVES[0].v);
  const [interest, setInterest] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goNext = () => {
    if (next && next.startsWith("/")) {
      navigate({ to: next });
    } else {
      navigate({ to: "/dashboard" });
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate({ to: "/login" }); return; }
    supabase.from("profiles").select("full_name, objective, onboarded_at").eq("id", user.id).maybeSingle()
      .then(({ data }: { data: any }) => {
        if (data?.onboarded_at) { goNext(); return; }
        if (data?.full_name) setName(data.full_name);
        if (data?.objective) setObjective(data.objective);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null); setLoading(true);
    const { error: err } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      full_name: name.trim() || null,
      objective,
      interest: interest.trim() || null,
      onboarded_at: new Date().toISOString(),
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    goNext();
  }

  return (
    <AuthShell
      title="Vamos personalizar"
      subtitle="Três respostas rápidas para começar."
      footer={<Link to="/dashboard" className="text-muted-foreground hover:underline">Pular por agora</Link>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="Como podemos te chamar?" placeholder="Seu nome" value={name} onChange={setName} />
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-foreground">Seu objetivo principal</span>
          <select
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            className="h-11 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring/40"
          >
            {OBJECTIVES.map((o) => (
              <option key={o.v} value={o.v}>{o.l}</option>
            ))}
          </select>
        </label>
        <AuthInput label="Interesse inicial (opcional)" placeholder="Ex.: cibersegurança, IA, gestão" value={interest} onChange={setInterest} />
        {error && <p className="text-xs text-destructive">{error}</p>}
        <AuthSubmit disabled={loading}>{loading ? "Salvando…" : "Concluir e explorar"}</AuthSubmit>
      </form>
    </AuthShell>
  );
}