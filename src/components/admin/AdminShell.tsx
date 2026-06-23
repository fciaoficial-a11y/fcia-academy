import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Map, BookOpen, Layers, HelpCircle, Award, Users, Sparkles, Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SearchInput } from "@/components/shared/SearchInput";
import { ViewAsSwitch } from "@/components/auth/ViewAsSwitch";

const ITEMS = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true as boolean | undefined },
  { to: "/admin/trilhas", label: "Trilhas", icon: Map, exact: undefined as boolean | undefined },
  { to: "/admin/cursos", label: "Cursos", icon: BookOpen, exact: undefined as boolean | undefined },
  { to: "/admin/modulos", label: "Módulos", icon: Layers, exact: undefined as boolean | undefined },
  { to: "/admin/questoes", label: "Questões", icon: HelpCircle, exact: undefined as boolean | undefined },
  { to: "/admin/certificados", label: "Certificados", icon: Award, exact: undefined as boolean | undefined },
  { to: "/admin/usuarios", label: "Usuários", icon: Users, exact: undefined as boolean | undefined },
  { to: "/admin/ai-studio", label: "AI Studio", icon: Sparkles, exact: undefined as boolean | undefined },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="relative flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/80 backdrop-blur-xl lg:block">
        <div className="flex h-full flex-col p-4">
          <Link to="/" className="flex items-center gap-2 px-2 py-1">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent text-primary-foreground ring-glow">
              <Shield className="h-4 w-4" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[10px] tracking-[0.18em] font-semibold text-muted-foreground">FCIA</span>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">Admin</span>
            </span>
          </Link>
          <nav className="mt-6 flex flex-col gap-1">
            {ITEMS.map(({ to, label, icon: Icon, exact }) => {
              const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
              return (
                <Link key={to} to={to} className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active ? "bg-secondary text-foreground ring-1 ring-inset ring-primary/30" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                )}>
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border/60 bg-background/70 px-4 py-3 backdrop-blur-xl sm:flex sm:px-6">
          <div className="min-w-0 flex-1"><SearchInput placeholder="Buscar no admin…" /></div>
          <div className="flex shrink-0 items-center gap-2">
            <ViewAsSwitch />
            <Link to="/dashboard" className="rounded-full bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary">Sair do admin</Link>
          </div>
        </header>
        <main className="flex-1 px-4 pb-10 pt-6 sm:px-6">
          <div className="mx-auto w-full max-w-7xl space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
