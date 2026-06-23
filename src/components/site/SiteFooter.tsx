import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const COLUMNS = [
  { title: "Navegação", items: [
    { label: "Vitrine", to: "/vitrine" },
    { label: "FAQ", to: "/faq" },
    { label: "Contato", to: "/contato" },
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
        <div className="mb-10 flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground"><Sparkles className="h-4 w-4" /></span>
          <span className="font-display text-base font-semibold tracking-tight text-foreground">FCIA Academy</span>
        </div>
        <div className="grid gap-10 md:grid-cols-2 md:divide-x md:divide-border/60">
          {COLUMNS.map((col, i) => (
            <div key={col.title} className={i === 1 ? "space-y-3 md:pl-10" : "space-y-3 md:pr-10"}>
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
