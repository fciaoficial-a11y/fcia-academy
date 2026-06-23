import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/cadastro")({
  validateSearch: z.object({ next: z.string().optional().catch(undefined) }),
  head: () => ({ meta: [{ title: "Cadastro — FCIA Academy" }, { name: "description", content: "Crie sua conta gratuita na FCIA Academy." }] }),
  component: SignUpPage,
});

function onlyDigits(v: string) { return v.replace(/\D/g, ""); }
function maskCpf(v: string) {
  const d = onlyDigits(v).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function SignUpPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) { setError("Supabase não configurado."); return; }
    const cpfDigits = onlyDigits(cpf);
    if (!name.trim()) { setError("Informe seu nome completo."); return; }
    if (cpfDigits.length !== 11) { setError("CPF inválido."); return; }
    setError(null); setSuccess(null); setLoading(true);
    const { error } = await signUp(email, password, name);
    if (error) { setLoading(false); setError(error); return; }
    // Persistir CPF + nome no profile (RLS: id = auth.uid()).
    const { data: sess } = await supabase.auth.getUser();
    if (sess.user) {
      await supabase.from("profiles").upsert({
        id: sess.user.id,
        email: sess.user.email,
        full_name: name.trim(),
        cpf: cpfDigits,
      });
    }
    setLoading(false);
    setSuccess("Conta criada. Vamos personalizar sua experiência.");
    setTimeout(() => navigate({ to: "/onboarding", search: next ? { next } : {} }), 600);
  }

  return (
    <AuthShell title="Crie sua conta" subtitle="Comece grátis. Sem cartão." footer={<>Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="Nome completo" placeholder="Seu nome" value={name} onChange={setName} />
        <AuthInput label="CPF" placeholder="000.000.000-00" value={cpf} onChange={(v) => setCpf(maskCpf(v))} />
        <AuthInput label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={setEmail} />
        <AuthInput label="Senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={setPassword} />
        {error && <p className="text-xs text-destructive">{error}</p>}
        {success && <p className="text-xs text-emerald-500">{success}</p>}
        <AuthSubmit disabled={loading}>{loading ? "Criando…" : "Criar conta"}</AuthSubmit>
      </form>
      <AuthDivider />
      <GoogleButton label="Cadastrar com Google" />
    </AuthShell>
  );
}
