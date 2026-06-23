import { createFileRoute } from "@tanstack/react-router";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CertificateCard } from "@/components/cards/CertificateCard";
import { CERTIFICATES } from "@/lib/mock-data";

export const Route = createFileRoute("/certificados")({
  head: () => ({ meta: [{ title: "Certificados — FCIA Academy" }, { name: "description", content: "Seus certificados digitais validáveis." }] }),
  component: CertsPage,
});

function CertsPage() {
  return (
    <StudentShell>
      <PageHeader eyebrow="Validação pública" title="Seus certificados" description="Todos os certificados possuem código de validação único." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CERTIFICATES.map((c) => <CertificateCard key={c.id} c={c} />)}
      </div>
    </StudentShell>
  );
}
