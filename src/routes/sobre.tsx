import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/cards/StatCard";
import { Users, BookOpen, Award, Globe } from "lucide-react";

export const Route = createFileRoute("/sobre")({
  head: () => ({ meta: [{ title: "Sobre — FCIA Academy" }, { name: "description", content: "Quem somos, missão e impacto da FCIA Academy." }] }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <AppShell>
      <section className="mx-auto max-w-5xl space-y-10 px-4 py-12 sm:px-6">
        <PageHeader eyebrow="Sobre nós" title="Educação que mede impacto." description="Construímos uma plataforma premium para alunos e empresas que levam aprendizado a sério." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Alunos" value="12.430" icon={Users} />
          <StatCard label="Cursos" value="84" icon={BookOpen} />
          <StatCard label="Certificados emitidos" value="9.812" icon={Award} />
          <StatCard label="Países" value="22" icon={Globe} />
        </div>
        <article className="prose prose-invert max-w-none rounded-3xl border border-border/60 bg-card/60 p-8 text-sm leading-relaxed text-muted-foreground backdrop-blur-xl">
          <p>A FCIA Academy nasceu da convicção de que <span className="text-foreground">aprendizado contínuo</span> é a maior vantagem competitiva de profissionais e empresas modernas.</p>
          <p className="mt-4">Combinamos trilhas curatoriais, gamificação ativa e certificados públicos validáveis para entregar uma experiência mensurável de ponta a ponta.</p>
        </article>
      </section>
    </AppShell>
  );
}
