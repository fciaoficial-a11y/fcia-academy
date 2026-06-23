import { createFileRoute, redirect } from "@tanstack/react-router";

// Rota legada de quiz mock — redireciona para o fluxo real de provas.
export const Route = createFileRoute("/quiz/$id")({
  beforeLoad: () => {
    throw redirect({ to: "/meus-cursos" });
  },
  component: () => null,
});
