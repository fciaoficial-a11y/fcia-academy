import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const COLUMNS = [
  { title: "Plataforma", items: [
    { label: "Trilhas", to: "/trilhas" },
    { label: "Catálogo", to: "/catalogo" },
    { label: "Planos", to: "/plano" },
  ]},
  { title: "Empresa", items: [
    { label: "Sobre", to: "/sobre" },
    { label: "Contato", to: "/contato" },
    { label: "FAQ", to: "/faq" },
  ]},
  { title: "Conta", items: [
    { label: "Entrar", to: "/login" },
    { label: "Cadastrar", to: "/cadastro" },
    { label: "Recuperar senha", to: "/recuperar-senha" },
  ]},
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">FCIA Academy</span>
            </div>
            <p className="text-sm text-muted-foreground">Educação online com trilhas guiadas, gamificação e certificados validáveis.</p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="space-y-2">
                {col.items.map((it) => (
                  <li key={it.label}>
                    <Link to={it.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{it.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} FCIA Academy. Todos os direitos reservados.</p>
          <p>Sprint 2 · Estrutura navegável — Mock data</p>
        </div>
      </div>
    </footer>
  );
}
