import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CertificateCard } from "@/components/cards/CertificateCard";
import { CERTIFICATES } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/certificados")({
  head: () => ({ meta: [{ title: "Certificados — Admin FCIA Academy" }, { name: "description", content: "Certificados emitidos e validáveis." }] }),
  component: AdminCerts,
});

function AdminCerts() {
  return (
    <AdminShell>
      <PageHeader crumbs={[{ label: "Admin", to: "/admin" }, { label: "Certificados" }]} eyebrow="Admin" title="Certificados emitidos" description="Total: 9.812 · Esta semana: +312" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CERTIFICATES.map((c) => <CertificateCard key={c.id} c={c} />)}
      </div>
    </AdminShell>
  );
}
