import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-surface/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 text-center sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-foreground">FCIA Academy</span>
        </Link>

        <Link
          to="/vitrine"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5"
        >
          Explorar vitrine <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} FCIA Academy · Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
