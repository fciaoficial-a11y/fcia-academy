import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — FCIA Academy" }, { name: "description", content: "Acesse sua conta na FCIA Academy." }] }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthShell
      title="Entrar na sua conta"
      subtitle="Bem-vindo de volta. Continue de onde parou."
      footer={<>Não tem conta? <Link to="/cadastro" className="text-primary hover:underline">Cadastre-se</Link></>}
    >
      <AuthInput label="E-mail" type="email" placeholder="voce@email.com" />
      <AuthInput label="Senha" type="password" placeholder="••••••••" />
      <div className="flex items-center justify-between text-xs">
        <label className="inline-flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="h-3.5 w-3.5 rounded border-input" /> Lembrar de mim</label>
        <Link to="/recuperar-senha" className="text-primary hover:underline">Esqueci a senha</Link>
      </div>
      <AuthSubmit>Entrar</AuthSubmit>
    </AuthShell>
  );
}
