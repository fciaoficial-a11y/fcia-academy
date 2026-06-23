import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — FCIA Academy" },
      { name: "description", content: "Defina uma nova senha de acesso." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    // Supabase recovery link sets a session via hash; ensure we have it.
    supabase.auth.getSession().then(({ data }) => {
      setReady(!!data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (password.length < 8) { setMsg({ ok: false, text: "Mínimo 8 caracteres." }); return; }
    if (password !== confirm) { setMsg({ ok: false, text: "As senhas não coincidem." }); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setMsg({ ok: false, text: error.message }); return; }
    setMsg({ ok: true, text: "Senha atualizada. Redirecionando…" });
    setTimeout(() => navigate({ to: "/dashboard" }), 800);
  }

  return (
    <AuthShell
      title="Redefinir senha"
      subtitle="Escolha uma nova senha segura."
      footer={<Link to="/login" className="text-primary hover:underline">Voltar para entrar</Link>}
    >
      {!ready ? (
        <p className="text-sm text-muted-foreground">
          Link inválido ou expirado. Solicite um novo em{" "}
          <Link to="/recuperar-senha" className="text-primary hover:underline">recuperar senha</Link>.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthInput label="Nova senha" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={setPassword} />
          <AuthInput label="Confirmar senha" type="password" placeholder="Repita a senha" value={confirm} onChange={setConfirm} />
          {msg && <p className={`text-xs ${msg.ok ? "text-emerald-500" : "text-destructive"}`}>{msg.text}</p>}
          <AuthSubmit disabled={loading}>{loading ? "Salvando…" : "Salvar nova senha"}</AuthSubmit>
        </form>
      )}
    </AuthShell>
  );
}