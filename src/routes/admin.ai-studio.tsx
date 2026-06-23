import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/ai-studio")({
  head: () => ({
    meta: [
      { title: "AI Studio — Admin FCIA Academy" },
      { name: "description", content: "Geração assistida de conteúdo educacional." },
    ],
  }),
  component: () => <Outlet />,
});