import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastro — FCIA Academy" }, { name: "description", content: "Crie sua conta gratuita na FCIA Academy." }] }),
  component: SignUpPage,
});

function SignUpPage() {
  const { signUp, configured } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) { setError("Supabase não configurado."); return; }
    setError(null); setSuccess(null); setLoading(true);
    const { error } = await signUp(email, password, name);
    setLoading(false);
    if (error) setError(error);
    else { setSuccess("Conta criada. Vamos personalizar sua experiência."); setTimeout(() => navigate({ to: "/onboarding" }), 800); }
  }

  return (
    <AuthShell title="Crie sua conta" subtitle="Comece grátis. Sem cartão." footer={<>Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="Nome completo" placeholder="Seu nome" value={name} onChange={setName} />
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
