import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Clock, Download, Linkedin, Share2, ShieldCheck } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { CertificateCard } from "@/components/cards/CertificateCard";
import { CERTIFICATES, COURSES } from "@/lib/mock-data";

export const Route = createFileRoute("/certificados")({
  head: () => ({ meta: [{ title: "Certificados — FCIA Academy" }, { name: "description", content: "Seus certificados digitais validáveis." }] }),
  component: CertsPage,
});

function CertsPage() {
  const pending = COURSES.filter((c) => c.progress >= 50 && c.progress < 100);

  return (
    <StudentShell>
      <PageHeader
        eyebrow="Validação pública"
        title="Seus certificados"
        description="Todos os certificados possuem código único, são vitalícios e compatíveis com LinkedIn."
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Stat icon={Award} label="Emitidos" value={String(CERTIFICATES.length)} />
        <Stat icon={Clock} label="Em andamento" value={String(pending.length)} />
        <Stat icon={ShieldCheck} label="Status" value="Todos válidos" />
      </section>

      {/* Emitidos */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Certificados emitidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CERTIFICATES.map((c) => (
            <div key={c.id} className="space-y-3">
              <CertificateCard c={c} />
              <div className="flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary">
                  <Linkedin className="h-3 w-3" /> LinkedIn
                </button>
                <button className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-secondary">
                  <Share2 className="h-3 w-3" /> Compartilhar
                </button>
                <button className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-[11px] font-medium text-primary-foreground ring-glow">
                  <Download className="h-3 w-3" /> PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pendentes */}
      <section className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">Certificados pendentes</h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
            Nenhum certificado pendente — conclua um curso para emitir o próximo.
          </p>
        ) : (
          <ul className="space-y-2">
            {pending.map((c) => (
              <li key={c.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.progress}% concluído · {c.hours}h</p>
                </div>
                <Link to="/curso/$slug" params={{ slug: c.slug }} className="shrink-0 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground ring-glow">
                  Continuar
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Validação info */}
      <section className="rounded-3xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold text-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" /> Como funciona a validação
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada certificado tem um código único exposto em uma URL pública: <span className="font-mono text-foreground">fcia.academy/validar/&lt;código&gt;</span>.
          Recrutadores e clientes podem validar a autenticidade em segundos.
        </p>
      </section>
    </StudentShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Award; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xl">
      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <p className="mt-1 font-display text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
