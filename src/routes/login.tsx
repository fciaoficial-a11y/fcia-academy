import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";
import { GoogleButton, AuthDivider } from "@/components/auth/GoogleButton";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — FCIA Academy" }, { name: "description", content: "Acesse sua conta na FCIA Academy." }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, configured } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) { setError("Supabase não configurado. Acesse /system/setup."); return; }
    setError(null); setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) setError(error);
    else navigate({ to: "/dashboard" });
  }

  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Bem-vindo de volta. Continue de onde parou."
      footer={<>Não tem conta? <Link to="/cadastro" className="text-primary hover:underline">Cadastre-se</Link></>}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={(v) => setEmail(v)} />
        <AuthInput label="Senha" type="password" placeholder="••••••••" value={password} onChange={(v) => setPassword(v)} />
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{loading ? "Entrando…" : ""}</span>
          <Link to="/recuperar-senha" className="text-primary hover:underline">Esqueci a senha</Link>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <AuthSubmit disabled={loading}>Entrar</AuthSubmit>
      </form>
      <AuthDivider />
      <GoogleButton label="Entrar com Google" />
    </AuthShell>
  );
}
