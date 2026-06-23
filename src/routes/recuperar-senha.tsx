import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar senha — FCIA Academy" }, { name: "description", content: "Receba um link para redefinir sua senha." }] }),
  component: RecoverPage,
});

function RecoverPage() {
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!configured) { setMsg({ ok: false, text: "Supabase não configurado." }); return; }
    setMsg(null); setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    setMsg(error ? { ok: false, text: error } : { ok: true, text: "Link enviado. Verifique seu e-mail." });
  }

  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para o seu e-mail." footer={<><Link to="/login" className="text-primary hover:underline">Voltar para entrar</Link></>}>
      <form onSubmit={onSubmit} className="space-y-4">
        <AuthInput label="E-mail" type="email" placeholder="voce@email.com" value={email} onChange={setEmail} />
        {msg && <p className={`text-xs ${msg.ok ? "text-emerald-500" : "text-destructive"}`}>{msg.text}</p>}
        <AuthSubmit disabled={loading}>{loading ? "Enviando…" : "Enviar link"}</AuthSubmit>
      </form>
    </AuthShell>
  );
}
