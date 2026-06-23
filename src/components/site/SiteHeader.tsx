import { Link } from "@tanstack/react-router";
import { Sparkles, Menu, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { hash: "trilhas", label: "Trilhas" },
  { hash: "beneficios", label: "Por que FCIA" },
  { hash: "faq", label: "FAQ" },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <header className={cn("sticky top-0 z-50 w-full glass border-b border-border/60", className)}>
      <div className="mx-auto grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:flex sm:h-16 sm:max-w-7xl sm:justify-between sm:px-6 sm:py-0">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="text-[10px] tracking-[0.18em] font-semibold text-muted-foreground">FCIA</span>
            <span className="truncate font-display text-base font-semibold tracking-tight text-foreground">Academy</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link key={item.hash} to="/" hash={item.hash}
              className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link to="/vitrine" className="hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-medium text-primary-foreground ring-glow transition-transform hover:-translate-y-0.5 sm:inline-flex">
            Explorar vitrine <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-full bg-card/60 ring-1 ring-inset ring-border md:hidden" aria-label="Menu">
            <Menu className="h-4 w-4 text-foreground" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border/60 px-4 py-3 md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <li key={item.hash}>
                <Link to="/" hash={item.hash} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-2 text-sm text-foreground hover:bg-secondary/60">{item.label}</Link>
              </li>
            ))}
            <li className="mt-2 border-t border-border/60 pt-3">
              <Link to="/vitrine" onClick={() => setOpen(false)} className="block w-full rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-center text-sm font-medium text-primary-foreground ring-glow">Explorar vitrine</Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
