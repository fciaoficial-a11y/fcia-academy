import { createFileRoute, notFound } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CERTIFICATES } from "@/lib/mock-data";
import { Award, Download, Share2 } from "lucide-react";

export const Route = createFileRoute("/certificado/$id")({
  head: ({ params }) => {
    const c = CERTIFICATES.find((x) => x.id === params.id);
    return { meta: [
      { title: c ? `Certificado: ${c.courseTitle} — FCIA Academy` : "Certificado — FCIA Academy" },
      { name: "description", content: "Certificado digital validável da FCIA Academy." },
    ] };
  },
  loader: ({ params }) => {
    const cert = CERTIFICATES.find((x) => x.id === params.id);
    if (!cert) throw notFound();
    return { cert };
  },
  notFoundComponent: () => <StudentShell><p className="text-muted-foreground">Certificado não encontrado.</p></StudentShell>,
  errorComponent: ({ error }) => <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>,
  component: CertDetail,
});

function CertDetail() {
  const { cert } = Route.useLoaderData();
  return (
    <StudentShell>
      <PageHeader crumbs={[{ label: "Certificados", to: "/certificados" }, { label: cert.courseTitle }]} eyebrow="Validável" title={cert.courseTitle} description={`Código ${cert.code}`} actions={
        <>
          <button className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground"><Share2 className="h-3.5 w-3.5" /> Compartilhar</button>
          <button className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground ring-glow"><Download className="h-3.5 w-3.5" /> Baixar PDF</button>
        </>
      } />

      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/80 p-10 text-center backdrop-blur-xl glow-primary">
        <div className="absolute inset-0 tech-grid opacity-20" />
        <div className="relative space-y-4">
          <span className="grid mx-auto h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Award className="h-7 w-7" /></span>
          <span className="eyebrow text-primary">FCIA Academy</span>
          <h2 className="font-display text-3xl font-semibold text-foreground">Certificado de Conclusão</h2>
          <p className="text-sm text-muted-foreground">Certificamos que</p>
          <p className="font-display text-2xl font-semibold text-foreground">Marina Souza</p>
          <p className="text-sm text-muted-foreground">concluiu o curso</p>
          <p className="font-display text-xl text-foreground">{cert.courseTitle}</p>
          <p className="text-xs text-muted-foreground">com carga horária de {cert.hours}h e nota final {cert.score}/100, emitido em {cert.issuedAt}.</p>
          <div className="pt-6">
            <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-mono text-xs text-foreground">{cert.code}</span>
          </div>
        </div>
      </section>
    </StudentShell>
  );
}
