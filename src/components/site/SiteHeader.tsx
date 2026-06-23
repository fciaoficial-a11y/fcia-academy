import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Visão" },
  { to: "/", label: "Trilhas" },
  { to: "/", label: "Cursos" },
  { to: "/", label: "Turmas" },
  { to: "/", label: "Empresas" },
  { to: "/", label: "Planos" },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full glass border-b border-border/60",
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[10px] tracking-[0.18em] font-semibold text-muted-foreground">
              FCIA
            </span>
            <span className="font-display text-base font-semibold tracking-tight text-foreground">
              Academy
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Entrar
          </Link>
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5"
          >
            Começar
          </Link>
        </div>
      </div>
    </header>
  );
}