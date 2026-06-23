import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { Sparkles, Wand2 } from "lucide-react";

export const Route = createFileRoute("/admin/ai-studio")({
  head: () => ({ meta: [{ title: "AI Studio — Admin FCIA Academy" }, { name: "description", content: "Geração assistida de conteúdo educacional." }] }),
  component: AiStudio,
});

function AiStudio() {
  return (
    <AdminShell>
      <PageHeader crumbs={[{ label: "Admin", to: "/admin" }, { label: "AI Studio" }]} eyebrow="AI Studio" title="Geração de conteúdo" description="Gere cursos, módulos e questões com IA assistida. Tudo entra como rascunho." />

      <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl glow-accent">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Sparkles className="h-5 w-5" /></span>
            <h3 className="font-display text-base font-semibold text-foreground">Novo conteúdo</h3>
          </div>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground">Tipo</span>
            <select className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground">
              <option>Curso completo</option><option>Módulo</option><option>Questões de quiz</option>
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-foreground">Briefing</span>
            <textarea rows={5} placeholder="Descreva o tema, público e profundidade desejada…" className="w-full rounded-xl border border-input bg-background/60 p-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring/40" />
          </label>
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-5 py-2.5 text-sm font-medium text-primary-foreground ring-glow">
            <Wand2 className="h-4 w-4" /> Gerar rascunho
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="font-display text-base font-semibold text-foreground">Jobs recentes</h3>
          {[
            { title: "Curso: Liderança Técnica", status: "Pronto p/ revisão", at: "há 2h" },
            { title: "10 questões: React Hooks", status: "Em geração", at: "há 12 min" },
            { title: "Módulo: SQL Joins", status: "Publicado", at: "ontem" },
          ].map((j, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
              <p className="text-sm font-medium text-foreground">{j.title}</p>
              <p className="text-xs text-muted-foreground">{j.status} · {j.at}</p>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
