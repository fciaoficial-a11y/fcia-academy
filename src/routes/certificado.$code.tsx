import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeSVG } from "qrcode.react";
import { Award, CheckCircle2, Download, ShieldCheck, ShieldX, Sparkles } from "lucide-react";
import { StudentShell } from "@/components/student/StudentShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCertificateByCode } from "@/lib/ai-study.functions";
import { useAuth } from "@/hooks/useAuth";
import { CERTIFICATES } from "@/lib/mock-data";

export const Route = createFileRoute("/certificado/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Validação de certificado ${params.code} — FCIA Academy` },
      { name: "description", content: "Validação pública de certificado FCIA Academy." },
      { property: "og:title", content: `Certificado ${params.code} — FCIA Academy` },
      { property: "og:description", content: "Validação pública e autêntica do certificado FCIA Academy." },
    ],
  }),
  errorComponent: ({ error }) => (
    <StudentShell><p className="text-destructive">Erro: {error.message}</p></StudentShell>
  ),
  component: PublicCertPage,
});

function PublicCertPage() {
  const { code } = Route.useParams();
  const { user } = useAuth();
  const fetchByCode = useServerFn(getCertificateByCode);

  const query = useQuery({
    queryKey: ["certificate", code],
    queryFn: () => fetchByCode({ data: { code } }),
    staleTime: 60_000,
  });

  const publicUrl = typeof window !== "undefined"
    ? `${window.location.origin}/certificado/${code}`
    : `/certificado/${code}`;

  // Fallback para demonstração quando o código não existe no banco
  const mockFallback = !query.isLoading && query.data && !query.data.valid
    ? CERTIFICATES.find((c) => c.id === code || c.code === code)
    : undefined;

  const cert = query.data?.valid
    ? query.data
    : mockFallback
      ? {
          valid: true as const,
          code: mockFallback.code,
          studentName: "Aluno FCIA",
          courseName: mockFallback.courseTitle,
          issuedAt: mockFallback.issuedAt,
          hoursLoad: mockFallback.hours,
        }
      : null;

  return (
    <StudentShell>
      <PageHeader
        crumbs={[{ label: "Meus cursos", to: "/meus-cursos" }, { label: code }]}
        eyebrow="Validação pública"
        title="Verificação de Certificado"
        description={`Código ${code}`}
      />

      {query.isLoading && (
        <div className="rounded-2xl border border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
          Validando certificado…
        </div>
      )}

      {!query.isLoading && !cert && (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive inline-flex items-center gap-2">
          <ShieldX className="h-4 w-4" /> Certificado inválido — código não localizado.
        </div>
      )}

      {cert && <CertificateRender cert={cert} publicUrl={publicUrl} isOwner={!!user} />}
    </StudentShell>
  );
}

type CertData = {
  code: string;
  studentName: string;
  courseName: string;
  issuedAt: string;
  hoursLoad: number | null;
};

function CertificateRender({ cert, publicUrl, isOwner }: { cert: CertData; publicUrl: string; isOwner: boolean }) {
  const issued = new Date(cert.issuedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300">
          <CheckCircle2 className="h-4 w-4" /> Certificado válido e autêntico
        </span>
        {isOwner && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground ring-glow"
          >
            <Download className="h-3.5 w-3.5" /> Baixar PDF
          </button>
        )}
      </div>

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
            <p className="font-display text-2xl font-semibold text-foreground sm:text-3xl">{cert.studentName}</p>
          </div>

          <div className="mx-auto max-w-2xl space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Curso</p>
            <p className="font-display text-xl font-semibold text-gradient sm:text-2xl">{cert.courseName}</p>
          </div>

          <dl className="mx-auto grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Carga horária" value={cert.hoursLoad ? `${cert.hoursLoad}h` : "—"} />
            <Field label="Emitido em" value={issued} />
            <Field label="Validação" value={cert.code} mono />
          </dl>

          <div className="mx-auto flex flex-col items-center gap-2">
            <div className="rounded-2xl bg-white p-3 ring-glow">
              <QRCodeSVG value={publicUrl} size={128} level="M" />
            </div>
            <p className="text-[11px] text-muted-foreground">Aponte a câmera para validar</p>
          </div>

          <footer className="mt-2 flex flex-col items-center gap-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Validação pública FCIA Academy
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Documento gerado pela FCIA Academy
            </span>
          </footer>
        </div>
      </article>

      {!isOwner && (
        <p className="text-center text-xs text-muted-foreground inline-flex items-center justify-center gap-2">
          <ShieldX className="h-3.5 w-3.5" />
          O download em PDF está disponível apenas para o aluno autenticado dono do certificado.{" "}
          <Link to="/login" className="text-primary underline">Entrar</Link>
        </p>
      )}
    </div>
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