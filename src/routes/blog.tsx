import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — FCIA Academy" },
      { name: "description", content: "Conteúdo, tutoriais e bastidores da FCIA Academy." },
    ],
  }),
  component: () => <Outlet />,
});