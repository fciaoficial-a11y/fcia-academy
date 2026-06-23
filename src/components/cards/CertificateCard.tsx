import type { Certificate } from "@/lib/mock-data";
import { Link } from "@tanstack/react-router";
import { Award, Download } from "lucide-react";

export function CertificateCard({ c }: { c: Certificate }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <Award className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-base font-semibold text-foreground">{c.courseTitle}</h3>
          <p className="text-xs text-muted-foreground">Código <span className="font-mono text-foreground">{c.code}</span></p>
          <p className="text-xs text-muted-foreground">Emitido em {c.issuedAt} · {c.hours}h · nota {c.score}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/certificado/$code" params={{ code: c.id }} className="rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary">Ver</Link>
        <button className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-xs font-medium text-primary-foreground ring-glow">
          <Download className="h-3 w-3" /> PDF
        </button>
      </div>
    </div>
  );
}
