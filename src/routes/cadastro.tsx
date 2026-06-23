import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell, AuthInput, AuthSubmit } from "@/components/auth/AuthShell";

export const Route = createFileRoute("/cadastro")({
  head: () => ({ meta: [{ title: "Cadastro — FCIA Academy" }, { name: "description", content: "Crie sua conta gratuita na FCIA Academy." }] }),
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <AuthShell title="Crie sua conta" subtitle="Comece grátis. Sem cartão." footer={<>Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link></>}>
      <AuthInput label="Nome completo" placeholder="Seu nome" />
      <AuthInput label="E-mail" type="email" placeholder="voce@email.com" />
      <AuthInput label="Senha" type="password" placeholder="Mínimo 8 caracteres" />
      <AuthSubmit>Criar conta</AuthSubmit>
    </AuthShell>
  );
}
