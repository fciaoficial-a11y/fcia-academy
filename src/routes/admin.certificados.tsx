import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { AdminDataTable, type AdminColumn } from "@/components/admin/AdminDataTable";
import { adminCertificatesQuery, type Row } from "@/lib/admin-content.queries";
import { Award } from "lucide-react";

export const Route = createFileRoute("/admin/certificados")({
  head: () => ({ meta: [{ title: "Certificados — Admin FCIA Academy" }, { name: "description", content: "Certificados emitidos e validáveis." }] }),
  component: AdminCerts,
});

function pick(row: Row, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && v !== "") return String(v);
  }
  return "—";
}

function AdminCerts() {
  const certs = useQuery(adminCertificatesQuery());
  const total = certs.data?.count ?? 0;

  const columns: AdminColumn[] = [
    { key: "student", label: "Aluno", render: (r) => pick(r, ["student_name", "user_name", "userName", "studentName"]) },
    { key: "course", label: "Curso / Trilha", render: (r) => pick(r, ["course_title", "courseTitle", "course", "track_title"]) },
    { key: "code", label: "Código", render: (r) => <span className="font-mono text-xs">{pick(r, ["code", "validation_code"])}</span> },
    {
      key: "status",
      label: "Status",
      render: (r) => {
        const s = String(r["status"] ?? (r["issued_at"] || r["issuedAt"] ? "emitido" : "pendente"));
        return (
          <span className={"rounded-full px-2 py-0.5 text-xs " + (s.toLowerCase().includes("emit") ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
            {s}
          </span>
        );
      },
    },
    { key: "issued_at", label: "Emitido em", render: (r) => pick(r, ["issued_at", "issuedAt", "created_at"]) },
    {
      key: "preview",
      label: "Preview",
      render: (r) => {
        const id = r["id"];
        if (!id) return "—";
        return (
          <Link to="/certificado/$code" params={{ code: String(id) }} className="text-xs text-primary hover:underline">
            visualizar
          </Link>
        );
      },
    },
  ];

  return (
    <AdminShell>
      <PageHeader
        crumbs={[{ label: "Admin", to: "/admin" }, { label: "Certificados" }]}
        eyebrow="Admin"
        title="Certificados"
        description={`Total visíveis: ${total}`}
        actions={<span className="inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-xs text-foreground"><Award className="h-3.5 w-3.5" /> emissão automática</span>}
      />
      <AdminDataTable
        result={certs.data}
        isLoading={certs.isLoading}
        error={certs.error as Error | null}
        columns={columns}
        detailTitle={(r) => pick(r, ["course_title", "courseTitle", "course", "code"])}
        renderDetail={(r) => (
          <div className="space-y-3">
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 to-accent/10 p-5">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  <Award className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base text-foreground">{pick(r, ["course_title", "courseTitle", "course"])}</p>
                  <p className="text-xs text-muted-foreground">para {pick(r, ["student_name", "user_name"])}</p>
                </div>
              </div>
              <p className="mt-3 font-mono text-xs text-foreground">{pick(r, ["code", "validation_code"])}</p>
            </div>
            <pre className="max-h-[40vh] overflow-auto rounded-xl border border-border/60 bg-secondary/30 p-3 text-[11px] text-foreground">{JSON.stringify(r, null, 2)}</pre>
          </div>
        )}
      />
    </AdminShell>
  );
}
