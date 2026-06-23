import { createFileRoute, notFound } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AIStudioTool } from "@/components/admin/AIStudioTool";
import { AI_STUDIO_TOOLS } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/ai-studio/$tool")({
  head: ({ params }) => {
    const t = AI_STUDIO_TOOLS.find((x) => x.slug === params.tool);
    return {
      meta: [
        { title: t ? `${t.title} — AI Studio FCIA Academy` : "AI Studio — FCIA Academy" },
        { name: "description", content: t?.description ?? "Geração assistida de conteúdo." },
      ],
    };
  },
  loader: ({ params }) => {
    const tool = AI_STUDIO_TOOLS.find((x) => x.slug === params.tool);
    if (!tool) throw notFound();
    return { tool };
  },
  notFoundComponent: () => (
    <AdminShell>
      <p className="text-muted-foreground">Ferramenta de AI Studio não encontrada.</p>
    </AdminShell>
  ),
  errorComponent: ({ error }) => (
    <AdminShell>
      <p className="text-destructive">Erro: {error.message}</p>
    </AdminShell>
  ),
  component: AiStudioToolPage,
});

function AiStudioToolPage() {
  const { tool } = Route.useLoaderData();
  return (
    <AdminShell>
      <PageHeader
        crumbs={[
          { label: "Admin", to: "/admin" },
          { label: "AI Studio", to: "/admin/ai-studio" },
          { label: tool.title },
        ]}
        eyebrow="AI Studio"
        title={tool.title}
        description={tool.description}
      />
      <AIStudioTool tool={tool} />
    </AdminShell>
  );
}