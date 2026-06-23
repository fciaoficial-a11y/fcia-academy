import { createFileRoute, notFound } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CertificateViewer } from "@/components/learning/CertificateViewer";
import { CERTIFICATES, STUDENT_PROFILE } from "@/lib/mock-data";
import { Download, Share2 } from "lucide-react";

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
      <CertificateViewer cert={cert} studentName={STUDENT_PROFILE.name} />
    </StudentShell>
  );
}
