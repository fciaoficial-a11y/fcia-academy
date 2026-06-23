import { Award, ShieldCheck, Sparkles } from "lucide-react";
import type { Certificate } from "@/lib/mock-data";

interface CertificateViewerProps {
  cert: Certificate;
  studentName: string;
}

export function CertificateViewer({ cert, studentName }: CertificateViewerProps) {
  const issued = new Date(cert.issuedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <article className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/60 to-background p-8 backdrop-blur-xl ring-glow sm:p-12">
      <div className="absolute inset-0 tech-grid opacity-20" aria-hidden />
      <div className="absolute -left-16 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" aria-hidden />
      <div className="absolute -right-16 top-1/3 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden />

      <div className="relative z-10 grid gap-8 text-center">
        <header className="flex flex-col items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <Award className="h-7 w-7" />
          </span>
          <span className="eyebrow text-primary">FCIA Academy · Certificado</span>
          <h1 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">Certificado de Conclusão</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Certificamos que o aluno abaixo concluiu com aproveitamento o curso indicado, cumprindo a carga horária e a avaliação final.
          </p>
        </header>

        <div className="mx-auto max-w-2xl space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Aluno</p>
          <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{studentName}</p>
        </div>

        <div className="mx-auto max-w-2xl space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curso</p>
          <p className="font-display text-xl font-semibold text-gradient sm:text-2xl">{cert.courseTitle}</p>
        </div>

        <dl className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="Carga horária" value={`${cert.hours}h`} />
          <Field label="Aproveitamento" value={`${cert.score}%`} />
          <Field label="Emitido em" value={issued} />
          <Field label="Validação" value={cert.code} mono />
        </dl>

        <footer className="mt-2 flex flex-col items-center gap-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Validável publicamente em fcia.academy/validar
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Documento gerado pela FCIA Academy
          </span>
        </footer>
      </div>
    </article>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-foreground ${mono ? "font-mono text-xs" : ""}`}>{value}</p>
    </div>
  );
}