import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({ meta: [{ title: "Recuperar senha — FCIA Academy" }, { name: "description", content: "Receba um link para redefinir sua senha." }] }),
  component: RecoverPage,
});

function RecoverPage() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para o seu e-mail." footer={<><Link to="/login" className="text-primary hover:underline">Voltar para entrar</Link></>}>
      <AuthInput label="E-mail" type="email" placeholder="voce@email.com" />
      <AuthSubmit>Enviar link</AuthSubmit>
    </AuthShell>
  );
}
